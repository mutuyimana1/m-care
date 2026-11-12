import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

const BABY_IMAGE: ImageSourcePropType = require('@/assets/images/babies.png');

const CURRENT_WEEK = 21;
const TOTAL_WEEKS = 40;

const GLASS = 'rgba(255,255,255,0.30)';
const GLASS_BORDER = 'rgba(255,255,255,0.48)';

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

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
  const { user } = useAuth();
  const { patients } = useClinic();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const horizontalPadding = screenWidth < 360 ? 14 : screenWidth < 600 ? 18 : 28;
  const heroHeight = Math.min(Math.max(screenWidth * 0.72, 190), 270);
  const babySize = Math.min(screenWidth * 0.66, 270);
  const [unit, setUnit] = useState<'Weeks' | 'Months'>('Weeks');

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
  const hasConfirmedPregnancy = patient?.pregnancyResult === 'Positive' && patient.postpartumStatus === 'pregnant';

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
          <Glass style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.profileDate}>Good Morning</Text>
              <Text style={styles.profileName}>Hello {fullName}!</Text>
            </View>
          </Glass>
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View pregnancy stages"
            onPress={() => router.push('/mother-stages')}
            style={[styles.accentCircle, styles.heroArrow, { bottom: -6, right: screenWidth < 360 ? 12 : 24 }]}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Symptom overview cards from the reference design */}
        <View style={styles.symptomCards}>
          <View style={[styles.symptomCard, styles.backPainCard]}>
            <View style={styles.symptomIcon}>
              <MaterialCommunityIcons name="flower" size={20} color="#8D65B8" />
            </View>
            <View style={styles.symptomStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.symptomStatus}>Normal</Text>
            </View>
            <Text style={styles.symptomTitle}>Back pain</Text>
          </View>
          <View style={[styles.symptomCard, styles.fatigueCard]}>
            <View style={styles.symptomIcon}>
              <MaterialCommunityIcons name="needle" size={20} color="#9B8AAE" />
            </View>
            <View style={styles.symptomStatusRow}>
              <View style={[styles.statusDot, styles.darkStatusDot]} />
              <Text style={[styles.symptomStatus, { color: UI.muted }]}>Normal</Text>
            </View>
            <Text style={[styles.symptomTitle, { color: UI.ink }]}>Fatigue</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View reminders and next steps"
          onPress={() => router.push('/mother/reminders')}
          style={({ pressed }) => [styles.reminderButton, pressed && styles.pressed]}> 
          <Ionicons name="notifications-outline" size={18} color={UI.accentDark} />
          <Text style={styles.reminderText}>View reminders</Text>
        </Pressable>

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

        {/* Existing content kept */}
        <SectionHeading title="Your next steps" />
        <Card style={styles.row}>
          <View style={styles.stepIcon}>
            <Ionicons name="flask-outline" size={20} color={UI.amber} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.stepTitle}>Check your test results</Text>
            <Text style={styles.body}>
              {patient?.missingAssessments
                ? `Your care team noted: ${patient.missingAssessments}`
                : 'Ask your care team about your latest test results and any next steps.'}
            </Text>
          </View>
          <StatusPill
            label={patient?.missingAssessments ? 'Review' : 'Ask'}
            tone={patient?.missingAssessments ? 'amber' : 'lavender'}
          />
        </Card>

      </ScrollView>
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#c4b9b9', fontSize: 18, fontWeight: '800' },
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

  babyInfo: { padding: 16, gap: 12, borderRadius: 22 },
  babyTitle: { color: UI.ink, fontSize: 16, fontWeight: '600' },
  babyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  babyRowStack: { flexDirection: 'column', alignItems: 'flex-start' },
  babyMeta: { color: UI.muted, fontSize: 12 },
  babyMetaValue: { color: UI.ink, fontSize: 16, fontWeight: '600' },
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

  symptomCards: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 2 },
  symptomCard: { flex: 1, minHeight: 126, borderRadius: 22, padding: 12, justifyContent: 'space-between', overflow: 'hidden' },
  backPainCard: { backgroundColor: '#C178F2' },
  fatigueCard: { backgroundColor: 'rgba(255,255,255,0.82)' },
  symptomIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.86)', alignItems: 'center', justifyContent: 'center' },
  symptomStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF' },
  darkStatusDot: { backgroundColor: '#17131D' },
  symptomStatus: { color: 'rgba(255,255,255,0.88)', fontSize: 11 },
  symptomTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowContent: { flex: 1, gap: 4 },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: UI.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  body: { color: UI.muted, fontSize: 13, lineHeight: 19 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  disclaimerText: { flex: 1, color: UI.muted, fontSize: 11, lineHeight: 16 },
});
