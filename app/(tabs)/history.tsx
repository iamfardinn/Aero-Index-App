import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/data';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Spike History</Text>
        <Text style={styles.subtitle}>Recent air quality events</Text>
      </View>

      {/* History list placeholder — Phase 4 */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderEmoji}>📋</Text>
        <Text style={styles.placeholderTitle}>History</Text>
        <Text style={styles.placeholderSub}>Spike event log coming in Phase 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sky100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.sky900,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.sky400,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  placeholder: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.sky900,
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 13,
    color: COLORS.slate400,
    textAlign: 'center',
  },
});
