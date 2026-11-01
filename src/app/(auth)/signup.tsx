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

import { Fonts, PALETTE } from '@/constants/theme';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    Alert.alert(
      'Account Registration',
      'Sign-up request received. Backend account creation will connect with the community health registry.',
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
                color={PALETTE.deepViolet}
              />
              <Text style={styles.backText}>Back to home</Text>
            </Pressable>

            <View style={styles.brandSection}>
              <View style={styles.logo}>
                <Ionicons
                  name="heart"
                  size={32}
                  color={PALETTE.white}
                />
              </View>

              <Text style={styles.brandName}>M-CARE</Text>
              <Text style={styles.brandDescription}>
                Join the Maternal Care Community Network
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.heading}>Create your account</Text>
              <Text style={styles.description}>
                Get personalized pregnancy tracking, direct midwife support, and ANC visit reminders.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={19} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoComplete="name"
                    placeholder="e.g. Grace Uwase"
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={19} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Email address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="grace.uwase@example.rw"
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={19} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+250 788 123 456"
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={19} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a secure password"
                    placeholderTextColor={PALETTE.gray400}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleSignup}
                style={styles.signupButton}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color={PALETTE.white} />
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href="/(auth)/login" style={styles.loginLink}>
                Log in here
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
    backgroundColor: PALETTE.bgCanvas,
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
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: PALETTE.deepViolet,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.electricPurple,
    marginBottom: 12,
    shadowColor: PALETTE.electricPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  brandName: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    letterSpacing: 1.5,
    color: PALETTE.deepViolet,
  },
  brandDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray600,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: PALETTE.black,
    marginBottom: 6,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
    lineHeight: 19,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: PALETTE.black,
    marginBottom: 6,
  },
  inputContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    borderRadius: 14,
    backgroundColor: '#F5EFFC',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: PALETTE.black,
    paddingVertical: 10,
  },
  signupButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: PALETTE.electricPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 10,
    shadowColor: PALETTE.electricPurple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonText: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 22,
    gap: 6,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
  },
  loginLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.electricPurple,
    padding: 6,
  },
});
