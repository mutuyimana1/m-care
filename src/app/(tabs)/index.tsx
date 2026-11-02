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
  AlertTriangle,
  ArrowRight,
  Baby,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  FileText,
  Footprints,
  HeartPulse,
  Hospital,
  MapPin,
  MessageSquareHeart,
  Mic,
  Phone,
  PhoneCall,
  Play,
  Radio,
  Repeat,
  Scale,
  Sparkles,
  Thermometer,
  User,
  UserCheck,
  Zap,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

export default function HomeScreen() {
  const [activeRole, setActiveRole] = useState<'mother' | 'chw'>('mother');
  const [district, setDistrict] = useState<'Kicukiro' | 'Nyagatare'>('Kicukiro');
  const [kickCount, setKickCount] = useState(7);
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');

  // CHW Alert State for interactive prototype testing (PRD §4.B & §10)
  const [case1Acknowledged, setCase1Acknowledged] = useState(false);
  const [case1Escalated, setCase1Escalated] = useState(false);
  const [workerFilter, setWorkerFilter] = useState<'all' | 'critical' | 'urgent' | 'routine'>('all');

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

  const toggleDistrict = () => {
    const nextDistrict = district === 'Kicukiro' ? 'Nyagatare' : 'Kicukiro';
    setDistrict(nextDistrict);
    Alert.alert(
      lang === 'EN' ? 'Pilot District Changed' : 'Akarere Gahinduwe',
      lang === 'EN'
        ? `Switched pilot catchment to ${nextDistrict} District (${nextDistrict === 'Kicukiro' ? 'Muhima & Masaka' : 'Nyagatare Hospital & Rukomo'}).`
        : `Wahinduye akarere k’icyitegererezo: Akarere ka ${nextDistrict}.`
    );
  };

  const t = {
    EN: {
      greeting: 'Good Morning ☀️',
      userName: 'Aline Uwase',
      pilotTag: `${district} Pilot Catchment`,
      countdownPill: '1 Month, 2 Days to Delivery',
      stageSubtitle: 'WEEK 28 · 3RD TRIMESTER',
      babyWeight: '1.1 kg',
      weightLabel: 'Baby Weight',
      gestation: '28 Weeks',
      gestationLabel: 'Cycle Days',
      activeCaseTitle: 'Active Referral #MC-KCK-8841',
      activeCaseSub: 'CHW Mukamana (Muhima HC) · Transfer to CHUK Maternity scheduled',
      activeCaseStatus: 'ACKNOWLEDGED',
      viewCase: 'Track Details',
      pillarsTitle: 'Maternal Care Services',
      pillarReport: 'Report Concern',
      pillarReportSub: 'Fast triage & alerts',
      pillarChat: 'Midwife Chat',
      pillarChatSub: 'Direct clinical advice',
      pillarEdu: 'Health Education',
      pillarEduSub: 'Nutrition & guidelines',
      pillarRecords: 'Care Records',
      pillarRecordsSub: 'ANC & hospital tracking',
      dailySection: 'Daily Monitoring',
      cardKick: 'Kick Counter',
      logKick: '+ Kick',
      liveBadge: 'LIVE',
      liveTitle: 'Breathing for Delivery',
      liveTime: '04:30 PM (CAT)',
      liveJoin: 'Join',
      dangerTitle: 'Urgent Danger Signs',
      dangerBleed: 'Bleeding',
      dangerPain: 'Severe Pain',
      dangerVision: 'Blurry Vision',
      dangerFever: 'High Fever',
      callSos: 'SOS 114',
      voiceReport: 'Voice Note',
      // CHW strings
      workerTitle: 'Community Health Worker Dashboard',
      workerSub: `CHW Mukamana · ${district === 'Kicukiro' ? 'Muhima Health Center' : 'Rukomo Health Center'}`,
      statOpenAlerts: 'Open Alerts',
      statResponseTime: 'Avg Response',
      statReferralRate: 'Referral Rate',
      filterAll: 'All',
      filterCritical: 'Critical',
      filterUrgent: 'Urgent',
      filterRoutine: 'Routine',
      actionAcknowledge: 'Acknowledge (SLA)',
      actionAcknowledged: 'Acknowledged',
      actionCall: 'Call Mother',
      actionEscalate: 'Escalate to CHUK',
      actionEscalated: 'Escalated to Hospital',
    },
    RW: {
      greeting: 'Muraho Neza ☀️',
      userName: 'Aline Uwase',
      pilotTag: `Akarere ka ${district}`,
      countdownPill: 'Hasigaye Ukwezi 1, Iminsi 2',
      stageSubtitle: 'ICYUMWERU CYA 28 · IGIHE CYA 3',
      babyWeight: 'Ibiro 1.1',
      weightLabel: 'Uburemere',
      gestation: 'Ibyumweru 28',
      gestationLabel: 'Igihe Cyose',
      activeCaseTitle: 'Ikirego Gikurikiranwa #MC-KCK-8841',
      activeCaseSub: 'Umujyanama Mukamana · Koherezwa mu bitaro bya CHUK',
      activeCaseStatus: 'BYAKIRIWE',
      viewCase: 'Gukurikirana',
      pillarsTitle: 'Serivisi z’Ubuzima bw’Umubyeyi',
      pillarReport: 'Tanga Impuruza',
      pillarReportSub: 'Kugenzura byihuse',
      pillarChat: 'Vugana n’Umubyaza',
      pillarChatSub: 'Inama z’inzobere',
      pillarEdu: 'Inyigisho z’Ubuzima',
      pillarEduSub: 'Imirire n’amabwiriza',
      pillarRecords: 'Amadosiye y’Ubuzima',
      pillarRecordsSub: 'Kwisuzumisha & Ibitaro',
      dailySection: 'Gukurikirana Umunsi',
      cardKick: 'Kubara Imigeri',
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
      // CHW strings
      workerTitle: 'Imbonerahamwe y’Umujyanama w’Ubuzima',
      workerSub: `Umujyanama Mukamana · ${district === 'Kicukiro' ? 'Ikigo Nderabuzima cya Muhima' : 'Ikigo Nderabuzima cya Rukomo'}`,
      statOpenAlerts: 'Impuruza Zifunguye',
      statResponseTime: 'Igihe cyo Gusubiza',
      statReferralRate: 'Ibikurikiranwa',
      filterAll: 'Zose',
      filterCritical: 'Bikabije',
      filterUrgent: 'Byihutirwa',
      filterRoutine: 'Bisanzwe',
      actionAcknowledge: 'Kwakira Impuruza',
      actionAcknowledged: 'Yarakiriwe',
      actionCall: 'Hamagara Umubyeyi',
      actionEscalate: 'Ohereza muri CHUK',
      actionEscalated: 'Yoherejwe mu Bitaro',
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
          {/* Top Pilot Catchment & Role Switcher Bar */}
          <View style={styles.topUtilityBar}>
            {/* Catchment pill */}
            <Pressable
              style={styles.pilotCatchmentPill}
              onPress={toggleDistrict}
            >
              <MapPin size={11} color={PALETTE.deepViolet} />
              <Text numberOfLines={1} style={styles.pilotCatchmentText}>
                {t.pilotTag} 🔄
              </Text>
            </Pressable>

            {/* Prototype Role Switcher (PRD §3 & §10 Acceptance Criteria) */}
            <View style={styles.roleToggleWrap}>
              <Pressable
                style={[
                  styles.roleToggleBtn,
                  activeRole === 'mother' && styles.roleToggleBtnActive,
                ]}
                onPress={() => setActiveRole('mother')}
              >
                <Baby
                  size={12}
                  color={activeRole === 'mother' ? PALETTE.white : PALETTE.gray600}
                />
                <Text
                  style={[
                    styles.roleToggleText,
                    activeRole === 'mother' && styles.roleToggleTextActive,
                  ]}
                >
                  Mother
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleToggleBtn,
                  activeRole === 'chw' && styles.roleToggleBtnActiveChw,
                ]}
                onPress={() => setActiveRole('chw')}
              >
                <UserCheck
                  size={12}
                  color={activeRole === 'chw' ? PALETTE.white : PALETTE.gray600}
                />
                <Text
                  style={[
                    styles.roleToggleText,
                    activeRole === 'chw' && styles.roleToggleTextActive,
                  ]}
                >
                  CHW / Worker
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ======================================================== */}
          {/* VIEW A: MOTHER / WOMAN INTERFACE (PRD §4.A)            */}
          {/* ======================================================== */}
          {activeRole === 'mother' ? (
            <>
              {/* Header Row: User Profile & Actions */}
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
                        lang === 'EN' ? 'Care Notifications' : 'Imenyekanisha',
                        lang === 'EN'
                          ? '1. Iron supplement refill due tomorrow at Muhima HC.\n2. CHW Mukamana confirmed home visit today 3:00 PM.'
                          : '1. Kwakira imiti y’ubutare ejo ku kigo nderabuzima cya Muhima.\n2. Umujyanama Mukamana yemeje ko azasura uyu munsi saa cyenda.'
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
                {/* Top countdown pill */}
                <View
                  style={[
                    styles.milestoneBadgePill,
                    isSmall && { paddingHorizontal: 10, paddingVertical: 4 },
                  ]}
                >
                  <Sparkles size={isSmall ? 11 : 13} color={PALETTE.goldenYellow} />
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
                    <HeartPulse size={12} color={PALETTE.goldenYellow} />
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
                        { backgroundColor: 'rgba(255, 25, 59, 0.28)' },
                        isSmall && { width: 28, height: 28, borderRadius: 8 },
                      ]}
                    >
                      <Scale size={isSmall ? 14 : 17} color={PALETTE.white} />
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
                        { backgroundColor: 'rgba(255, 199, 25, 0.28)' },
                        isSmall && { width: 28, height: 28, borderRadius: 8 },
                      ]}
                    >
                      <Repeat size={isSmall ? 14 : 17} color={PALETTE.goldenYellow} />
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

              {/* ACTIVE CASE & REFERRAL STATUS BANNER (PRD §4.A, §5 & §8) */}
              <Pressable
                style={styles.activeCaseCard}
                onPress={() => router.push('/records' as any)}
              >
                <View style={styles.activeCaseTop}>
                  <View style={styles.activeCaseIconBox}>
                    <Hospital size={16} color={PALETTE.deepViolet} />
                  </View>
                  <View style={styles.activeCaseTitleWrap}>
                    <Text numberOfLines={1} style={styles.activeCaseTitle}>
                      {t.activeCaseTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.activeCaseSub}>
                      {t.activeCaseSub}
                    </Text>
                  </View>
                  <View style={styles.activeCaseBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.activeCaseBadgeText}>
                      {t.activeCaseStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeCaseFooter}>
                  <View style={styles.activeCaseDetailRow}>
                    <UserCheck size={13} color={PALETTE.deepViolet} />
                    <Text style={styles.activeCaseDetailText}>
                      Home Visit: Today, 03:00 PM · CHW Mukamana
                    </Text>
                  </View>
                  <View style={styles.activeCaseActionPill}>
                    <Text style={styles.activeCaseActionText}>{t.viewCase}</Text>
                    <ArrowRight size={11} color={PALETTE.deepViolet} />
                  </View>
                </View>
              </Pressable>

              {/* CORE PRD CLINICAL PILLARS (PRD §4.A & §5) */}
              <View style={styles.sectionHeaderWrap}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isSmall && { fontSize: 16 },
                  ]}
                >
                  {t.pillarsTitle}
                </Text>
              </View>

              {/* 2x2 Clean Clinical Pillars Grid */}
              <View style={[styles.activityGrid, isSmall && { gap: 8 }]}>
                {/* Pillar 1: Report Concern (PRD §4.A & §8) */}
                <Pressable
                  style={[
                    styles.activityCard,
                    styles.activityCardPeach,
                    isSmall && { padding: 10, minHeight: 120, borderRadius: 18 },
                  ]}
                  onPress={() => router.push('/report' as any)}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: '#FFD7D0' },
                      isSmall && { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
                    ]}
                  >
                    <AlertTriangle
                      size={isSmall ? 22 : 26}
                      color={PALETTE.vibrantCrimson}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.activityTitle,
                      isSmall && { fontSize: 12, lineHeight: 15 },
                    ]}
                  >
                    {t.pillarReport}
                  </Text>
                  <Text numberOfLines={1} style={styles.activitySubtext}>
                    {t.pillarReportSub}
                  </Text>
                </Pressable>

                {/* Pillar 2: Midwife Chat (PRD §4.A) */}
                <Pressable
                  style={[
                    styles.activityCard,
                    styles.activityCardLavender,
                    isSmall && { padding: 10, minHeight: 120, borderRadius: 18 },
                  ]}
                  onPress={() => router.push('/chat' as any)}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: '#E2D3FA' },
                      isSmall && { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
                    ]}
                  >
                    <MessageSquareHeart
                      size={isSmall ? 22 : 26}
                      color={PALETTE.electricPurple}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.activityTitle,
                      isSmall && { fontSize: 12, lineHeight: 15 },
                    ]}
                  >
                    {t.pillarChat}
                  </Text>
                  <Text numberOfLines={1} style={styles.activitySubtext}>
                    {t.pillarChatSub}
                  </Text>
                </Pressable>

                {/* Pillar 3: Health Education (PRD §4.A) */}
                <Pressable
                  style={[
                    styles.activityCard,
                    styles.activityCardAmber,
                    isSmall && { padding: 10, minHeight: 120, borderRadius: 18 },
                  ]}
                  onPress={() => router.push('/education' as any)}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: '#FDE68A' },
                      isSmall && { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
                    ]}
                  >
                    <BookOpen
                      size={isSmall ? 22 : 26}
                      color="#B45309"
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.activityTitle,
                      isSmall && { fontSize: 12, lineHeight: 15 },
                    ]}
                  >
                    {t.pillarEdu}
                  </Text>
                  <Text numberOfLines={1} style={styles.activitySubtext}>
                    {t.pillarEduSub}
                  </Text>
                </Pressable>

                {/* Pillar 4: Care Records & Referrals (PRD §4.A & §4.B) */}
                <Pressable
                  style={[
                    styles.activityCard,
                    styles.activityCardSurface,
                    isSmall && { padding: 10, minHeight: 120, borderRadius: 18 },
                  ]}
                  onPress={() => router.push('/records' as any)}
                >
                  <View
                    style={[
                      styles.activityIconCircle,
                      { backgroundColor: '#EDE4FA' },
                      isSmall && { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
                    ]}
                  >
                    <FileText
                      size={isSmall ? 22 : 26}
                      color={PALETTE.deepViolet}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.activityTitle,
                      isSmall && { fontSize: 12, lineHeight: 15 },
                    ]}
                  >
                    {t.pillarRecords}
                  </Text>
                  <Text numberOfLines={1} style={styles.activitySubtext}>
                    {t.pillarRecordsSub}
                  </Text>
                </Pressable>
              </View>

              {/* Daily Monitoring Sub-Bar: Kick Tracker & Audio */}
              <View style={[styles.dailyMonitorBar, isSmall && { padding: 10 }]}>
                <View style={styles.kickMonitorLeft}>
                  <Footprints size={18} color={PALETTE.vibrantCrimson} />
                  <View>
                    <Text style={styles.kickBarTitle}>{t.cardKick}</Text>
                    <Text style={styles.kickBarSub}>
                      {kickCount}/10 kicks logged today
                    </Text>
                  </View>
                </View>
                <Pressable style={styles.kickMiniBtn} onPress={handleLogKick}>
                  <Text style={styles.kickMiniBtnText}>{t.logKick}</Text>
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
                      'Live Audio Session',
                      'Connecting to Sister Claire interactive broadcast on Rwanda Maternal Network...'
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
                          'Connecting to Rwanda National Ambulance Service (SAMU 114 / 912)...'
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
            </>
          ) : (
            /* ======================================================== */
            /* VIEW B: HEALTHCARE WORKER / CHW DASHBOARD (PRD §4.B & §10)*/
            /* ======================================================== */
            <View style={styles.workerContainer}>
              {/* Worker Profile Header */}
              <View style={styles.workerHeaderCard}>
                <View style={styles.workerHeaderTop}>
                  <View style={styles.workerAvatar}>
                    <UserCheck size={22} color={PALETTE.white} />
                  </View>
                  <View style={styles.workerHeaderText}>
                    <View style={styles.workerBadgeRow}>
                      <Text style={styles.workerBadgeRole}>CERTIFIED CHW</Text>
                      <View style={styles.onlinePill}>
                        <View style={styles.greenDot} />
                        <Text style={styles.onlineText}>ON DUTY</Text>
                      </View>
                    </View>
                    <Text style={styles.workerName}>{t.workerTitle}</Text>
                    <Text style={styles.workerSub}>{t.workerSub}</Text>
                  </View>
                </View>

                {/* Reporting Overview Indicators (PRD §4.B) */}
                <View style={styles.kpiRow}>
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>3</Text>
                    <Text style={styles.kpiLabel}>{t.statOpenAlerts}</Text>
                  </View>
                  <View style={styles.kpiDivider} />
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>12m</Text>
                    <Text style={styles.kpiLabel}>{t.statResponseTime}</Text>
                  </View>
                  <View style={styles.kpiDivider} />
                  <View style={styles.kpiBox}>
                    <Text style={styles.kpiValue}>100%</Text>
                    <Text style={styles.kpiLabel}>{t.statReferralRate}</Text>
                  </View>
                </View>
              </View>

              {/* Priority Filter Bar */}
              <View style={styles.filterBar}>
                {(['all', 'critical', 'urgent', 'routine'] as const).map((filter) => {
                  const isActive = workerFilter === filter;
                  return (
                    <Pressable
                      key={filter}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() => setWorkerFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {filter === 'all'
                          ? `${t.filterAll} (3)`
                          : filter === 'critical'
                          ? `${t.filterCritical} (1)`
                          : filter === 'urgent'
                          ? `${t.filterUrgent} (1)`
                          : `${t.filterRoutine} (1)`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Assigned Alert 1: Critical (Aline Uwase) */}
              {(workerFilter === 'all' || workerFilter === 'critical') && (
                <View style={styles.alertCardCritical}>
                  <View style={styles.alertCardHeader}>
                    <View style={styles.priorityBadgeCritical}>
                      <AlertTriangle size={11} color={PALETTE.white} />
                      <Text style={styles.priorityBadgeText}>CRITICAL · 15M SLA</Text>
                    </View>
                    <Text style={styles.alertTime}>14 mins ago</Text>
                  </View>

                  <View style={styles.alertPatientRow}>
                    <View style={styles.alertPatientAvatar}>
                      <User size={18} color={PALETTE.vibrantCrimson} />
                    </View>
                    <View style={styles.alertPatientInfo}>
                      <Text style={styles.alertPatientName}>Aline Uwase (Week 28)</Text>
                      <Text style={styles.alertPatientLoc}>
                        📍 Kicukiro · Muhima Sector · +250 788 123 456
                      </Text>
                    </View>
                  </View>

                  <View style={styles.alertSymptomsBox}>
                    <Text style={styles.alertSymptomsLabel}>Reported Danger Signs:</Text>
                    <Text style={styles.alertSymptomsText}>
                      • Severe vaginal bleeding (onset &lt; 2 hours ago)
                      {'\n'}• Persistent lower abdomen cramping
                    </Text>
                  </View>

                  {/* Actions according to PRD §4.B */}
                  <View style={styles.alertActionButtons}>
                    <Pressable
                      style={[
                        styles.ackButton,
                        case1Acknowledged && styles.ackButtonSuccess,
                      ]}
                      onPress={() => {
                        setCase1Acknowledged(true);
                        Alert.alert(
                          'Alert Acknowledged',
                          'Documented in MOH Triage Registry. SLA clock stopped at 14 mins.'
                        );
                      }}
                    >
                      {case1Acknowledged ? (
                        <CheckCheck size={14} color={PALETTE.white} />
                      ) : (
                        <CheckCircle2 size={14} color={PALETTE.white} />
                      )}
                      <Text style={styles.ackButtonText}>
                        {case1Acknowledged ? t.actionAcknowledged : t.actionAcknowledge}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.callButton}
                      onPress={() =>
                        Alert.alert(
                          'Calling Patient',
                          'Dialing Aline Uwase at +250 788 123 456...'
                        )
                      }
                    >
                      <Phone size={14} color={PALETTE.deepViolet} />
                      <Text style={styles.callButtonText}>{t.actionCall}</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.escalateButton,
                        case1Escalated && styles.escalateButtonSuccess,
                      ]}
                      onPress={() => {
                        setCase1Escalated(true);
                        Alert.alert(
                          'Escalated to Hospital',
                          'Direct emergency transfer initiated to Centre Hospitalier Universitaire de Kigali (CHUK) Maternity Wing. Ambulance notified.'
                        );
                      }}
                    >
                      <Hospital size={14} color={PALETTE.white} />
                      <Text style={styles.escalateButtonText}>
                        {case1Escalated ? t.actionEscalated : t.actionEscalate}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Assigned Alert 2: Urgent (Grace Mugisha) */}
              {(workerFilter === 'all' || workerFilter === 'urgent') && (
                <View style={styles.alertCardUrgent}>
                  <View style={styles.alertCardHeader}>
                    <View style={styles.priorityBadgeUrgent}>
                      <Clock size={11} color={PALETTE.white} />
                      <Text style={styles.priorityBadgeText}>URGENT · 2H SLA</Text>
                    </View>
                    <Text style={styles.alertTime}>42 mins ago</Text>
                  </View>

                  <View style={styles.alertPatientRow}>
                    <View style={[styles.alertPatientAvatar, { backgroundColor: '#FEF3C7' }]}>
                      <User size={18} color="#D97706" />
                    </View>
                    <View style={styles.alertPatientInfo}>
                      <Text style={styles.alertPatientName}>Grace Mugisha (Week 34)</Text>
                      <Text style={styles.alertPatientLoc}>
                        📍 Kicukiro · Gahanga Sector · +250 788 654 321
                      </Text>
                    </View>
                  </View>

                  <View style={styles.alertSymptomsBox}>
                    <Text style={styles.alertSymptomsLabel}>Reported Concern:</Text>
                    <Text style={styles.alertSymptomsText}>
                      • Baby kicks reduced to 2 movements today
                    </Text>
                  </View>

                  <View style={styles.alertActionButtons}>
                    <Pressable
                      style={styles.ackButton}
                      onPress={() =>
                        Alert.alert(
                          'Home Visit Documented',
                          'Home visit scheduled for Grace Mugisha today at 14:00.'
                        )
                      }
                    >
                      <CalendarDays size={14} color={PALETTE.white} />
                      <Text style={styles.ackButtonText}>Schedule Home Visit</Text>
                    </Pressable>

                    <Pressable
                      style={styles.callButton}
                      onPress={() =>
                        Alert.alert('Calling Patient', 'Dialing Grace Mugisha...')
                      }
                    >
                      <Phone size={14} color={PALETTE.deepViolet} />
                      <Text style={styles.callButtonText}>{t.actionCall}</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Assigned Alert 3: Routine (Diane Mutoni) */}
              {(workerFilter === 'all' || workerFilter === 'routine') && (
                <View style={styles.alertCardRoutine}>
                  <View style={styles.alertCardHeader}>
                    <View style={styles.priorityBadgeRoutine}>
                      <CheckCircle2 size={11} color={PALETTE.white} />
                      <Text style={styles.priorityBadgeText}>ROUTINE FOLLOW-UP</Text>
                    </View>
                    <Text style={styles.alertTime}>3 hours ago</Text>
                  </View>

                  <View style={styles.alertPatientRow}>
                    <View style={[styles.alertPatientAvatar, { backgroundColor: '#ECE4FA' }]}>
                      <Baby size={18} color={PALETTE.deepViolet} />
                    </View>
                    <View style={styles.alertPatientInfo}>
                      <Text style={styles.alertPatientName}>Diane Mutoni (Postpartum Day 5)</Text>
                      <Text style={styles.alertPatientLoc}>
                        📍 Kicukiro · Niboye Sector · +250 788 998 877
                      </Text>
                    </View>
                  </View>

                  <View style={styles.alertSymptomsBox}>
                    <Text style={styles.alertSymptomsLabel}>Care Objective:</Text>
                    <Text style={styles.alertSymptomsText}>
                      • Postnatal home assessment & BCG vaccination check
                    </Text>
                  </View>

                  <View style={styles.alertActionButtons}>
                    <Pressable
                      style={[styles.callButton, { flex: 1 }]}
                      onPress={() =>
                        Alert.alert(
                          'Document Visit',
                          'Logging completed postnatal visit for Diane Mutoni.'
                        )
                      }
                    >
                      <CheckCheck size={14} color={PALETTE.deepViolet} />
                      <Text style={styles.callButtonText}>Complete Visit Log</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
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

  /* Top Pilot Catchment & Role Switcher Bar */
  topUtilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 8,
  },
  pilotCatchmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    flexShrink: 1,
  },
  pilotCatchmentText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
  },
  roleToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7DCF8',
    borderRadius: 16,
    padding: 3,
    gap: 2,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
  },
  roleToggleBtnActive: {
    backgroundColor: PALETTE.deepViolet,
  },
  roleToggleBtnActiveChw: {
    backgroundColor: PALETTE.vibrantCrimson,
  },
  roleToggleText: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: PALETTE.gray600,
  },
  roleToggleTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    position: 'absolute',
    top: 9,
    right: 9,
    borderWidth: 1.5,
    borderColor: PALETTE.cardSurface,
  },

  /* Fetal Telemetry & Gestational Milestone Hero Card */
  heroCard: {
    backgroundColor: PALETTE.deepViolet,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5920B8',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  milestoneBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 199, 25, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 25, 0.4)',
  },
  milestoneBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.goldenYellow,
    letterSpacing: 0.2,
  },
  fetalTelemetryWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  haloOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 25, 59, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 25, 59, 0.4)',
  },
  haloMid: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255, 25, 59, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  telemetryTagText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.white,
    letterSpacing: 0.3,
  },
  metricCapsulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  metricCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    minWidth: 0,
  },
  capsuleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  capsuleTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  capsuleLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.2,
  },
  capsuleValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.white,
    letterSpacing: -0.2,
  },

  /* Active Case & Referral Banner (PRD §4.A, §5 & §8) */
  activeCaseCard: {
    backgroundColor: '#FFF4E8',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  activeCaseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeCaseIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFE2C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCaseTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  activeCaseTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
  },
  activeCaseSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray600,
  },
  activeCaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  activeCaseBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    color: '#9A3412',
  },
  activeCaseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FDE6D2',
    gap: 8,
  },
  activeCaseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    minWidth: 0,
  },
  activeCaseDetailText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  activeCaseActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFE4D1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeCaseActionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
  },

  /* Section Headers */
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
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
    width: '100%',
  },
  activityCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 124,
    borderRadius: 22,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityCardPeach: {
    backgroundColor: PALETTE.cardPeach,
    borderColor: '#FFD4DC',
  },
  activityCardLavender: {
    backgroundColor: PALETTE.cardLavender,
    borderColor: '#DFD2F5',
  },
  activityCardAmber: {
    backgroundColor: PALETTE.cardAmber,
    borderColor: '#FEE5A5',
  },
  activityCardSurface: {
    backgroundColor: PALETTE.cardSurface,
    borderColor: '#E8DDF8',
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
    textAlign: 'center',
  },
  activitySubtext: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: PALETTE.gray500,
    textAlign: 'center',
    marginTop: 2,
  },

  /* Daily Kick Monitor Bar */
  dailyMonitorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F3',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFDCE4',
  },
  kickMonitorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kickBarTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
  },
  kickBarSub: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.vibrantCrimson,
  },
  kickMiniBtn: {
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kickMiniBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
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
    borderColor: '#E8DDF8',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  liveLeft: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  livePillText: {
    fontFamily: Fonts.bold,
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  liveJoinText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.white,
  },

  /* Urgent Danger Signs */
  dangerSection: {
    backgroundColor: '#FFF0F3',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFD4DC',
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
    color: PALETTE.vibrantCrimson,
  },
  dangerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    paddingVertical: 5,
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
    backgroundColor: PALETTE.white,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFE0E6',
    minWidth: 0,
  },
  dangerIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerChipText: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    color: PALETTE.black,
  },

  /* ======================================================== */
  /* CHW WORKER DASHBOARD STYLES (PRD §4.B)                  */
  /* ======================================================== */
  workerContainer: {
    gap: 14,
  },
  workerHeaderCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 14,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  workerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PALETTE.electricPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  workerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  workerBadgeRole: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    color: PALETTE.electricPurple,
    letterSpacing: 0.5,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  onlineText: {
    fontFamily: Fonts.bold,
    fontSize: 8.5,
    color: '#166534',
  },
  workerName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: PALETTE.black,
  },
  workerSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray500,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7FD',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ECE4FA',
  },
  kpiBox: {
    flex: 1,
    alignItems: 'center',
  },
  kpiValue: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: PALETTE.deepViolet,
  },
  kpiLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: PALETTE.gray500,
    marginTop: 1,
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5D9F6',
  },

  /* Priority Filter Bar */
  filterBar: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: PALETTE.cardSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  filterChipActive: {
    backgroundColor: PALETTE.deepViolet,
    borderColor: PALETTE.deepViolet,
  },
  filterChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    color: PALETTE.gray600,
  },
  filterChipTextActive: {
    color: PALETTE.white,
    fontFamily: Fonts.bold,
  },

  /* Assigned Alert Cards */
  alertCardCritical: {
    backgroundColor: '#FFF0F3',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFD4DC',
    gap: 10,
  },
  alertCardUrgent: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 10,
  },
  alertCardRoutine: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 10,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadgeCritical: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityBadgeUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityBadgeRoutine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.deepViolet,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: PALETTE.white,
    letterSpacing: 0.3,
  },
  alertTime: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: PALETTE.gray500,
  },
  alertPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertPatientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertPatientInfo: {
    flex: 1,
    minWidth: 0,
  },
  alertPatientName: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.black,
  },
  alertPatientLoc: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: PALETTE.gray500,
    marginTop: 1,
  },
  alertSymptomsBox: {
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1E9FA',
    gap: 3,
  },
  alertSymptomsLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    color: PALETTE.gray600,
  },
  alertSymptomsText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.black,
    lineHeight: 16,
  },
  alertActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  ackButton: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: PALETTE.deepViolet,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  ackButtonSuccess: {
    backgroundColor: '#16A34A',
  },
  ackButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.white,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: PALETTE.cardLavender,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  callButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  escalateButton: {
    flex: 1,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  escalateButtonSuccess: {
    backgroundColor: '#B8001C',
  },
  escalateButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.white,
  },
});
