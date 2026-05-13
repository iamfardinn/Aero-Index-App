import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, runOnJS, FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../data';

export function SpikeAlertBanner() {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const dismiss = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(-20, { duration: 300 }, (done) => {
      if (done) runOnJS(setVisible)(false);
    });
  };

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={[styles.banner, animStyle]}>
      <View style={styles.left}>
        <Text style={styles.icon}>⚠️</Text>
        <View>
          <Text style={styles.title}>Spike Detected</Text>
          <Text style={styles.sub}>+40 µg/m³ above baseline · Heavy traffic</Text>
        </View>
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={10}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.spike,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.spike,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  icon: { fontSize: 22 },
  title: { fontSize: 13, fontWeight: '800', color: COLORS.white, letterSpacing: 0.2 },
  sub: { fontSize: 11, color: COLORS.white + 'CC', marginTop: 2 },
  closeBtn: { padding: 4 },
  closeText: { color: COLORS.white + 'BB', fontSize: 14, fontWeight: '600' },
});
