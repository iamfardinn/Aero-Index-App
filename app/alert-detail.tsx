import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, getLevel } from '@/data';

export default function AlertDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    pm25:     string;
    delta:    string;
    baseline: string;
    source:   string;
    time:     string;
  }>();

  const pm25     = Number(params.pm25     ?? 190);
  const delta    = Number(params.delta    ?? 40);
  const baseline = Number(params.baseline ?? 150);
  const source   = params.source  ?? 'Unknown source';
  const time     = params.time    ?? 'Just now';
  const level    = getLevel(pm25);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={[styles.card, { borderColor: level.color + '40' }]}
      >
        {/* Top strip */}
        <View style={[styles.strip, { backgroundColor: level.color }]} />

        <View style={styles.cardBody}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.spikeEmoji}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: level.color + '18' }]}>
              <Text style={[styles.badgeText, { color: level.color }]}>SPIKE</Text>
            </View>
          </View>

          {/* Big numbers */}
          <View style={styles.numbersRow}>
            <View style={styles.numberBlock}>
              <Text style={styles.numberLabel}>PM2.5</Text>
              <Text style={[styles.bigNum, { color: level.color }]}>{pm25}</Text>
              <Text style={styles.numberUnit}>µg/m³</Text>
            </View>
            <View style={styles.numberDivider} />
            <View style={styles.numberBlock}>
              <Text style={styles.numberLabel}>ABOVE BASELINE</Text>
              <Text style={[styles.bigNum, { color: '#d97706' }]}>+{delta}</Text>
              <Text style={styles.numberUnit}>µg/m³</Text>
            </View>
            <View style={styles.numberDivider} />
            <View style={styles.numberBlock}>
              <Text style={styles.numberLabel}>BASELINE</Text>
              <Text style={[styles.bigNum, { color: COLORS.sky900 }]}>{baseline}</Text>
              <Text style={styles.numberUnit}>µg/m³</Text>
            </View>
          </View>

          {/* Source explanation */}
          <View style={styles.sourceBox}>
            <Text style={styles.sourceLabel}>PROBABLE SOURCE</Text>
            <Text style={styles.sourceText}>{source}</Text>
          </View>

          {/* Plain language explanation */}
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>What does this mean?</Text>
            <Text style={styles.explanationText}>
              PM2.5 spiked <Text style={{ fontWeight: '800' }}>{delta} µg/m³ above your recent baseline</Text> of {baseline} µg/m³.
              The air quality is now classified as <Text style={{ fontWeight: '800', color: level.color }}>{level.label}</Text>.
              {'\n\n'}
              This change was detected relative to your recent exposure level — not a fixed threshold —
              which means it represents a meaningful change in your immediate environment.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.sky900 }]}
          onPress={() => router.push('/(tabs)/history')}
        >
          <Text style={styles.actionBtnText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#d97706' }]}
          onPress={() => Linking.openURL('https://www.google.com/maps')}
        >
          <Text style={styles.actionBtnText}>Avoid Route 🗺️</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sky100,
    padding: 20,
  },
  backBtn: { marginBottom: 16 },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.sky900,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  strip: { height: 8 },
  cardBody: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  spikeEmoji: { fontSize: 28 },
  levelText: { fontSize: 18, fontWeight: '800' },
  timeText: { fontSize: 12, color: COLORS.slate400, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  numbersRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  numberBlock: { flex: 1, alignItems: 'center' },
  numberLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.slate400,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  bigNum: { fontSize: 32, fontWeight: '900' },
  numberUnit: { fontSize: 11, color: COLORS.slate400, marginTop: 2 },
  numberDivider: {
    width: 1,
    backgroundColor: COLORS.slate300,
    marginVertical: 4,
  },
  sourceBox: {
    backgroundColor: COLORS.spikeLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.spikeBorder,
  },
  sourceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.spike,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.spike,
  },
  explanationBox: {
    backgroundColor: COLORS.slate100,
    borderRadius: 12,
    padding: 14,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.sky900,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.slate600,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
