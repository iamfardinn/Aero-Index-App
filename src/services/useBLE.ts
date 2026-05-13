import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';

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

const DEFAULT_PAYLOAD: SensorPayload = {
  pm25: 190, pm10: 210, temp: 28.5, humidity: 65,
  isSpike: true, delta: 40, baseline: 150,
  source: 'Heavy traffic / construction dust',
};

export type BLEStatus = 'idle' | 'scanning' | 'connected' | 'disconnected' | 'error';

export interface BLEState {
  status:      BLEStatus;
  data:        SensorPayload;
  isDemo:      boolean;  // true when using static demo data (not connected)
  connect:     () => void;
  disconnect:  () => void;
  resetBaseline: () => void;
}

const manager = new BleManager();

export function useBLE(): BLEState {
  const [status,  setStatus]  = useState<BLEStatus>('idle');
  const [data,    setData]    = useState<SensorPayload>(DEFAULT_PAYLOAD);
  const [isDemo,  setIsDemo]  = useState(true);
  const deviceRef = useRef<Device | null>(null);

  // ── Request Android permissions ────────────────────────────────────────────
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

  // ── Parse incoming BLE characteristic value ───────────────────────────────
  const handleNotification = useCallback((characteristic: Characteristic) => {
    if (!characteristic.value) return;
    try {
      const json = atob(characteristic.value);
      const payload: SensorPayload = JSON.parse(json);
      setData(payload);
      setIsDemo(false);
    } catch {
      // ignore malformed packets
    }
  }, []);

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const hasPerms = await requestPermissions();
    if (!hasPerms) { setStatus('error'); return; }

    setStatus('scanning');
    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) { setStatus('error'); return; }
      if (!device || device.name !== DEVICE_NAME) return;

      manager.stopDeviceScan();
      try {
        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();
        deviceRef.current = connected;
        setStatus('connected');

        // Subscribe to sensor notifications
        connected.monitorCharacteristicForService(
          SERVICE_UUID,
          SENSOR_CHAR_UUID,
          (err, char) => {
            if (err) { setStatus('disconnected'); setIsDemo(true); return; }
            if (char) handleNotification(char);
          },
        );

        // Handle disconnect
        connected.onDisconnected(() => {
          setStatus('disconnected');
          setIsDemo(true);
          deviceRef.current = null;
        });
      } catch {
        setStatus('error');
      }
    });
  }, [requestPermissions, handleNotification]);

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    manager.stopDeviceScan();
    if (deviceRef.current) {
      await deviceRef.current.cancelConnection();
      deviceRef.current = null;
    }
    setStatus('idle');
    setIsDemo(true);
  }, []);

  // ── Reset baseline (sends 'R' command over BLE) ───────────────────────────
  const resetBaseline = useCallback(async () => {
    if (!deviceRef.current) return;
    try {
      const cmd = btoa('R');  // 'R' = reset command, matches firmware
      await deviceRef.current.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        cmd,
      );
    } catch {
      // silently fail if not connected
    }
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => { manager.destroy(); };
  }, []);

  return { status, data, isDemo, connect, disconnect, resetBaseline };
}
