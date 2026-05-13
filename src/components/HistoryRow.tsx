import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS, HistoryEntry } from '../data';

interface Props {
  item: HistoryEntry;
  index: number;
}

export function HistoryRow({ item, index }: Props) {
  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify().damping(12).stiffness(100)}
      style={[styles.card, { borderLeftColor: item.color }]}
    >
      <View style={styles.header}>
        <Text style={styles.time}>{item.time}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{item.delta} AQI</Text>
        </View>
      </View>
      <Text style={styles.source}>{item.source}</Text>
      <Text style={[styles.level, { color: item.color }]}>{item.level}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: COLORS.slate500,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: COLORS.spikeLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.spike,
    fontWeight: '800',
  },
  source: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.sky900,
    marginBottom: 4,
  },
  level: {
    fontSize: 13,
    fontWeight: '700',
  },
});
