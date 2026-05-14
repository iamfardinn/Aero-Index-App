import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/data';

// ─── Minimal SVG-free tab icons ──────────────────────────────────────────────

function DashboardIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.iconDot, { backgroundColor: color }]} />
    </View>
  );
}

function HistoryIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={[styles.iconBox, { width: size, height: size, borderColor: color }]}>
      <Text style={[styles.iconChar, { color, fontSize: size * 0.55 }]}>⏱</Text>
    </View>
  );
}

// ─── Tab Navigator ───────────────────────────────────────────────────────────

import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  // Show nothing while checking auth state to prevent flicker
  if (isLoading) return null;

  // If not logged in, force them to the login screen
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.sky900,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.sky400,
        tabBarInactiveTintColor: COLORS.slate400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  iconBox: {
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconChar: {
    lineHeight: 20,
  },
});
