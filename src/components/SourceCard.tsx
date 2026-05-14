import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, getLevel } from '../data';
import { SensorPayload } from '../services/useBLE';

interface Props {
  data: SensorPayload;
}

export function SourceCard({ data }: Props) {
  const level = getLevel(data.pm25);

  return (
    <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>🏭</Text>
        <View style={styles.headerText}>
          <Text style={styles.label}>IDENTIFIED SOURCE</Text>
          <Text style={styles.source}>{data.source || 'Unknown source'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Delta</Text>
          <Text style={[styles.statValue, { color: COLORS.spike }]}>↑ +{data.delta} µg/m³</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={[styles.statValue, { color: level.color }]}>{level.label}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Baseline</Text>
          <Text style={styles.statValue}>{data.baseline} µg/m³</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.spikeBorder,
    shadowColor: COLORS.spike,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 28 },
  headerText: { flex: 1 },
  label: {
    fontSize: 9, fontWeight: '700', color: COLORS.slate400,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  source: { fontSize: 14, fontWeight: '700', color: COLORS.slate700, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.slate100, marginVertical: 14 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 9, color: COLORS.slate400, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontSize: 13, fontWeight: '700', color: COLORS.slate700, marginTop: 3 },
});
