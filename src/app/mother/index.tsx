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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';

const BABY_IMAGE: ImageSourcePropType = require('@/assets/images/baby.png');

const CURRENT_WEEK = 21;
const TOTAL_WEEKS = 40;

const GLASS = 'rgba(255,255,255,0.58)';
const GLASS_BORDER = 'rgba(255,255,255,0.9)';

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
  return (
    <Glass style={styles.vital}>
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
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState<'Weeks' | 'Months'>('Weeks');

  const fullName = user?.name ?? 'Aline';
  const completed = unit === 'Weeks' ? CURRENT_WEEK : Math.floor(CURRENT_WEEK / 4.345);
  const remaining =
    unit === 'Weeks' ? TOTAL_WEEKS - CURRENT_WEEK : Math.round((TOTAL_WEEKS - CURRENT_WEEK) / 4.345);
  const noun = unit === 'Weeks' ? 'Week' : 'Month';

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
          paddingHorizontal: 20,
          paddingBottom: 130,
          gap: 16,
        }}>
        {/* Header */}
        <View style={styles.header}>
          <Glass style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileDate}>{todayLabel()}</Text>
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
          <Text style={styles.title}>Pregnancy{'\n'}Stages</Text>
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
        <View style={styles.hero}>
          <View style={styles.babyWrap} pointerEvents="none">
            {BABY_IMAGE ? (
              <Image source={BABY_IMAGE} style={styles.babyImage} resizeMode="contain" />
            ) : (
              <Text style={styles.babyEmoji}>👶🏽</Text>
            )}
          </View>

          <Glass style={[styles.stat, styles.statLeft]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{completed}</Text>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="stethoscope" size={20} color={UI.ink} />
              </View>
            </View>
            <Text style={styles.statLabel}>Completed{'\n'}{noun}</Text>
          </Glass>

          <Glass style={[styles.stat, styles.statRight]}>
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
            style={[styles.accentCircle, styles.heroArrow]}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Baby info strip */}
        <Glass style={styles.babyInfo}>
          <Text style={styles.babyTitle}>
            Baby · {CURRENT_WEEK} week {CURRENT_WEEK * 7} day
          </Text>
          <View style={styles.babyRow}>
            <Text style={styles.babyMeta}>
              Avg.length <Text style={styles.babyMetaValue}>26.7cm</Text>
            </Text>
            <Text style={styles.babyMeta}>
              Avg.weight <Text style={styles.babyMetaValue}>360g</Text>
            </Text>
          </View>
        </Glass>

        {/* Vitals grid */}
        <View style={styles.vitals}>
          <Vital
            icon={<MaterialCommunityIcons name="heart-pulse" size={22} color={UI.ink} />}
            label="Heart Rate"
            value="86"
            unit="bpm"
          />
          <Vital
            icon={<Ionicons name="add" size={24} color={UI.ink} />}
            label="Oxygen level"
            value="97"
            unit="SpO₂"
          />
          <Vital
            icon={<Ionicons name="water-outline" size={22} color={UI.ink} />}
            label="Blood Status"
            value="115/75"
            unit="mmHg"
          />
          <Vital
            icon={<Ionicons name="thermometer-outline" size={22} color={UI.ink} />}
            label="Temperature"
            value="36.6"
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
            <Text style={styles.body}>One result is marked for follow-up by your care team.</Text>
          </View>
          <StatusPill label="Review" tone="amber" />
        </Card>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={18} color={UI.accentDark} />
          <Text style={styles.disclaimerText}>
            This demo dashboard is for general education and is not a substitute for advice from
            your healthcare professional.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6ECFD' },
  glass: {
    backgroundColor: GLASS,
    borderWidth: 1.5,
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
    paddingRight: 22,
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
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileName: { color: UI.ink, fontSize: 15, fontWeight: '800' },
  profileDate: { color: UI.muted, fontSize: 11, marginTop: 2 },
  bell: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: UI.ink, fontSize: 30, lineHeight: 36, fontWeight: '700' },
  titleRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
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

  hero: { height: 330, marginTop: -8 },
  babyWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    left: 30,
    right: -20,
    top: 20,
    borderRadius: 50,
    overflow: 'hidden',
  },
  babyImage: { width: '100%', height: '100%', borderRadius: 50 },
  babyEmoji: { fontSize: 190 },
  stat: { position: 'absolute', width: 140, padding: 14, gap: 8 },
  statLeft: { top: 0, left: 0 },
  statRight: { bottom: 40, right: 0 },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { color: UI.ink, fontSize: 32, fontWeight: '600' },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { color: UI.ink, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  heroArrow: { position: 'absolute', bottom: -10, right: 56 },

  babyInfo: { padding: 18, gap: 14, borderRadius: 26 },
  babyTitle: { color: UI.ink, fontSize: 16, fontWeight: '600' },
  babyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  babyMeta: { color: UI.muted, fontSize: 12 },
  babyMetaValue: { color: UI.ink, fontSize: 18, fontWeight: '600' },

  vitals: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  vital: { width: '47.8%', flexGrow: 1, padding: 16, gap: 14, borderRadius: 26 },
  vitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalLabel: { color: UI.ink, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  vitalValue: { color: UI.ink, fontSize: 28, fontWeight: '700' },
  vitalUnit: { color: UI.muted, fontSize: 13, fontWeight: '500' },

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
