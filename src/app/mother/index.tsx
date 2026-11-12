import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
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

const BABY_IMAGE = require('@/assets/images/mother1.jpg');
const MOTHER_IMAGE = require('@/assets/images/mother2.jpg');

const CURRENT_WEEK = 21;
const TOTAL_WEEKS = 40;

const GLASS = 'rgba(255,255,255,0.30)';
const GLASS_BORDER = 'rgba(255,255,255,0.48)';

function Glass({ style, children }: { style?: object | object[]; children: React.ReactNode }) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

function Vital({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const vitalCardWidth = screenWidth < 360 ? '100%' : '47.5%';

  return (
    <Glass style={[styles.vital, { width: vitalCardWidth }]}>
      <View style={styles.vitalHeader}>
        <View style={styles.vitalIcon}>{icon}</View>
        <Text style={styles.vitalLabel}>{label}</Text>
      </View>
      <Text style={styles.vitalValue}>
        {value}
        <Text style={styles.vitalUnit}> {unit}</Text>
      </Text>
    </Glass>
  );
}

export default function MotherHomeScreen() {
  const { user, signOut } = useAuth();
  const { patients, maternalActivities } = useClinic();
  const { language, setLanguage, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = screenWidth < 360 ? 14 : screenWidth < 600 ? 18 : 28;
  const heroHeight = Math.min(Math.max(screenWidth * 0.72, 190), 270);
  const babySize = Math.min(screenWidth * 0.66, 270);
  const [unit, setUnit] = useState<'Weeks' | 'Months'>('Weeks');
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
  const currentWeek =
    patient?.pregnancyResult === 'Positive' &&
    patient.postpartumStatus === 'pregnant' &&
    Number.isFinite(recordedWeek)
      ? recordedWeek
      : patient?.postpartumStatus === 'postpartum'
        ? 0
        : CURRENT_WEEK;
  const completed = unit === 'Weeks' ? currentWeek : Math.floor(currentWeek / 4.345);
  const remaining =
    unit === 'Weeks' ? Math.max(TOTAL_WEEKS - currentWeek, 0) : Math.round(Math.max(TOTAL_WEEKS - currentWeek, 0) / 4.345);
  const noun = unit === 'Weeks' ? 'Week' : 'Month';
  const recentActivity = maternalActivities
    .filter((activity) => activity.patientId === patient?.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#EBDDFA', '#F6ECFD', '#E3F4EA']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: horizontalPadding,
          paddingBottom: 130,
          gap: screenWidth < 360 ? 12 : 16,
        }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Profile options')}
            onPress={() => setProfileMenuVisible(true)}
            style={({ pressed }) => pressed && styles.pressed}>
            <Glass style={styles.profile}>
              <View style={styles.avatar}>
                <Image source={MOTHER_IMAGE} style={styles.avatarImage} />
              </View>
              <View>
                <Text style={styles.profileName}>{fullName}!</Text>
              </View>
            </Glass>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications">
            <Glass style={styles.bell}>
              <Ionicons name="notifications-outline" size={22} color={UI.ink} />
            </Glass>
          </Pressable>
        </View>

        {/* Title + months pill + arrow */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{patient?.postpartumStatus === 'postpartum' ? 'Postpartum' : 'Pregnancy'}{'\n'}Stages</Text>
          <View style={styles.titleRight}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setUnit(unit === 'Weeks' ? 'Months' : 'Weeks')}>
              <Glass style={styles.unitPill}>
                <Text style={styles.unitText}>{unit}</Text>
                <Ionicons name="chevron-down" size={14} color={UI.ink} />
              </Glass>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open pregnancy stages"
              onPress={() => router.push('/mother-stages')}
              style={styles.accentCircle}>
              <Ionicons name="arrow-up" size={22} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
            </Pressable>
          </View>
        </View>

        {/* Hero: baby + two glass stat cards */}
        <View style={[styles.hero, { height: heroHeight }]}>
          <View
            style={[
              styles.babyWrap,
              {
                width: babySize,
                height: babySize,
                left: (screenWidth - horizontalPadding * 2 - babySize) / 2,
                top: (heroHeight - babySize) / 2,
              },
            ]}
            pointerEvents="none">
            {BABY_IMAGE ? (
              <Image source={BABY_IMAGE} style={styles.babyImage} resizeMode="cover" />
            ) : (
              <Text style={styles.babyEmoji}>👶🏽</Text>
            )}
          </View>

          <Glass style={[styles.stat, styles.statLeft, isSmallScreen && styles.statCompact]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{completed}</Text>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="stethoscope" size={20} color={UI.ink} />
              </View>
            </View>
            <Text style={styles.statLabel}>Completed{'\n'}{noun}</Text>
          </Glass>

          <Glass style={[styles.stat, styles.statRight, isSmallScreen && styles.statCompact]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{remaining}</Text>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="stethoscope" size={20} color={UI.ink} />
              </View>
            </View>
            <Text style={styles.statLabel}>Remaining{'\n'}{noun}</Text>
          </Glass>
        </View>

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.babyWeightCard]}>
            <View style={styles.summaryIcon}>
              <MaterialCommunityIcons name="baby-face-outline" size={21} color={UI.accentDark} />
            </View>
            <Text style={styles.summaryLabel}>Baby weight</Text>
            <Text style={styles.summaryValue}>
              {patient?.estimatedBabyWeightGrams || '—'}
              <Text style={styles.summaryUnit}> g</Text>
            </Text>
            <Text style={styles.summaryNote}>
              {patient?.estimatedBabyWeightGrams ? 'Care-team estimate' : 'Not recorded'}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.babyBpmCard]}>
            <View style={styles.summaryIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={21} color={UI.accentDark} />
            </View>
            <Text style={styles.summaryLabel}>Baby BPM</Text>
            <Text style={styles.summaryValue}>
              {patient?.fetalHeartRate || '—'}
              <Text style={styles.summaryUnit}> bpm</Text>
            </Text>
            <Text style={styles.summaryNote}>
              {patient?.fetalHeartRate ? 'Care-team reading' : 'Not recorded'}
            </Text>
          </View>
        </View>

        {/* Vitals grid */}
        <View style={[styles.vitals, { columnGap: 12, rowGap: 12 }]}>
          <Vital
            icon={<MaterialCommunityIcons name="heart-pulse" size={22} color={UI.ink} />}
            label="Heart Rate"
            value={patient?.pulse || '—'}
            unit="bpm"
          />
          <Vital
            icon={<Ionicons name="add" size={24} color={UI.ink} />}
            label="Oxygen level"
            value={patient?.oxygenSaturation || '—'}
            unit="SpO₂"
          />
          <Vital
            icon={<Ionicons name="water-outline" size={22} color={UI.ink} />}
            label="Blood Status"
            value={patient?.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic}` : '—'}
            unit="mmHg"
          />
          <Vital
            icon={<Ionicons name="thermometer-outline" size={22} color={UI.ink} />}
            label="Temperature"
            value={patient?.temperatureC || '—'}
            unit="°C"
          />
        </View>
        <View style={styles.highlights}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open maternal records and referral"
            onPress={() => router.push('/mother/records')}
            style={({ pressed }) => [styles.highlightCard, pressed && styles.pressed]}>
            <View style={[styles.highlightIcon, styles.referralIcon]}>
              <Ionicons name="git-branch-outline" size={20} color={UI.accentDark} />
            </View>
            <View style={styles.highlightCopy}>
              <Text style={styles.highlightTitle}>
                {patient?.referralFacility ? 'Active referral' : 'Referral'}
              </Text>
              <Text style={styles.highlightDetail} numberOfLines={1}>
                {patient?.referralFacility || 'No active referral recorded'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={UI.muted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View recent maternal record"
            onPress={() => router.push('/mother/records')}
            style={({ pressed }) => [styles.highlightCard, pressed && styles.pressed]}>
            <View style={[styles.highlightIcon, styles.recordIcon]}>
              <Ionicons name="document-text-outline" size={20} color={UI.accentDark} />
            </View>
            <View style={styles.highlightCopy}>
              <Text style={styles.highlightTitle}>Recent record</Text>
              <Text style={styles.highlightDetail} numberOfLines={1}>
                {recentActivity?.title || 'No activity recorded yet'}
              </Text>
              {recentActivity ? (
                <Text style={styles.highlightMeta} numberOfLines={1}>{recentActivity.details}</Text>
              ) : null}
              {recentActivity ? (
                <Text style={styles.highlightMeta}>
                  {new Date(recentActivity.occurredAt).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={UI.muted} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View reminders and next steps"
          onPress={() => router.push('/mother/reminders')}
          style={({ pressed }) => [styles.reminderButton, pressed && styles.pressed]}> 
          <Ionicons name="notifications-outline" size={18} color={UI.accentDark} />
          <Text style={styles.reminderText}>View reminders</Text>
        </Pressable>


      </ScrollView>

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}>
        <View style={[styles.profileMenuOverlay, { paddingTop: insets.top + 72 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Close profile menu')}
            onPress={() => setProfileMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileMenuCard}>
            <Text style={styles.profileMenuTitle}>{fullName}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setProfileMenuVisible(false);
                router.push('/mother/profile');
              }}
              style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]}>
              <Ionicons name="person-outline" size={19} color={UI.accentDark} />
              <Text style={styles.profileMenuItemText}>My profile</Text>
              <Ionicons name="chevron-forward" size={17} color={UI.muted} />
            </Pressable>

            <View style={styles.languageSection}>
              <Text style={styles.languageTitle}>Change language</Text>
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
                  <Text style={styles.profileMenuItemText}>
                    {option === 'en' ? 'English' : 'Kinyarwanda'}
                  </Text>
                  {language === option ? (
                    <Ionicons name="checkmark-circle" size={18} color={UI.accentDark} />
                  ) : null}
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setProfileMenuVisible(false);
                signOut();
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]}>
              <Ionicons name="log-out-outline" size={19} color={UI.red} />
              <Text style={[styles.profileMenuItemText, styles.logoutText]}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EDE3F7' },
  glass: {
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 24,
    shadowColor: '#8B5CC4',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    paddingRight: 14,
    borderRadius: 32,
  },
  profileMenuOverlay: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(24, 18, 30, 0.24)',
  },
  profileMenuCard: {
    width: '100%',
    maxWidth: 360,
    padding: 14,
    gap: 7,
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
  profileMenuTitle: {
    color: UI.ink,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  profileMenuItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 9,
    borderRadius: 13,
  },
  profileMenuItemText: {
    flex: 1,
    color: UI.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  languageSection: {
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#EFE8F2',
  },
  languageTitle: {
    color: UI.muted,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingBottom: 5,
  },
  languageOption: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#F6ECFD',
  },
  logoutText: {
    color: UI.red,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  profileName: { color: UI.ink, fontSize: 15, fontWeight: '800' },
  profileDate: { color: UI.muted, fontSize: 11, marginTop: 2 },
  bell: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { color: UI.ink, fontSize: 25, lineHeight: 32, fontWeight: '700', flexShrink: 1 },
  titleRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0 },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
  },
  unitText: { color: UI.ink, fontSize: 13, fontWeight: '600' },
  accentCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  hero: { width: '100%', marginTop: -4, overflow: 'visible' },
  babyWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  babyImage: { width: '100%', height: '100%', borderRadius: 999 },
  babyEmoji: { fontSize: 150 },
  stat: { position: 'absolute', width: 132, maxWidth: '43%', padding: 12, gap: 7, borderRadius: 20 },
  statCompact: { width: 112, padding: 10 },
  statLeft: { top: 0, left: 0 },
  statRight: { bottom: 24, right: 0 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { color: UI.ink, fontSize: 28, fontWeight: '700' },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { color: UI.ink, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  heroArrow: { position: 'absolute' },

  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(143, 89, 187, 0.22)',
  },
  reminderText: { color: UI.accentDark, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.8 },

  vitals: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  vital: { flexGrow: 0, padding: 14, gap: 12, borderRadius: 22,backgroundColor: '#fdf6fe',},
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c486f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalLabel: { color: UI.ink, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  vitalValue: { color: UI.ink, fontSize: 25, fontWeight: '700', flexShrink: 1 },
  vitalUnit: { color: UI.muted, fontSize: 13, fontWeight: '500' },

  summaryCards: { flexDirection: 'row', gap: 12, width: '100%' },
  summaryCard: {
    flex: 1,
    minHeight: 126,
    padding: 14,
    gap: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  babyWeightCard: { backgroundColor: 'rgba(255,255,255,0.68)' },
  babyBpmCard: { backgroundColor: 'rgba(232,244,239,0.78)' },
  summaryIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.75)' },
  summaryLabel: { color: UI.muted, fontSize: 12, fontWeight: '600' },
  summaryValue: { color: UI.ink, fontSize: 23, fontWeight: '800' },
  summaryUnit: { color: UI.muted, fontSize: 12, fontWeight: '600' },
  summaryNote: { color: UI.muted, fontSize: 10 },
  highlights: { gap: 9, width: '100%' },
  highlightCard: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.84)',
  },
  highlightIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  referralIcon: { backgroundColor: '#F1E5FC' },
  recordIcon: { backgroundColor: '#E6F3ED' },
  highlightCopy: { flex: 1, gap: 2 },
  highlightTitle: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  highlightDetail: { color: UI.accentDark, fontSize: 12, fontWeight: '600' },
  highlightMeta: { color: UI.muted, fontSize: 10 },

});
