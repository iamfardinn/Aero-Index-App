import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { AQICard } from '@/components/AQICard';
import { PM25Chart } from '@/components/PM25Chart';
import { PMBadgeRow } from '@/components/PMBadgeRow';
import { SpikeAlertBanner } from '@/components/SpikeAlertBanner';
import { SourceCard } from '@/components/SourceCard';
import { COLORS } from '@/data';

const CURRENT_PM25 = 190;
const CURRENT_AQI  = 240;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [chartWidth, setChartWidth] = useState(0);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert banner */}
        <SpikeAlertBanner />

        {/* AQI hero card */}
        <View style={styles.gap} />
        <AQICard aqi={CURRENT_AQI} pm25={CURRENT_PM25} />

        {/* Pollutant badges */}
        <View style={styles.gap} />
        <PMBadgeRow />

        {/* PM2.5 Chart — measures its own width via onLayout */}
        <View style={styles.gap} />
        <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
          {chartWidth > 0 && <PM25Chart width={chartWidth} />}
        </View>

        {/* Source card */}
        <View style={styles.gap} />
        <SourceCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.sky100 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  gap: { height: 16 },
});
