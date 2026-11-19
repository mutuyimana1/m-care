import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Text, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ClinicProvider, useClinic } from '@/contexts/clinic-context';
import { LanguageProvider } from '@/contexts/language-context';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="dark" hidden={false} />
      <LanguageProvider>
        <AuthProvider>
          <SessionClinic />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function SessionClinic() {
  const { token } = useAuth();
  return (
    <ClinicProvider key={token ?? 'anonymous'}>
      <AnimatedSplashOverlay />
      <RoleAwareStack />
    </ClinicProvider>
  );
}

function RoleAwareStack() {
  const { user } = useAuth();
  const { syncError } = useClinic();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'mother'}>
          <Stack.Screen name="mother" />
          <Stack.Screen name="mother-stages" />
          <Stack.Screen name="mother-symptoms" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'doctor'}>
          <Stack.Screen name="doctor" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'chw'}>
          <Stack.Screen name="chw" />
        </Stack.Protected>
        <Stack.Protected guard={false}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
      {syncError ? (
        <View accessibilityRole="alert" style={{ position: 'absolute', top: 8, left: 8, right: 8, padding: 12, backgroundColor: '#7f1d1d', borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 13 }}>Database sync issue: {syncError}</Text>
        </View>
      ) : null}
    </View>
  );
}
