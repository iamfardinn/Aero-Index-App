import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { auth, db } from './firebase';

// ─── BLE UUIDs (must match ESP32-C3 firmware) ─────────────────────────────────
export const SERVICE_UUID      = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const SENSOR_CHAR_UUID  = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const COMMAND_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
export const DEVICE_NAME       = 'AeroContext';

// ─── Payload shape from ESP32 ─────────────────────────────────────────────────
export interface SensorPayload {
  pm25:      number;
  pm10:      number;
  temp:      number;
  humidity:  number;
  isSpike:   boolean;
  delta:     number;
  baseline:  number;
  source:    string;
}

export type BLEStatus = 'idle' | 'scanning' | 'connected' | 'disconnected' | 'error' | 'unavailable';

export interface BLEState {
  status:        BLEStatus;
  data:          SensorPayload | null;   // null = no real data yet
  history:       SensorPayload[];        // live rolling history buffer
  connect:       () => void;
  disconnect:    () => void;
  resetBaseline: () => void;
}

// Safe BleManager — returns null if native module not available (e.g. Expo Go)
function createManager(): BleManager | null {
  try {
    return new BleManager();
  } catch {
    return null;
  }
}

export function useBLE(): BLEState {
  const [status,  setStatus]  = useState<BLEStatus>('idle');
  const [data,    setData]    = useState<SensorPayload | null>(null);
  const [history, setHistory] = useState<SensorPayload[]>([]);
  const deviceRef  = useRef<Device | null>(null);
  // manager is created lazily and safely — null in Expo Go
  const managerRef = useRef<BleManager | null>(null);

  useEffect(() => {
    managerRef.current = createManager();
    if (!managerRef.current) {
      setStatus('unavailable');  // Expo Go / no native BLE module
    }
    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  // ── Request Android permissions ─────────────────────────────────────────────
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const apiLevel = parseInt(Platform.Version as string, 10);
    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results['android.permission.BLUETOOTH_SCAN']    === 'granted' &&
      results['android.permission.BLUETOOTH_CONNECT'] === 'granted'
    );
  }, []);

  // ── Parse incoming BLE characteristic value ──────────────────────────────────
  const wasSpikeRef = useRef(false);

  const handleNotification = useCallback(async (characteristic: Characteristic) => {
    if (!characteristic.value) return;
    try {
      const json = atob(characteristic.value);
      const payload: SensorPayload = JSON.parse(json);
      setData(payload);
      
      // Keep a rolling buffer of last 30 readings for the chart
      setHistory(prev => {
        const next = [...prev, payload];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });

      // ── Auto-save spike to Firestore ──
      // Only log it ONCE when the spike first starts, to prevent spamming the database
      if (payload.isSpike && !wasSpikeRef.current) {
        const user = auth.currentUser;
        if (user) {
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
          
          // Use our helper to get the readable level
          let levelStr = 'Unknown';
          if (payload.pm25 > 250.4) levelStr = 'Hazardous';
          else if (payload.pm25 > 150.4) levelStr = 'Very Unhealthy';
          else if (payload.pm25 > 55.4) levelStr = 'Unhealthy';
          
          await addDoc(collection(db, 'history'), {
            userId: user.uid,
            timestamp: serverTimestamp(),
            // Format time nicely for the UI (e.g. "Today · 14:30")
            time: `Today · ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            source: payload.source || 'Unknown source',
            delta: payload.delta,
            level: levelStr,
            pm25: payload.pm25
          });
        }
      }
      
      // Update the ref so we know if the spike is still ongoing
      wasSpikeRef.current = payload.isSpike;

    } catch {
      // ignore malformed packets
    }
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!managerRef.current) return;  // BLE unavailable (Expo Go)
    const hasPerms = await requestPermissions();
    if (!hasPerms) { 
      console.error('BLE Permissions denied');
      setStatus('error'); 
      return; 
    }

    setStatus('scanning');
    managerRef.current.startDeviceScan(null, null, async (error, device) => {
      if (error) { 
        console.error('BLE Scan Error:', error);
        setStatus('error'); 
        return; 
      }
      if (!device || device.name !== DEVICE_NAME) return;

      managerRef.current?.stopDeviceScan();
      try {
        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();
        deviceRef.current = connected;
        setStatus('connected');

        connected.monitorCharacteristicForService(
          SERVICE_UUID, SENSOR_CHAR_UUID,
          (err, char) => {
            if (err) { setStatus('disconnected'); setData(null); return; }
            if (char) handleNotification(char);
          },
        );

        connected.onDisconnected(() => {
          setStatus('disconnected');
          setData(null);
          deviceRef.current = null;
        });
      } catch (err) {
        console.error('BLE Connection Error:', err);
        setStatus('error');
      }
    });
  }, [requestPermissions, handleNotification]);

  // ── Disconnect ───────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    managerRef.current?.stopDeviceScan();
    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
    setStatus('idle');
    setData(null);
    setHistory([]);
  }, []);

  // ── Reset baseline ───────────────────────────────────────────────────────────
  const resetBaseline = useCallback(async () => {
    if (!deviceRef.current) return;
    try {
      await deviceRef.current.writeCharacteristicWithResponseForService(
        SERVICE_UUID, COMMAND_CHAR_UUID, btoa('R'),
      );
    } catch { /* silently fail */ }
  }, []);

  return { status, data, history, connect, disconnect, resetBaseline };
}
