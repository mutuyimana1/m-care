import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card, Page, PageHeader, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

const MOTHER_IMAGE = require('@/assets/images/mother2.jpg');

function formatActivityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date not recorded'
    : date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MotherRecordsScreen() {
  const { user } = useAuth();
  const { patients, maternalActivities } = useClinic();
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const activities = maternalActivities
    .filter((activity) => activity.patientId === patient?.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <Page>
      <PageHeader
        eyebrow="YOUR HEALTH JOURNEY"
        title="Maternal records"
        subtitle=""
      />

      <Card style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <Image source={MOTHER_IMAGE} style={styles.motherImage} />
          <View style={styles.passportCopy}>
            <Text style={styles.passportEyebrow}>MATERNAL PASSPORT</Text>
            <Text style={styles.motherName}>{patient?.name || user?.name || 'Mother'}</Text>
            <Text style={styles.muted}>{patient ? `M-CARE ID · ${patient.id}` : 'No linked care record'}</Text>
          </View>
          <StatusPill label={patient ? 'Reviewed' : 'Not linked'} tone={patient ? 'green' : 'amber'} />
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Ionicons name="water-outline" size={18} color={UI.accentDark} />
            <Text style={styles.metricLabel}>Blood group</Text>
            <Text style={styles.metricValue}>{patient?.bloodGroup || 'Not recorded'}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Ionicons name="calendar-outline" size={18} color={UI.accentDark} />
            <Text style={styles.metricLabel}>Due date</Text>
            <Text style={styles.metricValue}>{patient?.estimatedDueDate || 'Not recorded'}</Text>
          </View>
        </View>
      </Card>

      <SectionHeading title="Active referral" />
      <Card style={patient?.referralFacility ? styles.referralCard : undefined}>
        <View style={styles.sectionLine}>
          <View style={styles.iconTile}>
            <Ionicons name="git-branch-outline" size={21} color={patient?.referralFacility ? UI.accentDark : UI.muted} />
          </View>
          <View style={styles.sectionCopy}>
            <Text style={styles.cardTitle}>
              {patient?.referralFacility || 'No active referral recorded'}
            </Text>
            <Text style={styles.copy}>
              {patient?.referralFacility
                ? patient.referralReason || 'Referral details have not been recorded.'
                : 'A referral from your care team will appear here.'}
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeading title="Care tracker" />
      <Card>
        <TrackerRow
          icon="time-outline"
          label="Next appointment"
          value={patient?.nextAppointmentDate || 'Not recorded'}
        />
        <TrackerRow
          icon="flask-outline"
          label="Tests to follow up"
          value={patient?.missingAssessments || 'No pending tests recorded'}
        />
        <TrackerRow
          icon="heart-outline"
          label="Care plan"
          value={patient?.carePlan || 'No clinician plan recorded'}
        />
      </Card>

      <SectionHeading title="Recent mother records" action={`${activities.length}`} />
      {activities.length ? (
        <Card style={styles.timelineCard}>
          {activities.map((activity, index) => (
            <View key={activity.id} style={styles.activity}>
              <View style={styles.timeline}>
                <View style={styles.timelineDot}>
                  <Ionicons name="checkmark" size={12} color={UI.white} />
                </View>
                {index < activities.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.copy}>{activity.details || 'No additional details recorded.'}</Text>
                <Text style={styles.result}>{activity.result}</Text>
                <Text style={styles.date}>{formatActivityDate(activity.occurredAt)}</Text>
              </View>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.copy}>No activity is recorded for this maternal profile yet.</Text>
        </Card>
      )}
      <Text style={styles.note}>
        Records in this stay in session memory and are not a substitute for your facility&apos;s medical record.
      </Text>
    </Page>
  );
}

function TrackerRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.trackerRow}>
      <View style={styles.trackerIcon}>
        <Ionicons name={icon} size={17} color={UI.accentDark} />
      </View>
      <View style={styles.trackerCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.trackerValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  passportCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  passportHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  motherImage: { width: 58, height: 66, borderRadius: 18, backgroundColor: UI.lavender },
  passportCopy: { flex: 1, gap: 3 },
  passportEyebrow: { color: UI.accentDark, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  motherName: { color: UI.ink, fontSize: 16, fontWeight: '800' },
  muted: { color: UI.muted, fontSize: 11 },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: 'rgba(143,89,187,0.16)',
  },
  metric: { flex: 1, gap: 4 },
  metricLabel: { color: UI.muted, fontSize: 11 },
  metricValue: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  metricDivider: { width: 1, height: 38, marginHorizontal: 14, backgroundColor: 'rgba(143,89,187,0.18)' },
  referralCard: { backgroundColor: '#F4ECFC', borderColor: '#EBDDFA' },
  sectionLine: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  iconTile: { width: 42, height: 42, borderRadius: 14, backgroundColor: UI.white, alignItems: 'center', justifyContent: 'center' },
  sectionCopy: { flex: 1, gap: 4 },
  cardTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackerIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: UI.lavender, alignItems: 'center', justifyContent: 'center' },
  trackerCopy: { flex: 1, gap: 3 },
  trackerValue: { color: UI.ink, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  timelineCard: { gap: 0 },
  activity: { flexDirection: 'row', gap: 11 },
  timeline: { width: 20, alignItems: 'center' },
  timelineDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.accentDark },
  timelineLine: { width: 1, flex: 1, minHeight: 24, backgroundColor: '#E5D9EC' },
  activityCopy: { flex: 1, gap: 3, paddingBottom: 17 },
  activityTitle: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  result: { color: UI.green, fontSize: 11, fontWeight: '700' },
  date: { color: UI.muted, fontSize: 10 },
  note: { color: UI.muted, fontSize: 10, lineHeight: 15 },
});
