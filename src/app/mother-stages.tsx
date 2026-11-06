import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UI } from '@/components/mcare-ui';

const dates = [
  { day: '02', weekday: 'Sat' },
  { day: '03', weekday: 'Sun' },
  { day: '04', weekday: 'Mon' },
  { day: '05', weekday: 'Tue', selected: true },
  { day: '06', weekday: 'Wed' },
  { day: '07', weekday: 'Thu' },
  { day: '08', weekday: 'Fri' },
];

export default function MotherStagesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to pregnancy home"
            onPress={() => router.replace('/mother/index')}
            style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={23} color={UI.ink} />
          </Pressable>
          <View style={styles.headerActions}>
            <View style={styles.roundButton}>
              <Ionicons name="sparkles-outline" size={20} color={UI.accentDark} />
            </View>
            <View style={styles.roundButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={UI.ink} />
            </View>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Pregnancy{'\n'}Stages</Text>
          <View style={styles.titleActions}>
            <View style={styles.monthPill}>
              <Text style={styles.monthText}>November</Text>
              <Ionicons name="chevron-down" size={13} color={UI.ink} />
            </View>
            <View style={styles.calendarButton}>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateStrip}>
          {dates.map((date) => (
            <View key={date.day} style={styles.dateItem}>
              <View style={[styles.dateCircle, date.selected && styles.dateCircleSelected]}>
                <Text style={[styles.dateText, date.selected && styles.selectedText]}>{date.day}</Text>
              </View>
              <Text style={[styles.weekday, date.selected && styles.selectedWeekday]}>{date.weekday}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <View style={styles.conditionIcon}>
              <Ionicons name="calendar-outline" size={20} color={UI.ink} />
            </View>
            <Text style={styles.conditionTitle}>Mother&apos;s Physical{'\n'}Condition</Text>
            <View style={styles.aiButton}>
              <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.weekLabels}>
            {[6, 10, 14, 18, 24, 28].map((week) => (
              <Text key={week} style={styles.weekLabel}>{week}w</Text>
            ))}
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineFill} />
            <View style={styles.timelineMarker}>
              <Text style={styles.timelineMarkerText}>21</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={styles.timelineArrow} />
          </View>
        </View>

        <View style={styles.healthCards}>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View style={styles.healthIcon}>
                <Ionicons name="body-outline" size={19} color={UI.ink} />
              </View>
              <Text style={styles.healthLabel}>Back pain</Text>
            </View>
            <Text style={styles.healthValue}>Normal</Text>
          </View>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View style={styles.healthIcon}>
                <Ionicons name="flask-outline" size={19} color={UI.ink} />
              </View>
              <Text style={styles.healthLabel}>Urine Test</Text>
            </View>
            <Text style={styles.healthValue}>5.0<Text style={styles.ph}> pH</Text></Text>
          </View>
        </View>

        <View style={styles.reports}>
          <ReportCard title="Ultrasound Report" detail="16th Week" fileType="PDF" icon="scan-outline" />
          <ReportCard title="CBC Report" detail="Blood test" fileType="PDF" icon="water-outline" />
        </View>

        <Text style={styles.disclaimer}>
          Sample information for your pregnancy journey. Review symptoms and test results with
          your healthcare professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportCard({
  title,
  detail,
  fileType,
  icon,
}: {
  title: string;
  detail: string;
  fileType: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.reportCard}>
      <View style={styles.reportIcon}>
        <Ionicons name={icon} size={26} color={UI.accentDark} />
      </View>
      <View style={styles.reportCopy}>
        <Text style={styles.reportTitle}>{title}</Text>
        <View style={styles.reportMeta}>
          <Text style={styles.reportDetail}>{detail}</Text>
          <Text style={styles.fileType}>{fileType}</Text>
        </View>
      </View>
      <View style={styles.downloadButton}>
        <Ionicons name="download-outline" size={19} color={UI.ink} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EBDDFA' },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 36,
    backgroundColor: '#F6ECFD',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { color: UI.ink, fontSize: 26, lineHeight: 30, fontWeight: '700' },
  titleActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthPill: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  monthText: { color: UI.ink, fontSize: 11, fontWeight: '600' },
  calendarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.accent,
  },
  dateStrip: { gap: 12, paddingVertical: 2 },
  dateItem: { width: 36, alignItems: 'center', gap: 5 },
  dateCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dateCircleSelected: { backgroundColor: UI.accent },
  dateText: { color: UI.ink, fontSize: 11, fontWeight: '700' },
  selectedText: { color: '#FFFFFF' },
  weekday: { color: UI.muted, fontSize: 9 },
  selectedWeekday: { color: UI.accentDark, fontWeight: '800' },
  conditionCard: {
    padding: 16,
    gap: 17,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
  },
  conditionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  conditionIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFFFFFA8', alignItems: 'center', justifyContent: 'center' },
  conditionTitle: { flex: 1, color: UI.ink, fontSize: 13, lineHeight: 16, fontWeight: '700' },
  aiButton: { width: 31, height: 31, borderRadius: 16, backgroundColor: UI.accent, alignItems: 'center', justifyContent: 'center' },
  weekLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  weekLabel: { color: UI.ink, fontSize: 9, fontWeight: '600' },
  timeline: { height: 17, borderRadius: 10, backgroundColor: 'rgba(187,169,196,0.38)', justifyContent: 'center', overflow: 'visible' },
  timelineFill: { width: '53%', height: '100%', borderRadius: 10, backgroundColor: UI.accent },
  timelineMarker: {
    position: 'absolute',
    left: '49%',
    top: -4,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E86FC3',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  timelineMarkerText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  timelineArrow: { position: 'absolute', right: 2, top: 1, width: 15, height: 15, borderRadius: 8, backgroundColor: UI.ink },
  healthCards: { flexDirection: 'row', gap: 12 },
  healthCard: { flex: 1, minHeight: 105, padding: 13, gap: 15, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  healthHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthIcon: { width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)' },
  healthLabel: { color: UI.ink, fontSize: 11, fontWeight: '600', flexShrink: 1 },
  healthValue: { color: UI.ink, fontSize: 20, fontWeight: '500' },
  ph: { fontSize: 11, fontWeight: '500' },
  reports: { gap: 10 },
  reportCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  reportIcon: { width: 53, height: 53, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5F0F6' },
  reportCopy: { flex: 1, gap: 6 },
  reportTitle: { color: UI.ink, fontSize: 12, fontWeight: '700' },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reportDetail: { color: UI.muted, fontSize: 9 },
  fileType: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF', color: UI.muted, fontSize: 9, fontWeight: '700' },
  downloadButton: { width: 34, height: 34, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  disclaimer: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  pressed: { opacity: 0.75 },
});
