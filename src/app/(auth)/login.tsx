import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const COLORS = {
  purple: Colors.light.accent,
  purpleDark: Colors.light.accent,
  text: '#25232A',
  muted: '#77747B',
  border: '#D8D6DB',
  white: '#FFFFFF',
};

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.decor} pointerEvents="none">
        <View style={styles.lavenderOrb} />
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text style={styles.title}>Login</Text>
              <View style={styles.signupPrompt}>
                <Text style={styles.promptText}>Don&apos;t have an account? </Text>
                <Link href="/(auth)/signup" style={styles.signupLink}>
                  sign up
                </Link>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputRow}>
                <Text style={styles.countryCode}>+1</Text>
                <View style={styles.divider} />
                <TextInput
                  accessibilityLabel="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#A6A3AA"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  style={styles.input}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.passwordRow}>
                <Ionicons name="lock-closed-outline" size={16} color="#A6A3AA" />
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
                  onPress={() =>
                    Alert.alert(
                      'Forgot password?',
                      'Password recovery will be available once authentication is connected.',
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.forgotText}>FORGOT</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Login and continue to home"
                onPress={handleLogin}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
              >
                <Text style={styles.loginButtonText}>Login</Text>
                <Ionicons name="log-in-outline" size={19} color={COLORS.white} />
              </Pressable>
            </View>

            <View style={styles.socialRow} accessibilityLabel="Social sign-in options">
              <View style={[styles.socialIcon, styles.appleIcon]}>
                <Ionicons name="logo-apple" size={17} color={COLORS.white} />
              </View>
              <View style={[styles.socialIcon, styles.facebookIcon]}>
                <Ionicons name="logo-facebook" size={17} color={COLORS.white} />
              </View>
              <View style={[styles.socialIcon, styles.googleIcon]}>
                <Ionicons name="logo-google" size={16} color="#4285F4" />
              </View>
              <View style={[styles.socialIcon, styles.twitterIcon]}>
                <Ionicons name="logo-twitter" size={16} color={COLORS.white} />
              </View>
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
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  decor: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  lavenderOrb: {
    position: 'absolute',
    top: -180,
    left: -150,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#F2E6FC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  heading: {
    marginBottom: 26,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  promptText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  signupLink: {
    color: COLORS.purpleDark,
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: 12,
  },
  inputRow: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 12,
    shadowColor: '#24212A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  countryCode: {
    width: 20,
    color: COLORS.muted,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 22,
    marginHorizontal: 8,
    backgroundColor: '#E5E3E7',
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 8,
  },
  passwordRow: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 11,
    shadowColor: '#24212A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    minHeight: 44,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 8,
  },
  forgotText: {
    color: COLORS.purpleDark,
    fontSize: 9,
    fontWeight: '700',
  },
  loginButton: {
    minWidth: 104,
    minHeight: 43,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    marginTop: 28,
    borderRadius: 24,
    backgroundColor: COLORS.purple,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 46,
  },
  socialIcon: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
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
