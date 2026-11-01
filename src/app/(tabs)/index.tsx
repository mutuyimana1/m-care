import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const COLORS = {
  background: '#F6F4F7',
  white: '#FFFFFF',
  text: '#29252D',
  muted: '#79747D',
  border: '#E8E3EA',
  purple: Colors.light.accent,
  purpleLight: '#F5E9FB',
  peach: '#F4D6CA',
  green: '#438875',
  greenLight: '#E8F4EF',
  blue: '#568AB8',
  blueLight: '#EAF2F9',
};

type ViewMode = 'Weeks' | 'Months' | 'Trimesters';

const DAY_MS = 24 * 60 * 60 * 1000;
const PREGNANCY_DAYS = 280;

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const result = dateOnly(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateInput(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return dateOnly(parsed);
}

function getPregnancyProgress(dueDate: Date) {
  const today = dateOnly(new Date());
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / DAY_MS);
  const elapsedDays = PREGNANCY_DAYS - daysUntilDue;
  const gestationDays = Math.min(Math.max(elapsedDays, 0), 294);
  const weeks = Math.floor(gestationDays / 7);
  const days = gestationDays % 7;

  return {
    daysUntilDue,
    weeks,
    days,
    weeksRemaining: Math.max(0, Math.ceil(Math.max(daysUntilDue, 0) / 7)),
    progress: Math.min(Math.max(gestationDays / PREGNANCY_DAYS, 0), 1),
  };
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 700;
  const [viewMode, setViewMode] = useState<ViewMode>('Weeks');
  const [dueDate, setDueDate] = useState(() => addDays(new Date(), 105));
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const progress = getPregnancyProgress(dueDate);

  const openDateEditor = () => {
    setDateInput(formatDateInput(dueDate));
    setDateModalVisible(true);
  };

  const saveDueDate = () => {
    const parsedDate = parseDateInput(dateInput);
    if (!parsedDate) {
      Alert.alert('Check the date', 'Enter a valid date in YYYY-MM-DD format.');
      return;
    }

    const dayDifference = Math.round(
      (parsedDate.getTime() - dateOnly(new Date()).getTime()) / DAY_MS,
    );
    if (dayDifference < -294 || dayDifference > 315) {
      Alert.alert(
        'Date outside the supported range',
        'Enter an expected due date within about 42 weeks before or 45 weeks after today.',
      );
      return;
    }

    setDueDate(parsedDate);
    setDateModalVisible(false);
  };

  const currentStage = () => {
    if (viewMode === 'Months') {
      return `${Math.min(Math.floor(progress.weeks / 4.35) + 1, 10)} months`;
    }
    if (viewMode === 'Trimesters') {
      const trimester = progress.weeks < 13 ? 1 : progress.weeks < 28 ? 2 : 3;
      return `${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} trimester`;
    }
    return `Week ${progress.weeks}`;
  };

  const milestones = [12, 16, 20, 24, 28, 32, 36, 40];
  const visibleMilestones = isWide ? milestones : milestones.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 105 + insets.bottom }]}
      >
        <View style={[styles.page, isWide && styles.pageWide]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Pregnancy</Text>
              <Text style={styles.pageTitle}>Monitor</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profile options"
                onPress={() => setProfileMenuVisible(true)}
                style={styles.avatar}
              >
                <Ionicons name="person" size={27} color={COLORS.purple} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() =>
                  Alert.alert(
                    'Notifications',
                    'Appointment reminders and notifications will appear here when enabled.',
                  )
                }
                style={styles.notificationButton}
              >
                <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.modeSelector} accessibilityRole="tablist">
            {(['Weeks', 'Months', 'Trimesters'] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="tab"
                accessibilityState={{ selected: viewMode === mode }}
                onPress={() => setViewMode(mode)}
                style={[styles.modeButton, viewMode === mode && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, viewMode === mode && styles.modeTextActive]}>
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Mother&apos;s Health</Text>
              <Text style={styles.sectionTitle}>Monitor</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit expected due date"
              onPress={openDateEditor}
              style={styles.stageButton}
            >
              <Text style={styles.stageText}>{currentStage()}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.muted} />
            </Pressable>
          </View>

          <View style={styles.timelineCard}>
            <View style={styles.timelineArtwork}>
              <View style={styles.artworkBackdrop} />
              <View style={styles.heartBadge}>
                <Ionicons name="heart" size={18} color={COLORS.purple} />
              </View>
              <View style={styles.artworkCaption}>
                <Text style={styles.artworkTitle}>Pregnancy</Text>
                <Text style={styles.artworkTitle}>Timeline</Text>
              </View>
              <Text style={styles.motherIllustration} accessibilityLabel="Pregnancy illustration">
                🤰🏽
              </Text>
              <View style={styles.timelineOverlay}>
                <View style={styles.milestoneRow}>
                  {visibleMilestones.map((week) => (
                    <Text key={week} style={styles.milestoneText}>
                      {week}W
                    </Text>
                  ))}
                </View>
                <View
                  accessibilityLabel={`${Math.round(progress.progress * 100)} percent of pregnancy timeline`}
                  style={styles.progressTrack}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(progress.progress * 100, 4)}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressMarker,
                      { left: `${Math.min(Math.max(progress.progress * 100, 4), 96)}%` },
                    ]}
                  >
                    <Text style={styles.progressMarkerText}>{progress.weeks}</Text>
                  </View>
                  <View style={styles.timelineArrow}>
                    <Ionicons name="chevron-forward" size={15} color={COLORS.white} />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.timelineDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>CURRENTLY</Text>
                <Text style={styles.detailValue}>
                  {progress.weeks}w {progress.days}d
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>REMAINING</Text>
                <Text style={styles.detailValue}>{progress.weeksRemaining} weeks</Text>
              </View>
              <View style={styles.detailDivider} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Expected due date ${formatDate(dueDate)}. Edit date`}
                onPress={openDateEditor}
                style={styles.dueDateItem}
              >
                <Text style={styles.detailLabel}>EXPECTED DATE</Text>
                <Text style={styles.dueDateValue}>{formatDate(dueDate)}</Text>
                <Ionicons name="create-outline" size={14} color={COLORS.purple} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sampleNotice}>
            <Ionicons name="information-circle-outline" size={18} color="#8F60A5" />
            <Text style={styles.sampleNoticeText}>
              Sample timeline for preview. Update the due date to see an estimate; confirm dates
              and care with your healthcare professional.
            </Text>
          </View>

          <View style={styles.sectionHeadingCards}>
            <View>
              <Text style={styles.sectionTitle}>Your health checks</Text>
              <Text style={styles.sectionSubtitle}>Common pregnancy monitoring topics</Text>
            </View>
          </View>

          <View style={[styles.healthGrid, isWide && styles.healthGridWide]}>
            <HealthCard
              icon="🫄🏽"
              title="Glucose screening"
              subtitle="Ask your care team about timing"
              tint={COLORS.purpleLight}
              onPress={() =>
                Alert.alert(
                  'Glucose screening',
                  'Screening timing depends on your health history and local guidance. Ask your healthcare professional when it is recommended for you.',
                )
              }
            />
            <HealthCard
              icon="🩺"
              title="Blood pressure"
              subtitle="Discuss checks at your visits"
              tint="#FFF0E8"
              onPress={() =>
                Alert.alert(
                  'Blood pressure monitoring',
                  'Blood pressure is commonly checked during prenatal care. Follow the schedule recommended by your healthcare professional.',
                )
              }
            />
          </View>

          <View style={styles.sectionHeadingCards}>
            <View>
              <Text style={styles.sectionTitle}>Nutrition for you</Text>
              <Text style={styles.sectionSubtitle}>Everyday ideas for a balanced diet</Text>
            </View>
            <Ionicons name="nutrition-outline" size={22} color={COLORS.green} />
          </View>

          <View style={styles.nutritionCard}>
            <View style={styles.nutritionIcon}>
              <Ionicons name="leaf-outline" size={24} color={COLORS.green} />
            </View>
            <View style={styles.nutritionContent}>
              <Text style={styles.nutritionTitle}>Build a nourishing plate</Text>
              <Text style={styles.nutritionDescription}>
                Include vegetables and fruit, beans or other protein, whole grains, and water
                throughout the day.
              </Text>
              <View style={styles.nutritionTags}>
                <NutritionTag label="Folate-rich greens" />
                <NutritionTag label="Iron-rich foods" />
                <NutritionTag label="Protein" />
              </View>
            </View>
          </View>
          <Text style={styles.nutritionDisclaimer}>
            Nutrition needs vary. Ask your healthcare professional about supplements, food safety,
            and advice specific to you.
          </Text>

          <View style={styles.nextStepCard}>
            <View style={styles.nextStepIcon}>
              <Ionicons name="calendar-outline" size={21} color={COLORS.blue} />
            </View>
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Stay connected with your care team</Text>
              <Text style={styles.nextStepDescription}>
                Keep prenatal visits and questions on your care plan.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <View style={[styles.profileMenuOverlay, { paddingTop: insets.top + 76 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close profile menu"
            onPress={() => setProfileMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileMenuCard}>
            <Text style={styles.profileMenuTitle}>Profile</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setProfileMenuVisible(false);
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [styles.profileMenuItem, pressed && styles.pressed]}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.purple} />
              <Text style={styles.profileMenuItemText}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View pregnancy progress chart"
        onPress={() => setChartVisible(true)}
        style={({ pressed }) => [
          styles.chartButton,
          { bottom: Math.max(insets.bottom, 12) + 14 },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={23} color={COLORS.white} />
      </Pressable>

      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Expected due date</Text>
            <Text style={styles.modalDescription}>
              Enter the date provided by your healthcare professional.
            </Text>
            <TextInput
              accessibilityLabel="Expected due date in year-month-day format"
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A6A1AA"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              style={styles.dateInput}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDateModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveDueDate}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>Save date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={chartVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChartVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.modalTitle}>Pregnancy progress</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close progress chart"
                onPress={() => setChartVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={23} color={COLORS.muted} />
              </Pressable>
            </View>
            <Text style={styles.chartStage}>{progress.weeks} weeks, {progress.days} days</Text>
            <View style={styles.chartTrack}>
              <View style={[styles.chartFill, { width: `${progress.progress * 100}%` }]} />
            </View>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>Week 0</Text>
              <Text style={styles.chartLabel}>Week 40</Text>
            </View>
            <View style={styles.chartSummary}>
              <Text style={styles.chartSummaryText}>
                {progress.weeksRemaining} weeks remaining
              </Text>
              <Text style={styles.chartSummaryText}>Due {formatDate(dueDate)}</Text>
            </View>
            <Text style={styles.chartDisclaimer}>
              This timeline is an estimate based on the entered due date, not a medical assessment.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function HealthCard({
  icon,
  title,
  subtitle,
  tint,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.healthCard, pressed && styles.pressed]}
    >
      <View style={[styles.healthIcon, { backgroundColor: tint }]}>
        <Text style={styles.healthEmoji}>{icon}</Text>
      </View>
      <View style={styles.healthContent}>
        <Text style={styles.healthTitle}>{title}</Text>
        <Text style={styles.healthSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.healthArrow}>
        <Ionicons name="arrow-up-outline" size={18} color={COLORS.muted} />
      </View>
    </Pressable>
  );
}

function NutritionTag({ label }: { label: string }) {
  return (
    <View style={styles.nutritionTag}>
      <Text style={styles.nutritionTagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  page: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  pageWide: {
    maxWidth: 1000,
    paddingHorizontal: 32,
  },
  header: {
    minHeight: 91,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: COLORS.purpleLight,
  },
  profileMenuOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(34, 27, 38, 0.18)',
  },
  profileMenuCard: {
    width: 190,
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#24212A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  profileMenuTitle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  profileMenuItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  profileMenuItemText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: COLORS.white,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
    marginBottom: 26,
  },
  modeButton: {
    minHeight: 45,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },
  modeText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  modeTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 15,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  stageButton: {
    minHeight: 43,
    maxWidth: '54%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: 23,
    backgroundColor: COLORS.white,
  },
  stageText: {
    color: COLORS.muted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  timelineCard: {
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: COLORS.white,
  },
  timelineArtwork: {
    height: 252,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: '#E8D8D1',
  },
  artworkBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EBD8CE',
  },
  heartBadge: {
    position: 'absolute',
    zIndex: 2,
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.white,
  },
  artworkCaption: {
    position: 'absolute',
    zIndex: 2,
    top: 23,
    left: 68,
  },
  artworkTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  motherIllustration: {
    alignSelf: 'center',
    marginTop: -7,
    fontSize: 134,
    lineHeight: 166,
    textAlign: 'center',
  },
  timelineOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 17,
    paddingTop: 29,
    paddingBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
  },
  milestoneText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '600',
  },
  progressTrack: {
    height: 21,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  progressFill: {
    height: 21,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
  },
  progressMarker: {
    position: 'absolute',
    top: -4,
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 15,
    backgroundColor: COLORS.purple,
  },
  progressMarkerText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  timelineArrow: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.text,
  },
  timelineDetails: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  detailDivider: {
    width: 1,
    height: 35,
    backgroundColor: COLORS.border,
  },
  dueDateItem: {
    flex: 1.35,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
    rowGap: 5,
  },
  detailLabel: {
    width: '100%',
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dueDateValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  sampleNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: 11,
    borderRadius: 13,
    backgroundColor: '#F3EAF7',
  },
  sampleNoticeText: {
    flex: 1,
    color: '#68556F',
    fontSize: 10,
    lineHeight: 15,
  },
  sectionHeadingCards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  healthGrid: {
    gap: 10,
  },
  healthGridWide: {
    flexDirection: 'row',
  },
  healthCard: {
    minHeight: 83,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: 19,
    backgroundColor: COLORS.white,
  },
  healthIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  healthEmoji: {
    fontSize: 30,
  },
  healthContent: {
    flex: 1,
    gap: 5,
  },
  healthTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  healthSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  healthArrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FAF8FB',
    transform: [{ rotate: '45deg' }],
  },
  nutritionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
  },
  nutritionIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.greenLight,
  },
  nutritionContent: {
    flex: 1,
  },
  nutritionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  nutritionDescription: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  nutritionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  nutritionTag: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 13,
    backgroundColor: COLORS.greenLight,
  },
  nutritionTagText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '600',
  },
  nutritionDisclaimer: {
    marginTop: 8,
    paddingHorizontal: 3,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },
  nextStepIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.blueLight,
  },
  nextStepContent: {
    flex: 1,
    gap: 4,
  },
  nextStepTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  nextStepDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  chartButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 29,
    backgroundColor: COLORS.purple,
    shadowColor: '#4B285B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  pressed: {
    opacity: 0.78,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    backgroundColor: 'rgba(34, 27, 38, 0.38)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    padding: 22,
    borderRadius: 22,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
  },
  modalDescription: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  dateInput: {
    minHeight: 50,
    marginTop: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    minHeight: 43,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: '#F2EFF3',
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    minHeight: 43,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: COLORS.purple,
  },
  saveText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartStage: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  chartTrack: {
    height: 13,
    overflow: 'hidden',
    marginTop: 15,
    borderRadius: 8,
    backgroundColor: COLORS.purpleLight,
  },
  chartFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.purple,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  chartLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },
  chartSummary: {
    gap: 8,
    marginTop: 19,
    padding: 13,
    borderRadius: 13,
    backgroundColor: '#FAF7FB',
  },
  chartSummaryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  chartDisclaimer: {
    marginTop: 13,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },
});
