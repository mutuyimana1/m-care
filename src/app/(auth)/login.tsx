import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

const COLORS = {
  purple: Colors.light.accent,
  text: '#17151B',
  muted: '#77747B',
  border: '#D9D7DC',
  white: '#FFFFFF',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const { height, width } = useWindowDimensions();

  const compact = height < 700;

  const handleLogin = () => {
    if (!signIn(email, password)) {
      Alert.alert('Unable to sign in', 'Check the email and password shown in the demo account cards.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" background-Color="#FFFFFF" />

      {/* Background */}
      <View style={styles.background} pointerEvents="none">
        <LinearGradient
          colors={['#DCC4FF', '#E8D9FC', '#F8F2FF', '#FFFFFF']}
          locations={[0, 0.4, 0.75, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            styles.lavenderOrb,
            {
              width: Math.min(width * 0.78, 300),
              height: Math.min(width * 0.78, 300),
            },
          ]}
        />
      </View>

      {/* Rounded screen frame */}
      <View style={styles.screenBorder} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height - 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Heading */}
            <View
              style={[
                styles.heading,
                {
                  marginTop: height * (compact ? 0.08 : 0.12),
                },
              ]}
            >
              <Text style={styles.title}>Login</Text>

              <View style={styles.signupPrompt}>
                <Text style={styles.promptText}>
                  Sign in with the account provided by your M-CARE care team.
                </Text>
              </View>
            </View>

            {/* Login form */}
            <View style={styles.form}>
              {/* Email input */}
              <View style={styles.inputRow}>
                <TextInput
                  accessibilityLabel="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="#A6A3AA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                  returnKeyType="next"
                />
              </View>

              {/* Password input */}
              <View style={styles.passwordRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#A6A3AA"
                />

                <TextInput
                  accessibilityLabel="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#A6A3AA"
                  secureTextEntry
                  autoComplete="current-password"
                  style={styles.passwordInput}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  onPress={() =>
                    Alert.alert(
                      'Forgot password?',
                      'Password recovery will be available once authentication is connected.',
                    )
                  }
                  hitSlop={10}
                >
                  <Text style={styles.forgotText}>FORGOT</Text>
                </Pressable>
              </View>

              {/* Login button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Login and continue to home"
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.loginButtonText}>Login</Text>

                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color={COLORS.white}
                />
              </Pressable>
            </View>

            <View style={styles.demoAccounts}>
              <Text style={styles.demoTitle}>Try a demo account</Text>
              <Text style={styles.demoAccount}>Mother · mother@mcare.demo · Mother123!</Text>
              <Text style={styles.demoAccount}>Clinician · doctor@mcare.demo · Doctor123!</Text>
              <Text style={styles.demoNote}>
                Demo access only. Do not enter real patient information.
              </Text>
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
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderRadius: 28,
  },

  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },

  lavenderOrb: {
    position: 'absolute',
    top: -65,
    left: -55,
    borderRadius: 999,
  },

  screenBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: '#F0EDF2',
    borderRadius: 28,
    zIndex: 10,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },

  content: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },

  heading: {
    marginBottom: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
  },

  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  promptText: {
    color: COLORS.muted,
    fontSize: 11,
  },

  form: {
    gap: 12,
  },

  inputRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#24212A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  countryCode: {
    width: 28,
    height: 40,
    color: COLORS.muted,
    fontSize: 13,
    padding: 0,
    textAlignVertical: 'center',
  },

  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 5,
    backgroundColor: '#E5E3E7',
  },

  input: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  demoAccounts: {
    marginTop: 'auto',
    padding: 14,
    gap: 7,
    borderRadius: 16,
    backgroundColor: '#FAF5FE',
    borderWidth: 1,
    borderColor: '#EEE2F6',
  },
  demoTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  demoAccount: {
    color: '#51485A',
    fontSize: 11,
    lineHeight: 16,
  },
  demoNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  passwordRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#24212A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  passwordInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },

  forgotText: {
    color: COLORS.purple,
    fontSize: 9,
    fontWeight: '800',
  },

  loginButton: {
    width: 88,
    height: 38,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 30,
    borderRadius: 22,
    backgroundColor: COLORS.purple,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 'auto',
    paddingBottom: 30,
  },

  socialIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },

  appleIcon: {
    backgroundColor: '#101014',
  },

  facebookIcon: {
    backgroundColor: '#1877F2',
  },

  googleIcon: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0EEF2',
  },

  twitterIcon: {
    backgroundColor: '#1D9BF0',
  },
});
