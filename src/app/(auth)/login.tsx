
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const COLORS = {
  primary: '#087F8C',
  primaryDark: '#075D68',
  background: '#F5F8FA',
  white: '#FFFFFF',
  text: '#163A40',
  secondaryText: '#64748B',
  border: '#D9E5E9',
  inputBackground: '#FFFFFF',
  error: '#B42318',
  paleTeal: '#E6F4F4',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = () => {
    const nextErrors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // Connect this action to your authentication API.
    // No login request is made until backend authentication is implemented.
    Alert.alert(
      'Authentication not connected',
      'Your details passed the basic form checks, but sign-in is not connected to an authentication service yet.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(tabs)')}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={COLORS.primaryDark}
              />
              <Text style={styles.backText}>Back to home</Text>
            </Pressable>

            <View style={styles.brandSection}>
              <View style={styles.logo}>
                <Ionicons
                  name="heart"
                  size={32}
                  color={COLORS.white}
                />
              </View>

              <Text style={styles.brandName}>M-CARE</Text>
              <Text style={styles.brandDescription}>
                Maternal Community Alert, Response and Referral
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.description}>
                Log in to access your maternal health support and follow-up
                information.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email address</Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.email ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.secondaryText}
                  />

                  <TextInput
                    accessibilityLabel="Email address"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (errors.email) {
                        setErrors((previous) => ({
                          ...previous,
                          email: undefined,
                        }));
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="Enter your email address"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    returnKeyType="next"
                  />
                </View>

                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.password ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.secondaryText}
                  />

                  <TextInput
                    accessibilityLabel="Password"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errors.password) {
                        setErrors((previous) => ({
                          ...previous,
                          password: undefined,
                        }));
                      }
                    }}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      passwordVisible ? 'Hide password' : 'Show password'
                    }
                    onPress={() =>
                      setPasswordVisible((visible) => !visible)
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.secondaryText}
                    />
                  </Pressable>
                </View>

                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Forgot password?',
                    'Password recovery will be available once authentication is connected.',
                  )
                }
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot password?
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                <Text style={styles.loginButtonText}>Log in</Text>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.white}
                />
              </Pressable>

              <View style={styles.privacyNote}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={COLORS.primary}
                />
                <Text style={styles.privacyText}>
                  Your health information should only be accessed by
                  authorized users.
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Need help accessing your account?
              </Text>
              <Link href="/(tabs)" style={styles.homeLink}>
                Return to M-CARE home
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.primaryDark,
  },
  brandDescription: {
    fontSize: 12,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5EDF0',
    shadowColor: '#163A40',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  heading: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 21,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    marginBottom: 18,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  loginButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.92,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#F0F8F8',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 22,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  homeLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    padding: 6,
  },
});
