import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ClinicProvider } from '@/contexts/clinic-context';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ClinicProvider>
          <AnimatedSplashOverlay />
          <RoleAwareStack />
        </ClinicProvider>
      </AuthProvider>
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
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'doctor'}>
        <Stack.Screen name="doctor" />
      </Stack.Protected>
      <Stack.Protected guard={false}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
