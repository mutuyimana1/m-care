import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, InfoLine, Page, PageHeader, SectionHeading, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

export default function MotherRemindersScreen() {
  const { user } = useAuth();
  const { patients } = useClinic();

  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );

  const tests = patient?.missingAssessments
    ? patient.missingAssessments.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
    : [];

  return (
    <Page>
      <PageHeader
        eyebrow="FOLLOW-UP"
        title="Reminders & next steps"
        subtitle="Keep track of appointments, tests, and the plan agreed with your care team."
        onBack={() => router.replace('/mother')}
        backLabel="Back to home"
      />

      <Card style={styles.cardTone}>
        <View style={styles.headerLine}>
          <Ionicons name="calendar-outline" size={22} color={UI.accentDark} />
          <Text style={styles.title}>Next appointment</Text>
        </View>
        <Text style={styles.strongValue}>{patient?.nextAppointmentDate || 'Ask your health facility to confirm your next appointment.'}</Text>
      </Card>

      <SectionHeading title="Care plan" />
      <Card>
        <InfoLine label="Appointment" value={patient?.nextAppointmentDate || 'Not recorded'} />
        <InfoLine label="Facility" value={patient?.facility || 'Not recorded'} />
        <InfoLine label="Clinician" value={patient?.clinicianName || 'Not recorded'} />
        <InfoLine label="Care plan" value={patient?.carePlan || 'No clinician plan recorded yet.'} />
        <InfoLine label="Follow-up" value={patient?.followUp || 'Follow-up details not yet recorded.'} />
      </Card>

      <SectionHeading title="Tests and checks" />
      <Card>
        {tests.length ? (
          tests.map((item) => (
            <View key={item} style={styles.checkRow}>
              <Ionicons name="time-outline" size={17} color={UI.amber} />
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>No pending investigations are recorded for this demo profile.</Text>
        )}
      </Card>

      <SectionHeading title="Urgent symptoms" />
      <Card>
        <Text style={styles.copy}>
          Seek urgent care now if you have severe bleeding, severe headache, vision changes,
          trouble breathing, fainting, convulsions, fever with severe weakness, or severe abdominal pain.
          Do not wait for a message or app reply.
        </Text>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  cardTone: { backgroundColor: '#F3E8FC', borderColor: '#E7D5FB' },
  headerLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: UI.ink, fontSize: 15, fontWeight: '800' },
  strongValue: { color: UI.accentDark, fontSize: 18, fontWeight: '800', marginTop: 8 },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  checkText: { flex: 1, color: UI.ink, fontSize: 12, lineHeight: 18 },
});
