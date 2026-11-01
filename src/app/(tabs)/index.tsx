import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  Baby,
  Bell,
  CalendarDays,
  Droplets,
  Eye,
  Footprints,
  HeartPulse,
  MessageSquareHeart,
  Mic,
  PhoneCall,
  Play,
  Radio,
  Repeat,
  Scale,
  Sparkles,
  Thermometer,
  User,
  Zap,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

export default function HomeScreen() {
  const [kickCount, setKickCount] = useState(7);
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const isWide = width >= 768;

  const handleLogKick = () => {
    setKickCount((prev) => {
      const next = prev + 1;
      if (next === 10) {
        Alert.alert(
          lang === 'EN' ? 'Goal Reached! 🌟' : 'Wabigezeho! 🌟',
          lang === 'EN'
            ? '10 fetal movements logged. Fetal activity is optimal.'
            : 'Imigeri 10 yose yanditswe. Umwana ameze neza cyane.'
        );
      }
      return next;
    });
  };

  const t = {
    EN: {
      greeting: 'Good Morning ☀️',
      userName: 'Aline Uwase',
      countdownPill: '1 Month, 2 Days to Delivery',
      stageSubtitle: 'WEEK 28 · 3RD TRIMESTER',
      babyWeight: '1.1 kg',
      weightLabel: 'Baby Weight',
      gestation: '28 Weeks',
      gestationLabel: 'Cycle Days',
      dailySection: 'My Daily Activity',
      cardTalk: 'Talking with Baby',
      cardYoga: 'Kegel Exercise',
      cardKick: 'Kick Counter',
      cardCalendar: 'Calendar & Notes',
      logKick: '+ Kick',
      liveBadge: 'LIVE',
      liveTitle: 'Breathing for Delivery',
      liveTime: '04:30 PM (CAT)',
      liveJoin: 'Join',
      dangerTitle: 'Urgent Signs',
      dangerBleed: 'Bleeding',
      dangerPain: 'Severe Pain',
      dangerVision: 'Blurry Vision',
      dangerFever: 'High Fever',
      callSos: 'SOS 114',
      voiceReport: 'Voice Note',
    },
    RW: {
      greeting: 'Muraho Neza ☀️',
      userName: 'Aline Uwase',
      countdownPill: 'Hasigaye Ukwezi 1, Iminsi 2',
      stageSubtitle: 'ICYUMWERU CYA 28 · IGIHE CYA 3',
      babyWeight: 'Ibiro 1.1',
      weightLabel: 'Uburemere',
      gestation: 'Ibyumweru 28',
      gestationLabel: 'Igihe Cyose',
      dailySection: 'Gahunda y’Umunsi',
      cardTalk: 'Kuganira n’Umwana',
      cardYoga: 'Imyitozo ya Kegel',
      cardKick: 'Kubara Imigeri',
      cardCalendar: 'Kalandari & Inyandiko',
      logKick: '+ Umugeri',
      liveBadge: 'LIVE',
      liveTitle: 'Guhumeka Neza mu Kubyara',
      liveTime: '04:30 PM (CAT)',
      liveJoin: 'Injira',
      dangerTitle: 'Ibimenyetso Byihutirwa',
      dangerBleed: 'Kuva Amaraso',
      dangerPain: 'Uburibwe Bukabije',
      dangerVision: 'Kutabona Neza',
      dangerFever: 'Umuriro Mwinshi',
      callSos: 'SOS 114',
      voiceReport: 'Ijwi',
    },
  }[lang];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>
          {/* Header Row: Responsive User Profile, Language & Bell */}
          <View style={styles.headerRow}>
            <View style={styles.userProfileWrap}>
              <View
                style={[
                  styles.avatarCircle,
                  isSmall && { width: 38, height: 38, borderRadius: 19 },
                ]}
              >
                <User size={isSmall ? 18 : 20} color={PALETTE.white} />
              </View>
              <View style={styles.userGreetingText}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.greetingSubtitle,
                    isSmall && { fontSize: 11 },
                  ]}
                >
                  {t.greeting}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.userNameText,
                    isSmall && { fontSize: 16 },
                  ]}
                >
                  {t.userName}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={[
                  styles.langPill,
                  isSmall && { paddingHorizontal: 7, paddingVertical: 4 },
                ]}
                onPress={() => setLang(lang === 'EN' ? 'RW' : 'EN')}
              >
                <Text
                  style={[
                    styles.langPillText,
                    isSmall && { fontSize: 10 },
                  ]}
                >
                  {lang === 'EN' ? '🇷🇼 RW' : '🇬🇧 EN'}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.bellButton,
                  isSmall && { width: 36, height: 36, borderRadius: 18 },
                ]}
                onPress={() =>
                  Alert.alert(
                    'Notifications',
                    'Reminder: Iron supplement refill due tomorrow at Muhima HC.'
                  )
                }
              >
                <Bell size={isSmall ? 16 : 18} color={PALETTE.deepViolet} />
                <View style={styles.bellDot} />
              </Pressable>
            </View>
          </View>

          {/* Fetal Telemetry & Gestational Milestone Hero Card */}
          <View
            style={[
              styles.heroCard,
              isSmall && {
                paddingHorizontal: 12,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 22,
              },
            ]}
          >
            {/* Top pill badge */}
            <View
              style={[
                styles.milestoneBadgePill,
                isSmall && { paddingHorizontal: 10, paddingVertical: 4 },
              ]}
            >
              <Sparkles size={isSmall ? 11 : 13} color={PALETTE.white} />
              <Text
                numberOfLines={1}
                style={[
                  styles.milestoneBadgeText,
                  isSmall && { fontSize: 10 },
                ]}
              >
                {t.countdownPill}
              </Text>
            </View>

            {/* Professional Fetal Telemetry Visualizer */}
            <View style={styles.fetalTelemetryWrap}>
              <View
                style={[
                  styles.haloOuter,
                  isSmall && { width: 80, height: 80, borderRadius: 40 },
                ]}
              >
                <View
                  style={[
                    styles.haloMid,
                    isSmall && { width: 64, height: 64, borderRadius: 32 },
                  ]}
                >
                  <View
                    style={[
                      styles.haloCore,
                      isSmall && { width: 48, height: 48, borderRadius: 24 },
                    ]}
                  >
                    <Baby
                      size={isSmall ? 30 : 38}
                      color={PALETTE.vibrantCrimson}
                      strokeWidth={2.2}
                    />
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.telemetryTag,
                  isSmall && { paddingHorizontal: 8, paddingVertical: 3 },
                ]}
              >
                <HeartPulse size={12} color={PALETTE.vibrantCrimson} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.telemetryTagText,
                    isSmall && { fontSize: 9 },
                  ]}
                >
                  142 BPM · {t.stageSubtitle}
                </Text>
              </View>
            </View>

            {/* 2 Responsive Metric Capsules (Fluid, Non-Wrapping) */}
            <View
              style={[
                styles.metricCapsulesRow,
                isSmall && { gap: 6, marginTop: 8 },
              ]}
            >
              <View
                style={[
                  styles.metricCapsule,
                  isSmall && {
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    gap: 6,
                    borderRadius: 14,
                  },
                ]}
              >
                <View
                  style={[
                    styles.capsuleIconBox,
                    { backgroundColor: '#FFE8EC' },
                    isSmall && { width: 28, height: 28, borderRadius: 8 },
                  ]}
                >
                  <Scale size={isSmall ? 14 : 17} color={PALETTE.vibrantCrimson} />
                </View>
                <View style={styles.capsuleTextCol}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.capsuleLabel,
                      isSmall && { fontSize: 8.5 },
                    ]}
                  >
                    {t.weightLabel}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.capsuleValue,
                      isSmall && { fontSize: 13 },
                    ]}
                  >
                    {t.babyWeight}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.metricCapsule,
                  isSmall && {
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    gap: 6,
                    borderRadius: 14,
                  },
                ]}
              >
                <View
                  style={[
                    styles.capsuleIconBox,
                    { backgroundColor: '#ECE4FA' },
                    isSmall && { width: 28, height: 28, borderRadius: 8 },
                  ]}
                >
                  <Repeat size={isSmall ? 14 : 17} color={PALETTE.electricPurple} />
                </View>
                <View style={styles.capsuleTextCol}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.capsuleLabel,
                      isSmall && { fontSize: 8.5 },
                    ]}
                  >
                    {t.gestationLabel}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.capsuleValue,
                      isSmall && { fontSize: 13 },
                    ]}
                  >
                    {t.gestation}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Daily Activity Section Heading */}
          <View style={styles.sectionHeaderWrap}>
            <Text
              style={[
                styles.sectionTitle,
                isSmall && { fontSize: 16 },
              ]}
            >
              {t.dailySection}
            </Text>
          </View>

          {/* 2x2 Responsive Activity Grid */}
          <View style={[styles.activityGrid, isSmall && { gap: 8 }]}>
            {/* Card 1: Talking with Baby */}
            <Pressable
              style={[
                styles.activityCard,
                styles.activityCardPeach,
                isSmall && { padding: 10, minHeight: 128, borderRadius: 18 },
              ]}
              onPress={() => router.push('/chat' as any)}
            >
              <View
                style={[
                  styles.activityIconCircle,
                  { backgroundColor: '#FFD7D0' },
                  isSmall && {
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    marginBottom: 6,
                  },
                ]}
              >
                <MessageSquareHeart
                  size={isSmall ? 24 : 32}
                  color={PALETTE.deepViolet}
                  strokeWidth={2}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[
                  styles.activityTitle,
                  isSmall && { fontSize: 11.5, lineHeight: 15 },
                ]}
              >
                {t.cardTalk}
              </Text>
            </Pressable>

            {/* Card 2: Kegel Exercise */}
            <Pressable
              style={[
                styles.activityCard,
                styles.activityCardLavender,
                isSmall && { padding: 10, minHeight: 128, borderRadius: 18 },
              ]}
              onPress={() => router.push('/education' as any)}
            >
              <View
                style={[
                  styles.activityIconCircle,
                  { backgroundColor: '#E2D3FA' },
                  isSmall && {
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    marginBottom: 6,
                  },
                ]}
              >
                <HeartPulse
                  size={isSmall ? 24 : 32}
                  color={PALETTE.electricPurple}
                  strokeWidth={2}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[
                  styles.activityTitle,
                  isSmall && { fontSize: 11.5, lineHeight: 15 },
                ]}
              >
                {t.cardYoga}
              </Text>
            </Pressable>

            {/* Card 3: Kick Counter */}
            <View
              style={[
                styles.activityCard,
                styles.activityCardRuby,
                isSmall && { padding: 10, minHeight: 128, borderRadius: 18 },
              ]}
            >
              <View
                style={[
                  styles.activityIconCircle,
                  { backgroundColor: '#FFD0D9' },
                  isSmall && {
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    marginBottom: 6,
                  },
                ]}
              >
                <Footprints
                  size={isSmall ? 24 : 32}
                  color={PALETTE.vibrantCrimson}
                  strokeWidth={2}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.activityTitle,
                  isSmall && { fontSize: 11.5, lineHeight: 15 },
                ]}
              >
                {t.cardKick}
              </Text>

              <View
                style={[
                  styles.kickActionRow,
                  isSmall && { gap: 4, marginTop: 6 },
                ]}
              >
                <View
                  style={[
                    styles.kickMiniBadge,
                    isSmall && { paddingHorizontal: 5, paddingVertical: 2 },
                  ]}
                >
                  <Activity size={10} color={PALETTE.vibrantCrimson} />
                  <Text
                    style={[
                      styles.kickMiniText,
                      isSmall && { fontSize: 10 },
                    ]}
                  >
                    {kickCount}/10
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.kickMiniBtn,
                    isSmall && { paddingHorizontal: 7, paddingVertical: 3 },
                  ]}
                  onPress={handleLogKick}
                >
                  <Text
                    style={[
                      styles.kickMiniBtnText,
                      isSmall && { fontSize: 10 },
                    ]}
                  >
                    {t.logKick}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Card 4: Calendar & Notes */}
            <Pressable
              style={[
                styles.activityCard,
                styles.activityCardAmber,
                isSmall && { padding: 10, minHeight: 128, borderRadius: 18 },
              ]}
              onPress={() => router.push('/records' as any)}
            >
              <View
                style={[
                  styles.activityIconCircle,
                  { backgroundColor: '#FDE68A' },
                  isSmall && {
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    marginBottom: 6,
                  },
                ]}
              >
                <CalendarDays
                  size={isSmall ? 24 : 32}
                  color="#B45309"
                  strokeWidth={2}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[
                  styles.activityTitle,
                  isSmall && { fontSize: 11.5, lineHeight: 15 },
                ]}
              >
                {t.cardCalendar}
              </Text>
            </Pressable>
          </View>

          {/* Live Session Card */}
          <View
            style={[
              styles.liveSessionCard,
              isSmall && { padding: 12, borderRadius: 18 },
            ]}
          >
            <View style={styles.liveLeft}>
              <View style={styles.livePill}>
                <Radio size={10} color={PALETTE.white} />
                <Text style={styles.livePillText}>{t.liveBadge}</Text>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.liveTitleText,
                  isSmall && { fontSize: 13 },
                ]}
              >
                {t.liveTitle}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.liveTimeText,
                  isSmall && { fontSize: 10.5 },
                ]}
              >
                {t.liveTime}
              </Text>
            </View>

            <Pressable
              style={[
                styles.liveJoinBtn,
                isSmall && { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
              ]}
              onPress={() =>
                Alert.alert(
                  'Live Audio Broadcast',
                  'Connecting to Sister Claire live broadcast...'
                )
              }
            >
              <Play size={isSmall ? 12 : 14} color={PALETTE.white} fill={PALETTE.white} />
              <Text
                style={[
                  styles.liveJoinText,
                  isSmall && { fontSize: 11 },
                ]}
              >
                {t.liveJoin}
              </Text>
            </Pressable>
          </View>

          {/* Urgent Danger Signs: Responsive Medical Lucide Icon Tiles */}
          <View
            style={[
              styles.dangerSection,
              isSmall && { padding: 12, borderRadius: 18, gap: 10 },
            ]}
          >
            <View style={styles.dangerHeaderRow}>
              <View style={styles.dangerHeaderLeft}>
                <AlertTriangle size={isSmall ? 14 : 15} color={PALETTE.vibrantCrimson} />
                <Text
                  style={[
                    styles.dangerSectionTitle,
                    isSmall && { fontSize: 13 },
                  ]}
                >
                  {t.dangerTitle}
                </Text>
              </View>

              <View style={[styles.dangerActions, isSmall && { gap: 6 }]}>
                <Pressable
                  style={[
                    styles.sosButton,
                    isSmall && { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      'Emergency Call 114',
                      'Calling Rwanda National Ambulance Service (SAMU)...'
                    )
                  }
                >
                  <PhoneCall size={isSmall ? 10 : 12} color={PALETTE.white} />
                  <Text
                    style={[
                      styles.sosButtonText,
                      isSmall && { fontSize: 10 },
                    ]}
                  >
                    {t.callSos}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.voiceButton,
                    isSmall && { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
                  ]}
                  onPress={() => router.push('/report' as any)}
                >
                  <Mic size={isSmall ? 11 : 13} color={PALETTE.deepViolet} />
                  <Text
                    style={[
                      styles.voiceButtonText,
                      isSmall && { fontSize: 10 },
                    ]}
                  >
                    {t.voiceReport}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Responsive Danger Chips Row */}
            <View style={[styles.dangerChipsRow, isSmall && { gap: 4 }]}>
              <Pressable
                style={[
                  styles.dangerChip,
                  isSmall && { paddingVertical: 6, borderRadius: 12 },
                ]}
                onPress={() => router.push('/report' as any)}
              >
                <View
                  style={[
                    styles.dangerIconBox,
                    { backgroundColor: '#FFE8EC' },
                    isSmall && { width: 26, height: 26, borderRadius: 13 },
                  ]}
                >
                  <Droplets size={isSmall ? 14 : 17} color={PALETTE.vibrantCrimson} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dangerChipText,
                    isSmall && { fontSize: 8.5 },
                  ]}
                >
                  {t.dangerBleed}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.dangerChip,
                  isSmall && { paddingVertical: 6, borderRadius: 12 },
                ]}
                onPress={() => router.push('/report' as any)}
              >
                <View
                  style={[
                    styles.dangerIconBox,
                    { backgroundColor: '#FFF5D6' },
                    isSmall && { width: 26, height: 26, borderRadius: 13 },
                  ]}
                >
                  <Zap size={isSmall ? 14 : 17} color="#D97706" />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dangerChipText,
                    isSmall && { fontSize: 8.5 },
                  ]}
                >
                  {t.dangerPain}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.dangerChip,
                  isSmall && { paddingVertical: 6, borderRadius: 12 },
                ]}
                onPress={() => router.push('/report' as any)}
              >
                <View
                  style={[
                    styles.dangerIconBox,
                    { backgroundColor: '#ECE4FA' },
                    isSmall && { width: 26, height: 26, borderRadius: 13 },
                  ]}
                >
                  <Eye size={isSmall ? 14 : 17} color={PALETTE.electricPurple} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dangerChipText,
                    isSmall && { fontSize: 8.5 },
                  ]}
                >
                  {t.dangerVision}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.dangerChip,
                  isSmall && { paddingVertical: 6, borderRadius: 12 },
                ]}
                onPress={() => router.push('/report' as any)}
              >
                <View
                  style={[
                    styles.dangerIconBox,
                    { backgroundColor: '#FFE8EC' },
                    isSmall && { width: 26, height: 26, borderRadius: 13 },
                  ]}
                >
                  <Thermometer size={isSmall ? 14 : 17} color={PALETTE.deepRuby} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dangerChipText,
                    isSmall && { fontSize: 8.5 },
                  ]}
                >
                  {t.dangerFever}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bgCanvas,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  container: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 14,
  },
  containerWide: {
    maxWidth: 780,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  userProfileWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  userGreetingText: {
    flex: 1,
    minWidth: 0,
  },
  greetingSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.gray500,
  },
  userNameText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: PALETTE.black,
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  langPillText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PALETTE.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFD2F5',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PALETTE.vibrantCrimson,
  },

  /* Hero Fetal Card */
  heroCard: {
    backgroundColor: PALETTE.cardPeach,
    borderRadius: 26,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD7D0',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  milestoneBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  milestoneBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.white,
    letterSpacing: 0.3,
  },
  fetalTelemetryWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  haloOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255, 174, 158, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 96, 0.35)',
  },
  haloMid: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 232, 228, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PALETTE.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.vibrantCrimson,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALETTE.cardSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD7D0',
  },
  telemetryTagText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.deepViolet,
    letterSpacing: 0.5,
  },

  /* Metric Capsules */
  metricCapsulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginTop: 10,
  },
  metricCapsule: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PALETTE.cardSurface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3E5E2',
  },
  capsuleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleTextCol: {
    flex: 1,
    minWidth: 0,
  },
  capsuleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: PALETTE.gray500,
    textTransform: 'uppercase',
  },
  capsuleValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.black,
  },

  /* Section Header */
  sectionHeaderWrap: {
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: PALETTE.black,
    letterSpacing: -0.2,
  },

  /* 2x2 Activity Grid */
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFD2F5',
    minHeight: 144,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityCardPeach: {
    backgroundColor: PALETTE.cardPeach,
    borderColor: '#FFD7D0',
  },
  activityCardLavender: {
    backgroundColor: PALETTE.cardLavender,
    borderColor: '#E0CEFA',
  },
  activityCardRuby: {
    backgroundColor: PALETTE.cardRuby,
    borderColor: '#FED0D8',
  },
  activityCardAmber: {
    backgroundColor: PALETTE.cardAmber,
    borderColor: '#FDE68A',
  },
  activityIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  activityTitle: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.black,
    textAlign: 'center',
  },
  kickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  kickMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 25, 59, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kickMiniText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.vibrantCrimson,
  },
  kickMiniBtn: {
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kickMiniBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.white,
  },

  /* Live Session Card */
  liveSessionCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DFD2F5',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  liveLeft: {
    gap: 3,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  livePillText: {
    fontFamily: Fonts.extraBold,
    fontSize: 9,
    color: PALETTE.white,
    letterSpacing: 0.5,
  },
  liveTitleText: {
    fontFamily: Fonts.bold,
    fontSize: 13.5,
    color: PALETTE.black,
  },
  liveTimeText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.gray500,
  },
  liveJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.deepViolet,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  liveJoinText: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    color: PALETTE.white,
  },

  /* Danger Signs Section */
  dangerSection: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 12,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dangerSectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13.5,
    color: PALETTE.black,
  },
  dangerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sosButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.white,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  voiceButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
  },
  dangerChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  dangerChip: {
    flex: 1,
    backgroundColor: PALETTE.cardLavender,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E6DAFA',
  },
  dangerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerChipText: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    color: PALETTE.black,
    textAlign: 'center',
  },
});
