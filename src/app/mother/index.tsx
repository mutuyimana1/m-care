import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocalizedText as Text } from '@/components/localized-text';
import { UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { useLanguage } from '@/contexts/language-context';

const MOTHER_IMAGE = require('@/assets/images/mother2.jpg');

const CURRENT_WEEK = 21;
const TOTAL_WEEKS = 40;

export default function MotherHomeScreen() {
  const { user, signOut } = useAuth();
  const { patients } = useClinic();
  const { language, setLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const fullName = user?.name ?? 'Aline';
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );

  const recordedWeek = Number(patient?.gestationalAgeWeeks);
  const isPostpartum = patient?.postpartumStatus === 'postpartum';
  const currentWeek =
    patient?.pregnancyResult === 'Positive' &&
    patient.postpartumStatus === 'pregnant' &&
    Number.isFinite(recordedWeek)
      ? recordedWeek
      : isPostpartum
        ? 0
        : CURRENT_WEEK;

  const progressPercent = Math.min(Math.round((currentWeek / TOTAL_WEEKS) * 100), 100);
  const chwName = patient?.communityHealthWorker || 'Marie Claire';
  const chwPhone = patient?.emergencyContactPhone || '0788123456';
  const nextVisitDate = patient?.nextAppointmentDate || 'Friday, 21 Nov 2026';
  const facilityName = patient?.facility || 'Kacyiru Health Center';

  const makeCall = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('Call unavailable'), t('Please contact your nearest health facility directly.'));
      }
    } catch {
      Alert.alert(t('Call unavailable'), t('Please contact your nearest health facility directly.'));
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#EBDDFA', '#F6ECFD', '#E3F4EA']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: screenWidth < 360 ? 14 : 18,
          paddingBottom: 24,
          gap: 12,
        }}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Profile options')}
            onPress={() => setProfileMenuVisible(true)}
            style={({ pressed }) => [styles.profilePill, pressed && styles.pressed]}>
            <View style={styles.avatar}>
              <Image source={MOTHER_IMAGE} style={styles.avatarImage} />
            </View>
            <View>
              <Text style={styles.greetingSub}>{language === 'rw' ? 'Muraho,' : 'Hello,'}</Text>
              <Text style={styles.profileName}>{fullName}!</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Settings and language')}
            onPress={() => setProfileMenuVisible(true)}
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}>
            <Ionicons name="settings-outline" size={22} color={UI.ink} />
          </Pressable>
        </View>

        {/* 1. Pregnancy / Postpartum Milestone Card */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open pregnancy stages"
          onPress={() => router.push('/mother-stages')}
          style={({ pressed }) => [styles.milestoneCard, pressed && styles.pressed]}>
          <View style={styles.milestoneTopRow}>
            <View style={styles.milestoneBadge}>
              <Ionicons name="sparkles" size={14} color={UI.accentDark} />
              <Text style={styles.milestoneBadgeText}>
                {isPostpartum ? t('POSTPARTUM CARE') : `${t('WEEK')} ${currentWeek} ${t('OF')} ${TOTAL_WEEKS}`}
              </Text>
            </View>
            <View style={styles.stageArrow}>
              <Ionicons name="chevron-forward" size={18} color={UI.muted} />
            </View>
          </View>

          <Text style={styles.milestoneHeadline}>
            {isPostpartum
              ? t('Postpartum Recovery')
              : currentWeek <= 13
                ? t('1st Trimester • Gentle Care')
                : currentWeek <= 27
                  ? t('2nd Trimester • Growing Strong')
                  : t('3rd Trimester • Final Preparation')}
          </Text>

          <Text style={styles.milestoneMessage}>
            {isPostpartum
              ? t('Focus on bonding, rest, and postpartum checkups.')
              : t('Your baby is developing well. Tap to see this week’s changes.')}
          </Text>

          {/* Progress Bar */}
          {!isPostpartum ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>{currentWeek} {t('Weeks')}</Text>
                <Text style={styles.progressLabel}>{TOTAL_WEEKS - currentWeek} {t('Remaining')}</Text>
              </View>
            </View>
          ) : null}
        </Pressable>

        {/* 2. Next Clinic Appointment (Actionable Reminder) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('View clinic appointments')}
          onPress={() => router.push('/mother/reminders')}
          style={({ pressed }) => [styles.appointmentCard, pressed && styles.pressed]}>
          <View style={styles.appointmentIconWrap}>
            <Ionicons name="calendar" size={24} color={UI.accentDark} />
          </View>
          <View style={styles.appointmentContent}>
            <Text style={styles.appointmentLabel}>{t('Next Clinic Visit')}</Text>
            <Text style={styles.appointmentDate}>{nextVisitDate}</Text>
            <Text style={styles.appointmentFacility}>{facilityName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={UI.muted} />
        </Pressable>

        {/* 3. Two Primary Action Buttons */}
        <View style={styles.actionRow}>
          {/* Action A: Report Symptoms */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Report Symptoms')}
            onPress={() => router.push('/mother-symptoms')}
            style={({ pressed }) => [styles.actionButton, styles.symptomBtn, pressed && styles.pressed]}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="stethoscope" size={24} color="#D32F2F" />
            </View>
            <Text style={styles.actionBtnTitle}>{t('Feel Unwell?')}</Text>
            <Text style={styles.actionBtnSubtitle}>{t('Check symptoms')}</Text>
          </Pressable>

          {/* Action B: Call Health Worker */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Call Health Worker')}
            onPress={() => makeCall(chwPhone)}
            style={({ pressed }) => [styles.actionButton, styles.chwBtn, pressed && styles.pressed]}>
            <View style={[styles.actionIconCircle, { backgroundColor: UI.greenLight }]}>
              <Ionicons name="call" size={22} color={UI.green} />
            </View>
            <Text style={styles.actionBtnTitle}>{t('Care Worker')}</Text>
            <Text style={styles.actionBtnSubtitle}>{chwName}</Text>
          </Pressable>
        </View>

        {/* 4. One-Tap Rwanda Emergency SOS (114) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Call 114 National Ambulance')}
          onPress={() => makeCall('114')}
          style={({ pressed }) => [styles.sosButton, pressed && styles.pressed]}>
          <View style={styles.sosIconWrap}>
            <Ionicons name="alert-circle" size={22} color="#D32F2F" />
          </View>
          <View style={styles.sosTextWrap}>
            <Text style={styles.sosTitle}>{t('Emergency: Call 114')}</Text>
            <Text style={styles.sosSubtitle}>{t('Free Rwanda Ambulance Hotline')}</Text>
          </View>
          <View style={styles.sosCallPill}>
            <Ionicons name="call" size={14} color={UI.white} />
            <Text style={styles.sosCallText}>{t('114')}</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Profile & Language Switcher Modal */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}>
        <View style={[styles.profileMenuOverlay, { paddingTop: insets.top + 50 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Close')}
            onPress={() => setProfileMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileMenuCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.profileMenuTitle}>{fullName}</Text>
              <Pressable onPress={() => setProfileMenuVisible(false)}>
                <Ionicons name="close-circle-outline" size={24} color={UI.muted} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setProfileMenuVisible(false);
                router.push('/mother/profile');
              }}
              style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]}>
              <Ionicons name="person-outline" size={20} color={UI.accentDark} />
              <Text style={styles.profileMenuItemText}>{t('My profile')}</Text>
              <Ionicons name="chevron-forward" size={17} color={UI.muted} />
            </Pressable>

            {/* Language Switcher */}
            <View style={styles.languageSection}>
              <Text style={styles.languageTitle}>{t('Change language')}</Text>
              <View style={styles.languageRow}>
                {(['en', 'rw'] as const).map((option) => (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: language === option }}
                    onPress={() => setLanguage(option)}
                    style={[
                      styles.languageOption,
                      language === option && styles.languageOptionSelected,
                    ]}>
                    <Text
                      style={[
                        styles.languageOptionText,
                        language === option && styles.languageOptionTextSelected,
                      ]}>
                      {option === 'en' ? 'English' : 'Kinyarwanda'}
                    </Text>
                    {language === option ? (
                      <Ionicons name="checkmark-circle" size={16} color={UI.accentDark} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setProfileMenuVisible(false);
                signOut();
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [styles.profileMenuItem, styles.logoutItem, pressed && styles.pressed]}>
              <Ionicons name="log-out-outline" size={20} color={UI.red} />
              <Text style={[styles.profileMenuItemText, styles.logoutText]}>{t('Log out')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE3F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  greetingSub: { fontSize: 11, color: UI.muted, fontWeight: '500' },
  profileName: { fontSize: 16, fontWeight: '800', color: UI.ink },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  /* Milestone Card */
  milestoneCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#8B5CC4',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 8,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: UI.lavender,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  milestoneBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: UI.accentDark,
    letterSpacing: 0.5,
  },
  stageArrow: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  milestoneHeadline: { fontSize: 20, fontWeight: '800', color: UI.ink },
  milestoneMessage: { fontSize: 13, color: UI.muted, lineHeight: 18 },
  progressContainer: { marginTop: 6, gap: 5 },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAE1F5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: UI.accentDark,
    borderRadius: 4,
  },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, color: UI.muted, fontWeight: '600' },

  /* Next Appointment Card */
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.white,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#2B1238',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  appointmentIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentContent: { flex: 1, gap: 2 },
  appointmentLabel: { fontSize: 12, fontWeight: '700', color: UI.accentDark, textTransform: 'uppercase' },
  appointmentDate: { fontSize: 15, fontWeight: '800', color: UI.ink },
  appointmentFacility: { fontSize: 12, color: UI.muted },

  /* Two Primary Action Buttons */
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    minHeight: 100,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    backgroundColor: UI.white,
    borderWidth: 1.5,
    shadowColor: '#2B1238',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  symptomBtn: { borderColor: '#FFCDD2' },
  chwBtn: { borderColor: '#C8E6C9' },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTitle: { fontSize: 15, fontWeight: '800', color: UI.ink, marginTop: 4 },
  actionBtnSubtitle: { fontSize: 11, color: UI.muted },

  /* Emergency SOS Button */
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    gap: 10,
  },
  sosIconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  sosTextWrap: { flex: 1, gap: 1 },
  sosTitle: { fontSize: 14, fontWeight: '800', color: '#B71C1C' },
  sosSubtitle: { fontSize: 11, color: '#C62828' },
  sosCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sosCallText: { color: UI.white, fontSize: 12, fontWeight: '800' },

  /* Modal Styles */
  profileMenuOverlay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(24, 18, 30, 0.4)',
  },
  profileMenuCard: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
    gap: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#24152E',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
  },
  profileMenuTitle: { color: UI.ink, fontSize: 16, fontWeight: '800' },
  profileMenuItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#FAF7FC',
  },
  profileMenuItemText: { flex: 1, color: UI.ink, fontSize: 14, fontWeight: '600' },
  languageSection: { gap: 8, paddingVertical: 4 },
  languageTitle: { fontSize: 12, fontWeight: '700', color: UI.muted, textTransform: 'uppercase' },
  languageRow: { flexDirection: 'row', gap: 8 },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7FC',
    borderWidth: 1,
    borderColor: UI.border,
  },
  languageOptionSelected: {
    backgroundColor: UI.lavender,
    borderColor: UI.accentDark,
  },
  languageOptionText: { fontSize: 13, color: UI.muted, fontWeight: '600' },
  languageOptionTextSelected: { color: UI.accentDark, fontWeight: '800' },
  logoutItem: { backgroundColor: '#FFF5F5', marginTop: 4 },
  logoutText: { color: UI.red, fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
