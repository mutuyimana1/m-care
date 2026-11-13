import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ClinicProvider } from '@/contexts/clinic-context';
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
          <ClinicProvider>
            <AnimatedSplashOverlay />
            <RoleAwareStack />
          </ClinicProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function RoleAwareStack() {
  const { user } = useAuth();

  return (
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
  );
}
