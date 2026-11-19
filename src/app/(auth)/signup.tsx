import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';

import { LocalizedTextInput as TextInput } from '@/components/localized-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';

export default function SignupScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createAccount = async () => {
    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (error) {
      Alert.alert('Unable to create account', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Create account</ThemedText>
          <ThemedText themeColor="textSecondary">
            Create a maternal account. Care-team accounts are provided by your facility.
          </ThemedText>

          <TextInput
            accessibilityLabel="Full name"
            value={name}
            onChangeText={setName}
            autoComplete="name"
            placeholder="Full name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <TextInput
            accessibilityLabel="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <TextInput
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />

          <Pressable disabled={submitting} onPress={createAccount} style={styles.submit}>
            <ThemedText style={styles.submitText}>{submitting ? 'Creating account…' : 'Create account'}</ThemedText>
          </Pressable>

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
    color: Colors.light.accent,
    padding: Spacing.two,
  },
  submit: { minHeight: 50, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.accent },
  submitText: { color: '#FFFFFF', fontWeight: '700' },
});
