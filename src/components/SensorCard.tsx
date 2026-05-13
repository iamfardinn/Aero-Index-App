import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '../data';

interface Props {
  label: string;
  value: string;
  unit: string;
  emoji: string;
  delay?: number;
  warn?: boolean;  // yellow tint if value is concerning
}

export function SensorCard({ label, value, unit, emoji, delay = 0, warn = false }: Props) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(14)}
      style={[styles.card, warn && styles.cardWarn]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.value, warn && styles.valueWarn]}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWarn: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.sky900,
    lineHeight: 26,
  },
  valueWarn: {
    color: '#d97706',
  },
  unit: {
    fontSize: 11,
    color: COLORS.slate400,
    fontWeight: '600',
    marginTop: 1,
  },
  label: {
    fontSize: 10,
    color: COLORS.slate400,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
});
