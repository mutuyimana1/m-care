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
      heartbeat: '142 bpm',
      heartbeatLabel: 'Fetal Heart',
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
      heartbeat: '142 bpm',
      heartbeatLabel: 'Umutima',
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
          { paddingBottom: BottomTabInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>
          {/* Header Row: User Avatar, Greeting, Notifications & Lang Toggle */}
          <View style={styles.headerRow}>
            <View style={styles.userProfileWrap}>
              <View style={styles.avatarCircle}>
                <User size={20} color={PALETTE.white} />
              </View>
              <View style={styles.userGreetingText}>
                <Text style={styles.greetingSubtitle}>{t.greeting}</Text>
                <Text style={styles.userNameText}>{t.userName}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.langPill}
                onPress={() => setLang(lang === 'EN' ? 'RW' : 'EN')}
              >
                <Text style={styles.langPillText}>
                  {lang === 'EN' ? '🇷🇼 RW' : '🇬🇧 EN'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.bellButton}
                onPress={() =>
                  Alert.alert(
                    'Notifications',
                    'Reminder: Iron supplement refill due tomorrow at Muhima HC.'
                  )
                }
              >
                <Bell size={18} color={PALETTE.deepViolet} />
                <View style={styles.bellDot} />
              </Pressable>
            </View>
          </View>

          {/* Fetal Telemetry & Gestational Milestone Card */}
          <View style={styles.heroCard}>
            {/* Top pill badge */}
            <View style={styles.milestoneBadgePill}>
              <Sparkles size={13} color={PALETTE.white} />
              <Text style={styles.milestoneBadgeText}>{t.countdownPill}</Text>
            </View>

            {/* Professional Fetal Telemetry Visualizer */}
            <View style={styles.fetalTelemetryWrap}>
              <View style={styles.haloOuter}>
                <View style={styles.haloMid}>
                  <View style={styles.haloCore}>
                    <Baby size={40} color={PALETTE.vibrantCrimson} strokeWidth={2.2} />
                  </View>
                </View>
              </View>

              <View style={styles.telemetryTag}>
                <Activity size={12} color={PALETTE.deepViolet} />
                <Text style={styles.telemetryTagText}>{t.stageSubtitle}</Text>
              </View>
            </View>

            {/* Metric Capsules Row */}
            <View style={styles.metricCapsulesRow}>
              <View style={styles.metricCapsule}>
                <View style={[styles.capsuleIconBox, { backgroundColor: '#FFE8EC' }]}>
                  <Scale size={16} color={PALETTE.vibrantCrimson} />
                </View>
                <View style={styles.capsuleTextCol}>
                  <Text style={styles.capsuleLabel}>{t.weightLabel}</Text>
                  <Text style={styles.capsuleValue}>{t.babyWeight}</Text>
                </View>
              </View>

              <View style={styles.metricCapsule}>
                <View style={[styles.capsuleIconBox, { backgroundColor: '#ECE4FA' }]}>
                  <Repeat size={16} color={PALETTE.electricPurple} />
                </View>
                <View style={styles.capsuleTextCol}>
                  <Text style={styles.capsuleLabel}>{t.gestationLabel}</Text>
                  <Text style={styles.capsuleValue}>{t.gestation}</Text>
                </View>
              </View>

              <View style={styles.metricCapsule}>
                <View style={[styles.capsuleIconBox, { backgroundColor: '#FFE8E4' }]}>
                  <HeartPulse size={16} color={PALETTE.deepRuby} />
                </View>
                <View style={styles.capsuleTextCol}>
                  <Text style={styles.capsuleLabel}>{t.heartbeatLabel}</Text>
                  <Text style={styles.capsuleValue}>{t.heartbeat}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Daily Activity Section Heading */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionTitle}>{t.dailySection}</Text>
          </View>

          {/* 2x2 Professional Activity Grid */}
          <View style={styles.activityGrid}>
            {/* Card 1: Talking with Baby */}
            <Pressable
              style={[styles.activityCard, styles.activityCardPeach]}
              onPress={() => router.push('/chat' as any)}
            >
              <View style={[styles.activityIconCircle, { backgroundColor: '#FFD7D0' }]}>
                <MessageSquareHeart size={34} color={PALETTE.deepViolet} strokeWidth={2} />
              </View>
              <Text style={styles.activityTitle}>{t.cardTalk}</Text>
            </Pressable>

            {/* Card 2: Kegel Exercise */}
            <Pressable
              style={[styles.activityCard, styles.activityCardLavender]}
              onPress={() => router.push('/education' as any)}
            >
              <View style={[styles.activityIconCircle, { backgroundColor: '#E2D3FA' }]}>
                <HeartPulse size={34} color={PALETTE.electricPurple} strokeWidth={2} />
              </View>
              <Text style={styles.activityTitle}>{t.cardYoga}</Text>
            </Pressable>

            {/* Card 3: Kick Counter */}
            <View style={[styles.activityCard, styles.activityCardRuby]}>
              <View style={[styles.activityIconCircle, { backgroundColor: '#FFD0D9' }]}>
                <Footprints size={34} color={PALETTE.vibrantCrimson} strokeWidth={2} />
              </View>
              <Text style={styles.activityTitle}>{t.cardKick}</Text>

              <View style={styles.kickActionRow}>
                <View style={styles.kickMiniBadge}>
                  <Activity size={12} color={PALETTE.vibrantCrimson} />
                  <Text style={styles.kickMiniText}>{kickCount}/10</Text>
                </View>
                <Pressable style={styles.kickMiniBtn} onPress={handleLogKick}>
                  <Text style={styles.kickMiniBtnText}>{t.logKick}</Text>
                </Pressable>
              </View>
            </View>

            {/* Card 4: Calendar & Notes */}
            <Pressable
              style={[styles.activityCard, styles.activityCardAmber]}
              onPress={() => router.push('/records' as any)}
            >
              <View style={[styles.activityIconCircle, { backgroundColor: '#FDE68A' }]}>
                <CalendarDays size={34} color="#B45309" strokeWidth={2} />
              </View>
              <Text style={styles.activityTitle}>{t.cardCalendar}</Text>
            </Pressable>
          </View>

          {/* Live Session Card */}
          <View style={styles.liveSessionCard}>
            <View style={styles.liveLeft}>
              <View style={styles.livePill}>
                <Radio size={11} color={PALETTE.white} />
                <Text style={styles.livePillText}>{t.liveBadge}</Text>
              </View>
              <Text style={styles.liveTitleText}>{t.liveTitle}</Text>
              <Text style={styles.liveTimeText}>{t.liveTime}</Text>
            </View>

            <Pressable
              style={styles.liveJoinBtn}
              onPress={() =>
                Alert.alert(
                  'Live Audio Broadcast',
                  'Connecting to Sister Claire live broadcast...'
                )
              }
            >
              <Play size={14} color={PALETTE.white} fill={PALETTE.white} />
              <Text style={styles.liveJoinText}>{t.liveJoin}</Text>
            </Pressable>
          </View>

          {/* Urgent Danger Signs: Professional Lucide Icon Chips */}
          <View style={styles.dangerSection}>
            <View style={styles.dangerHeaderRow}>
              <View style={styles.dangerHeaderLeft}>
                <AlertTriangle size={15} color={PALETTE.vibrantCrimson} />
                <Text style={styles.dangerSectionTitle}>{t.dangerTitle}</Text>
              </View>

              <View style={styles.dangerActions}>
                <Pressable
                  style={styles.sosButton}
                  onPress={() =>
                    Alert.alert(
                      'Emergency Call 114',
                      'Calling Rwanda National Ambulance Service (SAMU)...'
                    )
                  }
                >
                  <PhoneCall size={12} color={PALETTE.white} />
                  <Text style={styles.sosButtonText}>{t.callSos}</Text>
                </Pressable>

                <Pressable
                  style={styles.voiceButton}
                  onPress={() => router.push('/report' as any)}
                >
                  <Mic size={13} color={PALETTE.deepViolet} />
                  <Text style={styles.voiceButtonText}>{t.voiceReport}</Text>
                </Pressable>
              </View>
            </View>

            {/* Professional Medical Lucide Icon Tiles */}
            <View style={styles.dangerChipsRow}>
              <Pressable
                style={styles.dangerChip}
                onPress={() => router.push('/report' as any)}
              >
                <View style={[styles.dangerIconBox, { backgroundColor: '#FFE8EC' }]}>
                  <Droplets size={18} color={PALETTE.vibrantCrimson} />
                </View>
                <Text style={styles.dangerChipText}>{t.dangerBleed}</Text>
              </Pressable>

              <Pressable
                style={styles.dangerChip}
                onPress={() => router.push('/report' as any)}
              >
                <View style={[styles.dangerIconBox, { backgroundColor: '#FFF5D6' }]}>
                  <Zap size={18} color="#D97706" />
                </View>
                <Text style={styles.dangerChipText}>{t.dangerPain}</Text>
              </Pressable>

              <Pressable
                style={styles.dangerChip}
                onPress={() => router.push('/report' as any)}
              >
                <View style={[styles.dangerIconBox, { backgroundColor: '#ECE4FA' }]}>
                  <Eye size={18} color={PALETTE.electricPurple} />
                </View>
                <Text style={styles.dangerChipText}>{t.dangerVision}</Text>
              </Pressable>

              <Pressable
                style={styles.dangerChip}
                onPress={() => router.push('/report' as any)}
              >
                <View style={[styles.dangerIconBox, { backgroundColor: '#FFE8EC' }]}>
                  <Thermometer size={18} color={PALETTE.deepRuby} />
                </View>
                <Text style={styles.dangerChipText}>{t.dangerFever}</Text>
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
    gap: 16,
  },
  containerWide: {
    maxWidth: 780,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  userProfileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    gap: 2,
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
    paddingVertical: 6,
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
    borderRadius: 28,
    paddingTop: 18,
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
    marginBottom: 10,
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
    marginVertical: 6,
  },
  haloOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 174, 158, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 96, 0.35)',
  },
  haloMid: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255, 232, 228, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginTop: 12,
  },
  metricCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PALETTE.cardSurface,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3E5E2',
  },
  capsuleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleTextCol: {
    flex: 1,
  },
  capsuleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9,
    color: PALETTE.gray500,
    textTransform: 'uppercase',
  },
  capsuleValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
  },

  /* Section Header */
  sectionHeaderWrap: {
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: PALETTE.black,
    letterSpacing: -0.2,
  },

  /* 2x2 Activity Grid */
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFD2F5',
    minHeight: 154,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  activityTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
    textAlign: 'center',
  },
  kickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  kickMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 25, 59, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  kickMiniText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.vibrantCrimson,
  },
  kickMiniBtn: {
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  kickMiniBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.white,
  },

  /* Live Session Card */
  liveSessionCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 22,
    padding: 16,
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
    gap: 4,
    flex: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 8,
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
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  liveJoinText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.white,
  },

  /* Danger Signs Section */
  dangerSection: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 16,
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
    fontSize: 14,
    color: PALETTE.black,
  },
  dangerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sosButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.white,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  voiceButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
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
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E6DAFA',
  },
  dangerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerChipText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.black,
    textAlign: 'center',
  },
});
