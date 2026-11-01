import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignupScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Create account</ThemedText>
          <ThemedText themeColor="textSecondary">
            Create an m-care account to get started.
          </ThemedText>

          <TextInput
            accessibilityLabel="Full name"
            autoComplete="name"
            placeholder="Full name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <TextInput
            accessibilityLabel="Password"
            autoComplete="new-password"
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />

          <Link href="/(auth)/login" style={styles.link}>
            Already have an account? Log in
          </Link>
          <Link href="/(tabs)" style={styles.link}>
            Back to Home
          </Link>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    gap: Spacing.three,
  },
  input: {
    minHeight: 52,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  link: {
    alignSelf: 'center',
    color: '#3c87f7',
    padding: Spacing.two,
  },
});
