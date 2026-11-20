import { Stack } from 'expo-router';

export default function ChwLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="mother/[id]" />
    </Stack>
  );
}
