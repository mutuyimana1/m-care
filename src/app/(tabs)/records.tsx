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
import {
  Ambulance,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Hospital,
  MapPin,
  Pill,
  QrCode,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

interface AncVisit {
  number: number;
  week: string;
  date: string;
  status: 'completed' | 'upcoming' | 'pending';
  notes: string;
}

const ANC_SCHEDULE: AncVisit[] = [
  {
    number: 1,
    week: 'Week 12',
    date: 'Aug 14, 2026',
    status: 'completed',
    notes: 'Initial bloodwork, ultrasound confirmation, tetanus dose 1',
  },
  {
    number: 2,
    week: 'Week 20',
    date: 'Oct 08, 2026',
    status: 'completed',
    notes: 'Fetal anatomy scan, blood pressure 118/74, weight 62kg',
  },
  {
    number: 3,
    week: 'Week 26',
    date: 'Nov 12, 2026',
    status: 'completed',
    notes: 'Glucose test normal, fetal heartbeat 142 bpm, iron refilled',
  },
  {
    number: 4,
    week: 'Week 30',
    date: 'Dec 10, 2026',
    status: 'upcoming',
    notes: 'Fetal growth check, second tetanus booster dose',
  },
  {
    number: 5,
    week: 'Week 34',
    date: 'Jan 07, 2027',
    status: 'pending',
    notes: 'Birth plan review & emergency transport coordination',
  },
];

interface ReferralStep {
  title: string;
  time: string;
  desc: string;
  done: boolean;
  active?: boolean;
}

const REFERRAL_TIMELINE: ReferralStep[] = [
  {
    title: 'Maternal Alert Submitted',
    time: '09:15 AM (Today)',
    desc: 'Severe cramping and spotting reported by Aline Uwase via M-CARE',
    done: true,
  },
  {
    title: 'Acknowledged by CHW Mukamana',
    time: '09:28 AM (13 min SLA)',
    desc: 'Contact attempt logged, telephone triage conducted',
    done: true,
  },
  {
    title: 'Escalation to Referral Hospital',
    time: '09:35 AM (Today)',
    desc: 'Escalated by Muhima Health Center to CHUK Maternity Wing',
    done: true,
  },
  {
    title: 'CHUK Receiving Confirmation',
    time: '09:42 AM (Today)',
    desc: 'Receipt confirmed by Dr. Mutara, Specialist Obstetric Unit',
    done: true,
    active: true,
  },
  {
    title: 'Documented Post-Care Follow-up',
    time: 'Tomorrow, 10:00 AM',
    desc: 'Scheduled CHW home checkup and blood pressure monitoring',
    done: false,
  },
];

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState<'passport' | 'referrals'>('passport');
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');

  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const isWide = width >= 768;

  const t = {
    EN: {
      headerBadge: 'PATIENT PROFILE & REFERRALS',
      title: 'Maternal Health Records',
      subtitle: 'Synchronized with Rwanda MOH National Digital Health System',
      tabPassport: 'Maternal Passport',
      tabReferrals: 'Referral & Case Tracker',
      dueLabel: 'Estimated Due',
      gestationLabel: 'Gestational Age',
      clinicLabel: 'Primary Clinic',
      activeRefTitle: 'Active Referral #MC-KCK-8841',
      activeRefSub: 'Specialist Ultrasound Review & Triage Escalation',
      hospitalName: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
      hospitalDept: 'Maternity & Neonatal Specialized Wing',
      refStatus: 'CONFIRMED AT CHUK',
      ambulanceTag: 'Ambulance Unit GR-0412 En Route',
      timelineHeading: 'Case & Escalation Timeline',
      ancHeading: 'Antenatal Care (ANC) Visits',
      ancCount: '3 of 8 completed',
      supplementsHeading: 'Active Supplements & Immunizations',
      exportBtn: 'Download Digital Health Card (PDF)',
    },
    RW: {
      headerBadge: 'DOSIYE Y’UMUBYEYI N’IBITARO',
      title: 'Amadosiye y’Ubuzima',
      subtitle: 'Bihujwe na Minisiteri y’Ubuzima mu Rwanda (MOH)',
      tabPassport: 'Dosiye y’Umubyeyi',
      tabReferrals: 'Gukurikirana Ibitaro',
      dueLabel: 'Igihe cyo Kubyara',
      gestationLabel: 'Igihe Inda Imaze',
      clinicLabel: 'Ikigo Nderabuzima',
      activeRefTitle: 'Ubutumwa bwo Kohereza #MC-KCK-8841',
      activeRefSub: 'Gusuzumirwa mu bitaro bikuru bya CHUK',
      hospitalName: 'Ibitaro Bikuru bya Kaminuza bya Kigali (CHUK)',
      hospitalDept: 'Ishami ry’Ababyeyi n’Impigihe',
      refStatus: 'BYAKIRIWE MURI CHUK',
      ambulanceTag: 'Imbangukiragutabara GR-0412 Iri mu Nzira',
      timelineHeading: 'Urutonde rw’Ibikorwa n’Igihe',
      ancHeading: 'Kwipimisha mu Gihe cyo Gutwita',
      ancCount: '3 kuri 8 byarangiye',
      supplementsHeading: 'Imiti n’Inkingo Zihari',
      exportBtn: 'Kumanura Ikarita y’Ubuzima (PDF)',
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.badge}>
                <FileText size={12} color={PALETTE.deepViolet} />
                <Text style={styles.badgeText}>{t.headerBadge}</Text>
              </View>

              <Pressable
                style={styles.langPill}
                onPress={() => setLang(lang === 'EN' ? 'RW' : 'EN')}
              >
                <Text style={styles.langPillText}>
                  {lang === 'EN' ? '🇷🇼 RW' : '🇬🇧 EN'}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.title, isSmall && { fontSize: 22 }]}>
              {t.title}
            </Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          {/* Dual Segmented Tab Navigation (PRD §4.A & §4.B) */}
          <View style={styles.tabSegmentBar}>
            <Pressable
              style={[
                styles.tabSegmentBtn,
                activeTab === 'passport' && styles.tabSegmentBtnActive,
              ]}
              onPress={() => setActiveTab('passport')}
            >
              <FileCheck2
                size={14}
                color={activeTab === 'passport' ? PALETTE.white : PALETTE.gray600}
              />
              <Text
                style={[
                  styles.tabSegmentText,
                  activeTab === 'passport' && styles.tabSegmentTextActive,
                ]}
              >
                {t.tabPassport}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabSegmentBtn,
                activeTab === 'referrals' && styles.tabSegmentBtnActive,
              ]}
              onPress={() => setActiveTab('referrals')}
            >
              <Hospital
                size={14}
                color={activeTab === 'referrals' ? PALETTE.white : PALETTE.gray600}
              />
              <Text
                style={[
                  styles.tabSegmentText,
                  activeTab === 'referrals' && styles.tabSegmentTextActive,
                ]}
              >
                {t.tabReferrals}
              </Text>
            </Pressable>
          </View>

          {/* ======================================================== */}
          {/* TAB 1: MATERNAL PASSPORT & ANC (PRD §4.A)               */}
          {/* ======================================================== */}
          {activeTab === 'passport' ? (
            <>
              {/* Mother's ID Card (Deep Violet Hero) */}
              <View
                style={[
                  styles.profileCard,
                  isSmall && { padding: 14, borderRadius: 20 },
                ]}
              >
                <View style={styles.profileTop}>
                  <View
                    style={[
                      styles.avatarBox,
                      isSmall && { width: 40, height: 40, borderRadius: 20 },
                    ]}
                  >
                    <User size={isSmall ? 20 : 26} color={PALETTE.white} />
                  </View>
                  <View style={styles.profileDetails}>
                    <Text
                      numberOfLines={1}
                      style={[styles.profileName, isSmall && { fontSize: 16 }]}
                    >
                      Aline Uwase
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.profileId, isSmall && { fontSize: 11 }]}
                    >
                      M-CARE ID: RW-04-2026-9932
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.bloodBadge,
                      isSmall && { paddingHorizontal: 8, paddingVertical: 3 },
                    ]}
                  >
                    <Text
                      style={[styles.bloodBadgeText, isSmall && { fontSize: 12 }]}
                    >
                      O+
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.profileStatsRow,
                    isSmall && { paddingVertical: 8, paddingHorizontal: 6 },
                  ]}
                >
                  <View style={styles.statBox}>
                    <Text
                      numberOfLines={1}
                      style={[styles.statLabel, isSmall && { fontSize: 8.5 }]}
                    >
                      {t.dueLabel}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.statValue, isSmall && { fontSize: 11 }]}
                    >
                      Feb 18, 2027
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text
                      numberOfLines={1}
                      style={[styles.statLabel, isSmall && { fontSize: 8.5 }]}
                    >
                      {t.gestationLabel}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.statValue, isSmall && { fontSize: 11 }]}
                    >
                      Week 28 (7 Mo)
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text
                      numberOfLines={1}
                      style={[styles.statLabel, isSmall && { fontSize: 8.5 }]}
                    >
                      {t.clinicLabel}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.statValue, isSmall && { fontSize: 11 }]}
                    >
                      Muhima HC
                    </Text>
                  </View>
                </View>
              </View>

              {/* Antenatal Care (ANC) Visits Timeline (Soft Lavender) */}
              <View style={styles.ancSection}>
                <View style={styles.ancHeader}>
                  <Text style={styles.sectionHeading}>{t.ancHeading}</Text>
                  <Text style={styles.ancCounter}>{t.ancCount}</Text>
                </View>

                <View style={styles.timeline}>
                  {ANC_SCHEDULE.map((visit, index) => {
                    const isCompleted = visit.status === 'completed';
                    const isUpcoming = visit.status === 'upcoming';
                    return (
                      <View key={visit.number} style={styles.timelineItem}>
                        <View style={styles.timelineIndicatorCol}>
                          <View
                            style={[
                              styles.timelineDot,
                              isCompleted && styles.timelineDotCompleted,
                              isUpcoming && styles.timelineDotUpcoming,
                            ]}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={16} color={PALETTE.white} />
                            ) : isUpcoming ? (
                              <Clock size={14} color={PALETTE.white} />
                            ) : (
                              <Text style={styles.timelineDotNumber}>{visit.number}</Text>
                            )}
                          </View>
                          {index < ANC_SCHEDULE.length - 1 && (
                            <View
                              style={[
                                styles.timelineLine,
                                isCompleted && styles.timelineLineCompleted,
                              ]}
                            />
                          )}
                        </View>

                        <View
                          style={[
                            styles.timelineContent,
                            isUpcoming && styles.timelineContentUpcoming,
                          ]}
                        >
                          <View style={styles.timelineContentTop}>
                            <Text style={styles.visitNumber}>
                              ANC {visit.number} · {visit.week}
                            </Text>
                            <Text style={styles.visitDate}>{visit.date}</Text>
                          </View>
                          <Text style={styles.visitNotes}>{visit.notes}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Prescribed Supplements & Immunizations */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>{t.supplementsHeading}</Text>
                <View style={styles.supplementRow}>
                  <View style={styles.supplementIconBox}>
                    <Pill size={18} color={PALETTE.vibrantCrimson} />
                  </View>
                  <View style={styles.supplementTextWrap}>
                    <Text style={styles.supplementName}>Iron & Folic Acid Tablets</Text>
                    <Text style={styles.supplementDose}>
                      1 tablet daily with meals (60mg Iron / 400mcg Folate)
                    </Text>
                  </View>
                  <ShieldCheck size={20} color="#059669" />
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.supplementRow}>
                  <View style={[styles.supplementIconBox, { backgroundColor: '#E2D6FB' }]}>
                    <ShieldCheck size={18} color={PALETTE.deepViolet} />
                  </View>
                  <View style={styles.supplementTextWrap}>
                    <Text style={styles.supplementName}>Tetanus Toxoid Vaccine (TT2)</Text>
                    <Text style={styles.supplementDose}>
                      Administered at Week 20 · Valid through 2029
                    </Text>
                  </View>
                  <ShieldCheck size={20} color="#059669" />
                </View>
              </View>
            </>
          ) : (
            /* ======================================================== */
            /* TAB 2: ACTIVE REFERRALS & CASE TRACKER (PRD §4.A, §4.B, §8)*/
            /* ======================================================== */
            <>
              {/* Active Referral Card */}
              <View style={styles.referralCardHero}>
                <View style={styles.referralHeroTop}>
                  <View style={styles.referralHeroIcon}>
                    <Hospital size={22} color={PALETTE.white} />
                  </View>
                  <View style={styles.referralHeroDetails}>
                    <Text style={styles.referralHeroTitle}>{t.activeRefTitle}</Text>
                    <Text style={styles.referralHeroSub}>{t.activeRefSub}</Text>
                  </View>
                  <View style={styles.referralHeroBadge}>
                    <CheckCircle2 size={12} color="#166534" />
                    <Text style={styles.referralHeroBadgeText}>{t.refStatus}</Text>
                  </View>
                </View>

                <View style={styles.destinationBox}>
                  <View style={styles.destRow}>
                    <MapPin size={16} color={PALETTE.deepViolet} />
                    <Text style={styles.destHospital}>{t.hospitalName}</Text>
                  </View>
                  <Text style={styles.destDept}>{t.hospitalDept}</Text>
                </View>

                {/* Transport & CHW Support */}
                <View style={styles.referralMetaGrid}>
                  <View style={styles.referralMetaItem}>
                    <Ambulance size={14} color={PALETTE.vibrantCrimson} />
                    <Text style={styles.referralMetaText}>{t.ambulanceTag}</Text>
                  </View>
                  <View style={styles.referralMetaItem}>
                    <UserCheck size={14} color={PALETTE.deepViolet} />
                    <Text style={styles.referralMetaText}>CHW: Mukamana (+250 788 123 456)</Text>
                  </View>
                </View>
              </View>

              {/* Detailed Referral & Escalation Timeline (PRD §8) */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>{t.timelineHeading}</Text>

                <View style={styles.referralTimelineWrap}>
                  {REFERRAL_TIMELINE.map((step, idx) => (
                    <View key={step.title} style={styles.timelineRow}>
                      <View style={styles.timelineColLeft}>
                        <View
                          style={[
                            styles.stepDot,
                            step.done && styles.stepDotDone,
                            step.active && styles.stepDotActive,
                          ]}
                        >
                          {step.done ? (
                            <CheckCircle2 size={13} color={PALETTE.white} />
                          ) : (
                            <Clock size={12} color={PALETTE.gray500} />
                          )}
                        </View>
                        {idx < REFERRAL_TIMELINE.length - 1 && (
                          <View
                            style={[
                              styles.stepConnector,
                              step.done && styles.stepConnectorDone,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineColRight}>
                        <View style={styles.stepHeader}>
                          <Text
                            style={[
                              styles.stepTitle,
                              step.active && { color: PALETTE.deepViolet },
                            ]}
                          >
                            {step.title}
                          </Text>
                          <Text style={styles.stepTime}>{step.time}</Text>
                        </View>
                        <Text style={styles.stepDesc}>{step.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Digital Health MOH Stamp & Export */}
              <View style={styles.mohExportCard}>
                <View style={styles.mohStampRow}>
                  <QrCode size={40} color={PALETTE.deepViolet} />
                  <View style={styles.mohStampText}>
                    <Text style={styles.mohStampTitle}>Rwanda MOH Health Stamp</Text>
                    <Text style={styles.mohStampSub}>
                      Digital signature verified by Muhima Health Center & CHUK Referral Desk.
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.exportBtn}
                  onPress={() =>
                    Alert.alert(
                      'Health Passport Export',
                      'Generating verified PDF document with synthetic clinical history...'
                    )
                  }
                >
                  <Download size={16} color={PALETTE.white} />
                  <Text style={styles.exportBtnText}>{t.exportBtn}</Text>
                </Pressable>
              </View>
            </>
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
    paddingTop: 12,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 14,
  },
  containerWide: {
    maxWidth: 820,
  },
  header: {
    gap: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7DCF8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DACAF5',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
    letterSpacing: 0.5,
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
  title: {
    fontFamily: Fonts.bold,
    fontSize: 23,
    color: PALETTE.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    color: PALETTE.gray500,
    lineHeight: 18,
  },

  /* Segmented Tab Navigation */
  tabSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#E6DAF7',
    borderRadius: 16,
    padding: 3,
    gap: 4,
  },
  tabSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 13,
  },
  tabSegmentBtnActive: {
    backgroundColor: PALETTE.deepViolet,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSegmentText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.gray600,
  },
  tabSegmentTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: PALETTE.cardDeepViolet,
    borderRadius: 22,
    padding: 18,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.electricPurple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DFCEFA',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: PALETTE.white,
  },
  profileId: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  bloodBadge: {
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bloodBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.white,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.white,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  /* ANC Timeline */
  ancSection: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 14,
  },
  ancHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: PALETTE.black,
  },
  ancCounter: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    color: PALETTE.electricPurple,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DDD2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#16A34A',
  },
  timelineDotUpcoming: {
    backgroundColor: PALETTE.electricPurple,
  },
  timelineDotNumber: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.gray600,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E4DAF5',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#86EFAC',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: PALETTE.bgCanvas,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECE4FA',
    gap: 4,
  },
  timelineContentUpcoming: {
    borderColor: PALETTE.electricPurple,
    backgroundColor: '#FAF7FD',
  },
  timelineContentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visitNumber: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.black,
  },
  visitDate: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.gray500,
  },
  visitNotes: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: PALETTE.gray600,
    lineHeight: 16,
  },

  /* Supplements Section */
  sectionCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 12,
  },
  supplementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supplementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplementTextWrap: {
    flex: 1,
  },
  supplementName: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
  },
  supplementDose: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray500,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0EAF8',
  },

  /* Referral Card Hero (PRD §4.A, §4.B & §8) */
  referralCardHero: {
    backgroundColor: '#FFF7ED',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 12,
  },
  referralHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  referralHeroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralHeroDetails: {
    flex: 1,
  },
  referralHeroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.black,
  },
  referralHeroSub: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: PALETTE.gray600,
    marginTop: 1,
  },
  referralHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  referralHeroBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    color: '#166534',
  },
  destinationBox: {
    backgroundColor: PALETTE.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
    gap: 2,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  destHospital: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.deepViolet,
  },
  destDept: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.gray600,
    marginLeft: 22,
  },
  referralMetaGrid: {
    flexDirection: 'column',
    gap: 6,
    paddingTop: 4,
  },
  referralMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referralMetaText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11.5,
    color: PALETTE.black,
  },

  /* Referral Timeline Detailed */
  referralTimelineWrap: {
    gap: 0,
    paddingTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineColLeft: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#16A34A',
  },
  stepDotActive: {
    backgroundColor: PALETTE.electricPurple,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepConnectorDone: {
    backgroundColor: '#86EFAC',
  },
  timelineColRight: {
    flex: 1,
    backgroundColor: PALETTE.bgCanvas,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0EAF8',
    gap: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.black,
  },
  stepTime: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: PALETTE.gray500,
  },
  stepDesc: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray600,
    lineHeight: 15,
  },

  /* MOH Stamp & Export */
  mohExportCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 12,
  },
  mohStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mohStampText: {
    flex: 1,
  },
  mohStampTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.black,
  },
  mohStampSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray500,
    marginTop: 2,
    lineHeight: 15,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.deepViolet,
    paddingVertical: 11,
    borderRadius: 14,
  },
  exportBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.white,
  },
});
