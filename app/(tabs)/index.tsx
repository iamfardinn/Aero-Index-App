import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { AQICard } from '@/components/AQICard';
import { PM25Chart } from '@/components/PM25Chart';
import { PMBadgeRow } from '@/components/PMBadgeRow';
import { SourceCard } from '@/components/SourceCard';
import { SensorCard } from '@/components/SensorCard';
import { COLORS } from '@/data';
import { useBLEContext } from '@/context/BLEContext';
import { auth } from '@/services/firebase';

// AQI is approximated from PM2.5 (simplified US EPA formula for display)
function pm25ToAqi(pm25: number): number {
  if (pm25 <= 12)    return Math.round((50  / 12)   * pm25);
  if (pm25 <= 35.4)  return Math.round(50  + (50  / 23.4)  * (pm25 - 12));
  if (pm25 <= 55.4)  return Math.round(100 + (50  / 20)    * (pm25 - 35.4));
  if (pm25 <= 150.4) return Math.round(150 + (50  / 95)    * (pm25 - 55.4));
  if (pm25 <= 250.4) return Math.round(200 + (100 / 100)   * (pm25 - 150.4));
  return Math.round(300 + (100 / 149.6) * (pm25 - 250.4));
}

export default function DashboardScreen() {
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const [chartWidth, setChartWidth] = useState(0);
  const { status, data, history, connect, disconnect, resetBaseline } = useBLEContext();

  const isConnected = status === 'connected';
  const isScanning  = status === 'scanning';
  const hasData     = data !== null;

  const aqi = hasData ? pm25ToAqi(data!.pm25) : 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header />

      {/* BLE Connection bar */}
      <View style={[styles.bleBar, isConnected ? styles.bleConnected : styles.bleDisconnected]}>
        <Text style={styles.bleBarText}>
          {isScanning   ? '🔍 Scanning for AeroContext device…'  :
           isConnected  ? '🟢 Connected to AeroContext'           :
           status === 'error'      ? '❌ Connection failed — tap to retry'  :
           status === 'unavailable'? '⚠️ BLE unavailable (Expo Go build)'   :
                                     '⚪ Not connected — tap Connect'}
        </Text>
        <TouchableOpacity
          onPress={isConnected ? disconnect : connect}
          style={[styles.bleBtn, isScanning && styles.bleBtnScanning]}
          disabled={isScanning}
        >
          <Text style={styles.bleBtnText}>
            {isConnected ? 'Disconnect' : isScanning ? 'Scanning…' : 'Connect'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => auth.signOut()}
          style={[styles.bleBtn, { backgroundColor: '#ef4444' }]}
        >
          <Text style={styles.bleBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* ── No data state ── */}
      {!hasData ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyTitle}>No Sensor Data</Text>
          <Text style={styles.emptySubtitle}>
            {isScanning
              ? 'Searching for your AeroContext device…'
              : 'Connect to your ESP32 via Bluetooth\nto see live air quality readings.'}
          </Text>
          {!isConnected && !isScanning && (
            <TouchableOpacity style={styles.connectBtn} onPress={connect}>
              <Text style={styles.connectBtnText}>Connect to ESP32</Text>
            </TouchableOpacity>
          )}
          {isScanning && (
            <View style={styles.scanningDots}>
              <Text style={styles.scanningText}>Looking for "AeroContext"…</Text>
            </View>
          )}
        </View>
      ) : (
        /* ── Live data dashboard ── */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Spike alert banner — tappable → detail screen */}
          {data!.isSpike && (
            <TouchableOpacity
              style={styles.spikeBanner}
              activeOpacity={0.8}
              onPress={() => router.push({
                pathname: '/alert-detail',
                params: {
                  pm25:     String(data!.pm25),
                  delta:    String(data!.delta),
                  baseline: String(data!.baseline),
                  source:   data!.source,
                  time:     'Just now',
                },
              })}
            >
              <Text style={styles.spikeBannerText}>
                ⚠️  Spike detected! +{data!.delta} µg/m³ — {data!.source}
              </Text>
              <Text style={styles.spikeBannerCta}>View details →</Text>
            </TouchableOpacity>
          )}

          {/* AQI hero card */}
          <View style={styles.gap} />
          <AQICard
            aqi={aqi}
            pm25={data!.pm25}
            isSpike={data!.isSpike}
            delta={data!.delta}
            baseline={data!.baseline}
          />

          {/* Secondary sensor cards: temp + humidity */}
          <View style={styles.gap} />
          <View style={styles.sensorRow}>
            <SensorCard
              label="Temperature"
              value={data!.temp.toFixed(1)}
              unit="°C"
              emoji="🌡️"
              delay={0}
            />
            <View style={{ width: 12 }} />
            <SensorCard
              label="Humidity"
              value={data!.humidity.toFixed(0)}
              unit="%"
              emoji="💧"
              delay={80}
              warn={data!.humidity > 70}
            />
          </View>

          {/* Pollutant badges */}
          <View style={styles.gap} />
          <PMBadgeRow data={data!} />

          {/* PM2.5 Chart — only shown once we have 2+ readings */}
          {history.length >= 2 && (
            <>
              <View style={styles.gap} />
              <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
                {chartWidth > 0 && <PM25Chart width={chartWidth} history={history} />}
              </View>
            </>
          )}

          {/* Source card */}
          <View style={styles.gap} />
          <SourceCard data={data!} />

          {/* Recalibration button */}
          <View style={styles.gap} />
          <TouchableOpacity
            style={styles.recalBtn}
            onPress={resetBaseline}
          >
            <Text style={styles.recalBtnText}>🔄  Reset Baseline</Text>
            <Text style={styles.recalBtnSub}>Clears buffer and restarts adaptive baseline</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.sky100 },
  bleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  bleConnected:    { backgroundColor: '#ecfdf5' },
  bleDisconnected: { backgroundColor: '#f1f5f9' },
  bleBarText: { fontSize: 12, fontWeight: '600', color: COLORS.slate600, flex: 1 },
  bleBtn: {
    backgroundColor: COLORS.sky900,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  bleBtnScanning: { backgroundColor: COLORS.slate400 },
  bleBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // ── Empty / no-data state ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 72, marginBottom: 8 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.sky900,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 22,
  },
  connectBtn: {
    marginTop: 12,
    backgroundColor: COLORS.sky900,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  connectBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  scanningDots: { marginTop: 8 },
  scanningText: { color: COLORS.slate400, fontSize: 13, fontWeight: '600' },

  // ── Dashboard ──
  scrollContent: { padding: 20, paddingBottom: 48 },
  spikeBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spikeBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    flex: 1,
  },
  spikeBannerCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d97706',
    marginLeft: 8,
  },
  gap: { height: 16 },
  sensorRow: { flexDirection: 'row' },
  recalBtn: {
    backgroundColor: COLORS.sky900,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  recalBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  recalBtnSub: {
    color: COLORS.slate300,
    fontSize: 12,
    marginTop: 4,
  },
});
