import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { COLORS } from '@/data';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AQI Card placeholder — Phase 3 */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🌬️</Text>
          <Text style={styles.placeholderTitle}>Dashboard</Text>
          <Text style={styles.placeholderSub}>AQI card, chart & badges coming in Phase 3</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sky100,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  placeholder: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
