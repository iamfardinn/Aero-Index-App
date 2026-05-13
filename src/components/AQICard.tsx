import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, getLevel } from '../data';

interface Props { aqi: number; pm25: number }

export function AQICard({ aqi, pm25 }: Props) {
  const level = getLevel(pm25);

  return (
    <Animated.View entering={FadeInDown.duration(700).springify()} style={[styles.card, { borderColor: level.color + '30' }]}>
      {/* Top severity strip */}
      <View style={[styles.strip, { backgroundColor: level.color }]} />

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
          <Text style={styles.who}>WHO limit: 15</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  strip: { height: 5, width: '100%' },
  body: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  section: { alignItems: 'center', flex: 1 },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate400,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 64,
    letterSpacing: -2,
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  unit: { fontSize: 13, color: COLORS.slate500, fontWeight: '600', marginTop: 2 },
  who: { fontSize: 10, color: COLORS.slate400, marginTop: 4 },
  divider: { width: 1, height: 80, backgroundColor: COLORS.slate300 },
});
