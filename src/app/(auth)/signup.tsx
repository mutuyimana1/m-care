import React, { useState } from 'react';
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
import { Link, router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  CheckSquare,
  Globe,
  Heart,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Square,
  User,
} from 'lucide-react-native';
import { Fonts, PALETTE } from '@/constants/theme';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'EN' | 'RW'>('EN');
  const [district, setDistrict] = useState<'Kicukiro' | 'Nyagatare'>('Kicukiro');
  const [stage, setStage] = useState<'pregnant' | 'postpartum'>('pregnant');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const handleSignup = () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert(
        language === 'EN' ? 'Missing Information' : 'Amakuru abura',
        language === 'EN'
          ? 'Please enter your full name and phone number.'
          : 'Nyamuneka andika amazina yawe na nimero ya telefoni.'
      );
      return;
    }

    if (!consentAgreed) {
      Alert.alert(
        language === 'EN' ? 'Consent Required' : 'Uruhushya rurakenewe',
        language === 'EN'
          ? 'Please agree to data sharing with authorized MOH Community Health Workers to activate triage services.'
          : 'Nyamuneka emera ko amakuru asangizwa abajyanama b’ubuzima kugira ngo serivisi zikore.'
      );
      return;
    }

    Alert.alert(
      language === 'EN' ? 'Registration Successful' : 'Kwiyandikisha Byarangiye',
      language === 'EN'
        ? `Account registered in ${district} District. Assigned to primary clinic registry. Welcome to M-CARE!`
        : `Konti yafunguwe mu Karere ka ${district}. Ikigo nderabuzima cyakiriye amakuru yawe!`
    );
    router.replace('/(tabs)');
  };

  const t = {
    EN: {
      backBtn: 'Back to home',
      brandSubtitle: 'Maternal Community Alert & Referral System',
      heading: 'Register for Maternal Care',
      desc: 'Connect with qualified community health workers, receive ANC reminders, and access 24/7 emergency dispatch in Rwanda.',
      langLabel: 'Preferred Language',
      districtLabel: 'Pilot District Catchment',
      stageLabel: 'Maternal Care Status',
      pregnantOpt: 'Pregnant',
      postpartumOpt: 'Postpartum (0–6 Wks)',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Aline Uwase',
      emailLabel: 'Email Address (Optional)',
      emailPlaceholder: 'aline.uwase@example.rw',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+250 788 123 456',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Create a password',
      consentText:
        'I consent to sharing my maternal health alerts and location with assigned Rwanda MOH Community Health Workers and receiving referral facilities.',
      submitBtn: 'Complete Registration & Consent',
      footerPrompt: 'Already registered?',
      loginLink: 'Sign in here',
    },
    RW: {
      backBtn: 'Gusubira ahabanza',
      brandSubtitle: 'Uburyo bwo Gutabariza no Kwita ku Mubyeyi',
      heading: 'Iyandikishe muri M-CARE',
      desc: 'Huza n’abajyanama b’ubuzima, bona ubutumwa bwo kwisuzumisha, kandi ubone ubutabazi bwihuse amasaha yose mu Rwanda.',
      langLabel: 'Ururimi Wifuza',
      districtLabel: 'Akarere k’Icyitegererezo',
      stageLabel: 'Uko Umeze Ubu',
      pregnantOpt: 'Ntwite',
      postpartumOpt: 'Nabyaye (Ibyumweru 0–6)',
      nameLabel: 'Amazina Yose',
      namePlaceholder: 'urugero: Aline Uwase',
      emailLabel: 'Imeli (Ubyifuza)',
      emailPlaceholder: 'aline.uwase@example.rw',
      phoneLabel: 'Nimero ya Telefoni',
      phonePlaceholder: '+250 788 123 456',
      passwordLabel: 'Ijambobanga',
      passwordPlaceholder: 'Injiza ijambobanga',
      consentText:
        'Nemeye ko amakuru yanjye y’ubuzima asangizwa abajyanama b’ubuzima ba Minisiteri y’Ubuzima (MOH) n’ibitaro byakira abarwayi.',
      submitBtn: 'Komeza no Kwemeza Uruhushya',
      footerPrompt: 'Usanzwe ufite konti?',
      loginLink: 'Injira hano',
    },
  }[language];

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
            {/* Back Button */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(tabs)')}
              style={styles.backButton}
            >
              <ArrowLeft size={18} color={PALETTE.deepViolet} />
              <Text style={styles.backText}>{t.backBtn}</Text>
            </Pressable>

            {/* Brand Section */}
            <View style={styles.brandSection}>
              <View style={styles.logo}>
                <Heart size={28} color={PALETTE.white} fill={PALETTE.white} />
              </View>
              <Text style={styles.brandName}>M-CARE</Text>
              <Text style={styles.brandDescription}>{t.brandSubtitle}</Text>
            </View>

            {/* Registration Card */}
            <View style={styles.card}>
              <Text style={styles.heading}>{t.heading}</Text>
              <Text style={styles.description}>{t.desc}</Text>

              {/* Language Selector (PRD §4.A) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.langLabel}</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    style={[
                      styles.choiceChip,
                      language === 'EN' && styles.choiceChipActive,
                    ]}
                    onPress={() => setLanguage('EN')}
                  >
                    <Globe
                      size={14}
                      color={language === 'EN' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        language === 'EN' && styles.choiceChipTextActive,
                      ]}
                    >
                      🇬🇧 English
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.choiceChip,
                      language === 'RW' && styles.choiceChipActive,
                    ]}
                    onPress={() => setLanguage('RW')}
                  >
                    <Globe
                      size={14}
                      color={language === 'RW' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        language === 'RW' && styles.choiceChipTextActive,
                      ]}
                    >
                      🇷🇼 Ikinyarwanda
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Pilot District Selector (PRD §1 & §11) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.districtLabel}</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    style={[
                      styles.choiceChip,
                      district === 'Kicukiro' && styles.choiceChipActive,
                    ]}
                    onPress={() => setDistrict('Kicukiro')}
                  >
                    <MapPin
                      size={14}
                      color={district === 'Kicukiro' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        district === 'Kicukiro' && styles.choiceChipTextActive,
                      ]}
                    >
                      Kicukiro District
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.choiceChip,
                      district === 'Nyagatare' && styles.choiceChipActive,
                    ]}
                    onPress={() => setDistrict('Nyagatare')}
                  >
                    <MapPin
                      size={14}
                      color={district === 'Nyagatare' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        district === 'Nyagatare' && styles.choiceChipTextActive,
                      ]}
                    >
                      Nyagatare District
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Maternal Status Selector (PRD §4.A) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.stageLabel}</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    style={[
                      styles.choiceChip,
                      stage === 'pregnant' && styles.choiceChipActive,
                    ]}
                    onPress={() => setStage('pregnant')}
                  >
                    <Baby
                      size={14}
                      color={stage === 'pregnant' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        stage === 'pregnant' && styles.choiceChipTextActive,
                      ]}
                    >
                      {t.pregnantOpt}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.choiceChip,
                      stage === 'postpartum' && styles.choiceChipActive,
                    ]}
                    onPress={() => setStage('postpartum')}
                  >
                    <Heart
                      size={14}
                      color={stage === 'postpartum' ? PALETTE.white : PALETTE.deepViolet}
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        stage === 'postpartum' && styles.choiceChipTextActive,
                      ]}
                    >
                      {t.postpartumOpt}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.nameLabel}</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.phoneLabel}</Text>
                <View style={styles.inputContainer}>
                  <Phone size={18} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder={t.phonePlaceholder}
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Email (Optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.emailLabel}</Text>
                <View style={styles.inputContainer}>
                  <Mail size={18} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Email address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder={t.emailPlaceholder}
                    placeholderTextColor={PALETTE.gray400}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t.passwordLabel}</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={PALETTE.gray500} />
                  <TextInput
                    accessibilityLabel="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.passwordPlaceholder}
                    placeholderTextColor={PALETTE.gray400}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>

              {/* EXPLICIT CONSENT & PRIVACY NOTICE (PRD §4.A & §9) */}
              <Pressable
                style={styles.consentRow}
                onPress={() => setConsentAgreed(!consentAgreed)}
              >
                {consentAgreed ? (
                  <CheckSquare size={20} color={PALETTE.deepViolet} />
                ) : (
                  <Square size={20} color={PALETTE.gray400} />
                )}
                <Text style={styles.consentText}>{t.consentText}</Text>
              </Pressable>

              {/* Security Pill */}
              <View style={styles.privacyNote}>
                <ShieldCheck size={14} color="#166534" />
                <Text style={styles.privacyNoteText}>
                  Protected under Rwanda Data Protection Law & MOH Ethical Protocol
                </Text>
              </View>

              {/* Submit Button */}
              <Pressable
                accessibilityRole="button"
                onPress={handleSignup}
                style={[
                  styles.signupButton,
                  !consentAgreed && styles.signupButtonDisabled,
                ]}
              >
                <Text style={styles.signupButtonText}>{t.submitBtn}</Text>
                <ArrowRight size={18} color={PALETTE.white} />
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t.footerPrompt}</Text>
              <Link href="/(auth)/login" style={styles.loginLink}>
                {t.loginLink}
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13.5,
    color: PALETTE.deepViolet,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  brandName: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: PALETTE.deepViolet,
    letterSpacing: 1,
  },
  brandDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray600,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 12,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: PALETTE.black,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray500,
    lineHeight: 16,
    marginTop: -4,
  },
  fieldGroup: {
    gap: 5,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.black,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: PALETTE.cardLavender,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  choiceChipActive: {
    backgroundColor: PALETTE.deepViolet,
    borderColor: PALETTE.deepViolet,
  },
  choiceChipText: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
  },
  choiceChipTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF7FD',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2D6F6',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.black,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F7F2FD',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    marginTop: 2,
  },
  consentText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray600,
    lineHeight: 15,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  privacyNoteText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#166534',
    lineHeight: 13,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.deepViolet,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonDisabled: {
    opacity: 0.55,
  },
  signupButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 13.5,
    color: PALETTE.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    color: PALETTE.gray500,
  },
  loginLink: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.deepViolet,
  },
});
