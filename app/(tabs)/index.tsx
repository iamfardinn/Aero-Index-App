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
  const { status, data, isDemo, connect, disconnect, resetBaseline } = useBLEContext();

  const aqi = pm25ToAqi(data.pm25);
  const isConnected = status === 'connected';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header />

      {/* BLE Connection bar */}
      <View style={[styles.bleBar, isConnected ? styles.bleConnected : styles.bleDisconnected]}>
        <Text style={styles.bleBarText}>
          {status === 'scanning'    ? '🔍 Scanning for AeroContext device…'  :
           isConnected              ? '🟢 Connected to AeroContext'           :
           status === 'error'       ? '❌ Connection failed — tap to retry'  :
                                      '⚪ Demo mode — tap to connect ESP32'}
        </Text>
        <TouchableOpacity
          onPress={isConnected ? disconnect : connect}
          style={styles.bleBtn}
        >
          <Text style={styles.bleBtnText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spike alert banner — tappable → detail screen */}
        {data.isSpike && (
          <TouchableOpacity
            style={styles.spikeBanner}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/alert-detail',
              params: {
                pm25:     String(data.pm25),
                delta:    String(data.delta),
                baseline: String(data.baseline),
                source:   data.source,
                time:     'Just now',
              },
            })}
          >
            <Text style={styles.spikeBannerText}>
              ⚠️  Spike detected! +{data.delta} µg/m³ — {data.source}
            </Text>
            <Text style={styles.spikeBannerCta}>View details →</Text>
          </TouchableOpacity>
        )}

        {/* AQI hero card */}
        <View style={styles.gap} />
        <AQICard
          aqi={aqi}
          pm25={data.pm25}
          isSpike={data.isSpike}
          delta={data.delta}
          baseline={data.baseline}
        />

        {/* Secondary sensor cards: temp + humidity */}
        <View style={styles.gap} />
        <View style={styles.sensorRow}>
          <SensorCard
            label="Temperature"
            value={data.temp.toFixed(1)}
            unit="°C"
            emoji="🌡️"
            delay={0}
          />
          <View style={{ width: 12 }} />
          <SensorCard
            label="Humidity"
            value={data.humidity.toFixed(0)}
            unit="%"
            emoji="💧"
            delay={80}
            warn={data.humidity > 70}  // high humidity skews PMS7003 readings
          />
        </View>

        {/* Pollutant badges */}
        <View style={styles.gap} />
        <PMBadgeRow />

        {/* PM2.5 Chart */}
        <View style={styles.gap} />
        <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
          {chartWidth > 0 && <PM25Chart width={chartWidth} />}
        </View>

        {/* Source card */}
        <View style={styles.gap} />
        <SourceCard />

        {/* Recalibration button */}
        <View style={styles.gap} />
        <TouchableOpacity
          style={[styles.recalBtn, !isConnected && styles.recalBtnDisabled]}
          onPress={resetBaseline}
          disabled={!isConnected}
        >
          <Text style={styles.recalBtnText}>
            🔄  Reset Baseline
          </Text>
          <Text style={styles.recalBtnSub}>
            {isConnected
              ? 'Clears buffer and restarts adaptive baseline'
              : 'Connect to device to reset baseline'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  bleBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
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
  recalBtnDisabled: { backgroundColor: COLORS.slate400 },
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
