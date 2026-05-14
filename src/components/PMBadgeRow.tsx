import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../data';
import { SensorPayload } from '../services/useBLE';

interface BadgeDef {
  label: string;
  value: string;
  unit: string;
  color: string;
}

function buildBadges(data: SensorPayload): BadgeDef[] {
  return [
    { label: 'PM2.5', value: data.pm25.toFixed(1),     unit: 'µg/m³', color: COLORS.spike },
    { label: 'PM10',  value: data.pm10.toFixed(1),     unit: 'µg/m³', color: '#ef4444' },
    { label: 'Temp',  value: data.temp.toFixed(1),     unit: '°C',     color: '#f59e0b' },
    { label: 'Humid', value: data.humidity.toFixed(0), unit: '%',      color: COLORS.sky500 },
    { label: 'Delta', value: `+${data.delta}`,         unit: 'µg/m³', color: '#f97316' },
  ];
}

interface Props {
  data: SensorPayload;
}

export function PMBadgeRow({ data }: Props) {
  const badges = buildBadges(data);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {badges.map((b, i) => (
        <Animated.View key={b.label} entering={FadeInRight.delay(i * 80).duration(400)}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.badge, { borderColor: b.color + '40' }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <View style={[styles.dot, { backgroundColor: b.color }]} />
            <Text style={styles.label}>{b.label}</Text>
            <Text style={[styles.value, { color: b.color }]}>{b.value}</Text>
            <Text style={styles.unit}>{b.unit}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 2, paddingVertical: 4 },
  badge: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginBottom: 6 },
  label: { fontSize: 9, fontWeight: '700', color: COLORS.slate400, letterSpacing: 1, textTransform: 'uppercase' },
  value: { fontSize: 22, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  unit: { fontSize: 9, color: COLORS.slate400, fontWeight: '600', marginTop: 1 },
});
