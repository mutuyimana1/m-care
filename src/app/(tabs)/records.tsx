import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  FileText,
  Hospital,
  MapPin,
  Pill,
  ShieldCheck,
  User,
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

export default function RecordsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <FileText size={13} color={PALETTE.deepViolet} />
              <Text style={styles.badgeText}>PATIENT PROFILE & ANC</Text>
            </View>
            <Text style={styles.title}>Maternal Health Passport</Text>
            <Text style={styles.subtitle}>
              Verified clinical records synchronized with National Digital Health (MOH)
            </Text>
          </View>

          {/* Mother's ID Card (Deep Violet Hero) */}
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatarBox}>
                <User size={26} color={PALETTE.white} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>Aline Uwase</Text>
                <Text style={styles.profileId}>M-CARE ID: RW-04-2026-9932</Text>
              </View>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodBadgeText}>O+</Text>
              </View>
            </View>

            <View style={styles.profileStatsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Estimated Due Date</Text>
                <Text style={styles.statValue}>Feb 18, 2027</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Gestational Age</Text>
                <Text style={styles.statValue}>Week 28 (7 Mo)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Primary Facility</Text>
                <Text style={styles.statValue}>Muhima HC</Text>
              </View>
            </View>
          </View>

          {/* Active Referral / Hospital Transfer Notice (Warm Amber-Peach) */}
          <View style={styles.referralCard}>
            <View style={styles.referralTop}>
              <View style={styles.referralIconBox}>
                <Hospital size={20} color={PALETTE.white} />
              </View>
              <View style={styles.referralTitleWrap}>
                <Text style={styles.referralTitle}>Specialist Referral: CHUK</Text>
                <Text style={styles.referralSub}>Routine 3rd Trimester Ultrasound Review</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.referralInfoRow}>
              <MapPin size={15} color={PALETTE.deepViolet} />
              <Text style={styles.referralInfoText}>
                Center Hospitalier Universitaire de Kigali (CHUK) · Maternity Wing
              </Text>
            </View>
          </View>

          {/* Antenatal Care (ANC) Visits Timeline (Soft Lavender) */}
          <View style={styles.ancSection}>
            <View style={styles.ancHeader}>
              <Text style={styles.sectionHeading}>Antenatal Care (ANC) Visits</Text>
              <Text style={styles.ancCounter}>3 of 8 completed</Text>
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

          {/* Prescribed Supplements & Immunizations (Soft Amber & Purple) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Active Supplements & Vaccines</Text>
            <View style={styles.supplementRow}>
              <View style={styles.supplementIconBox}>
                <Pill size={18} color={PALETTE.vibrantCrimson} />
              </View>
              <View style={styles.supplementTextWrap}>
                <Text style={styles.supplementName}>Iron & Folic Acid Tablets</Text>
                <Text style={styles.supplementDose}>1 tablet daily with meals (60mg Iron / 400mcg Folate)</Text>
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
                <Text style={styles.supplementDose}>Administered at Week 20 · Valid through 2029</Text>
              </View>
              <ShieldCheck size={20} color="#059669" />
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
    paddingTop: 12,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
  },
  containerWide: {
    maxWidth: 820,
  },
  header: {
    gap: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7DCF8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DACAF5',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: PALETTE.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    color: PALETTE.gray500,
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: PALETTE.cardDeepViolet,
    borderRadius: 22,
    padding: 20,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 18,
    color: PALETTE.white,
  },
  profileId: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  bloodBadge: {
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bloodBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.white,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 12,
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
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.white,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  referralCard: {
    backgroundColor: PALETTE.cardAmber,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#92400E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  referralTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referralIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitleWrap: {
    flex: 1,
  },
  referralTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: PALETTE.black,
  },
  referralSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#78350F',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: PALETTE.goldenYellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  referralInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F6E4AC',
  },
  referralInfoText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.deepViolet,
  },
  ancSection: {
    backgroundColor: PALETTE.cardLavender,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#DFCEFA',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ancHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: PALETTE.black,
  },
  ancCounter: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
    backgroundColor: '#DFCEFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeline: {
    gap: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1C2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#059669',
  },
  timelineDotUpcoming: {
    backgroundColor: PALETTE.electricPurple,
  },
  timelineDotNumber: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D7C7F2',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#059669',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DFCEFA',
  },
  timelineContentUpcoming: {
    backgroundColor: PALETTE.white,
    borderColor: PALETTE.electricPurple,
    borderWidth: 1.5,
  },
  timelineContentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  visitNumber: {
    fontFamily: Fonts.bold,
    fontSize: 13.5,
    color: PALETTE.black,
  },
  visitDate: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.gray500,
  },
  visitNotes: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray600,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: PALETTE.cardPeach,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFD3CA',
  },
  supplementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  supplementIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplementTextWrap: {
    flex: 1,
  },
  supplementName: {
    fontFamily: Fonts.bold,
    fontSize: 13.5,
    color: PALETTE.black,
  },
  supplementDose: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: '#63473D',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#FFD9D2',
    marginVertical: 8,
  },
});
