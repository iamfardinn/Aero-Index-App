import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../data';

export function Header() {
  // Pulse animation for BLE dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View>
        <Text style={styles.brand}>AeroContext</Text>
        <Text style={styles.location}>Dhaka, Bangladesh</Text>
      </View>

      {/* BLE Pill */}
      <View style={styles.blePill}>
        <View style={styles.bleDot}>
          <Animated.View
            style={[
              styles.bleRing,
              { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.6, 0] }) },
            ]}
          />
          <View style={styles.bleDotInner} />
        </View>
        <Text style={styles.bleText}>BLE Connected</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.sky900,
    letterSpacing: -0.5,
  },
  location: {
    fontSize: 11,
    color: COLORS.sky400,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  blePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.emerald50,
    borderColor: COLORS.emerald200,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bleDot: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bleRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emerald400,
  },
  bleDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald500,
  },
  bleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald600,
  },
});
