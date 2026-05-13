import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, getLevel } from '../data';

interface Props {
  aqi:      number;
  pm25:     number;
  isSpike:  boolean;
  delta:    number;
  baseline: number;
}

export function AQICard({ aqi, pm25, isSpike, delta, baseline }: Props) {
  const level = getLevel(pm25);

  // Teal (normal) vs Amber (spike) — matches paper description
  const bgColor   = isSpike ? '#fffbeb' : '#ecfeff';
  const accentColor = isSpike ? '#d97706' : '#0891b2';

  return (
    <Animated.View
      entering={FadeInDown.duration(700).springify()}
      style={[styles.card, { borderColor: accentColor + '30', backgroundColor: bgColor }]}
    >
      {/* Top severity strip */}
      <View style={[styles.strip, { backgroundColor: isSpike ? '#d97706' : '#0891b2' }]} />

      {/* Spike context message */}
      {isSpike && (
        <View style={styles.spikeBar}>
          <Text style={styles.spikeEmoji}>⚠️</Text>
          <Text style={styles.spikeText}>
            +{delta} µg/m³ above baseline · {getLevel(pm25).label}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        {/* AQI */}
        <View style={styles.section}>
          <Text style={styles.metaLabel}>AQI INDEX</Text>
          <Text style={[styles.bigNumber, { color: level.color }]}>{aqi}</Text>
          <View style={[styles.badge, { backgroundColor: level.color + '18' }]}>
            <Text style={[styles.badgeText, { color: level.color }]}>{level.label}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* PM2.5 */}
        <View style={styles.section}>
          <Text style={styles.metaLabel}>PM2.5</Text>
          <Text style={[styles.bigNumber, { color: COLORS.spike }]}>{pm25}</Text>
          <Text style={styles.unit}>µg/m³</Text>
          <Text style={styles.baseline}>Baseline: {baseline}</Text>
        </View>
      </View>

      {/* AQI scale bar: green → yellow → orange → red → purple → maroon */}
      <View style={styles.scaleRow}>
        {['#10b981','#f59e0b','#f97316','#ef4444','#7c3aed','#6E1A37'].map((c, i) => (
          <View key={i} style={[styles.scaleBlock, { backgroundColor: c }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  strip: { height: 6 },
  spikeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  spikeEmoji: { fontSize: 16 },
  spikeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    flex: 1,
  },
  body: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: { flex: 1, alignItems: 'center' },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.slate400,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  divider: {
    width: 1,
    backgroundColor: COLORS.slate300,
    marginVertical: 8,
    alignSelf: 'stretch',
  },
  unit: {
    fontSize: 13,
    color: COLORS.slate500,
    fontWeight: '600',
    marginTop: 4,
  },
  baseline: {
    fontSize: 11,
    color: COLORS.slate400,
    marginTop: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    height: 6,
  },
  scaleBlock: { flex: 1 },
});
