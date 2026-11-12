import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Field, Page, PageHeader, PrimaryButton, SectionHeading, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

export default function MotherCareScreen() {
  const { user } = useAuth();
  const { patients, followUpRequests, requestFollowUp } = useClinic();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const latestRequest = useMemo(
    () => followUpRequests.find((request) => request.patientId === patient?.id),
    [followUpRequests, patient?.id],
  );
  const isPostpartum = patient?.postpartumStatus === 'postpartum';

  const sendRequest = () => {
    if (!patient || !message.trim()) return;
    requestFollowUp(patient.id, message.trim());
    setMessage('');
    setSent(true);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="YOUR CARE"
        title={isPostpartum ? 'Postpartum follow-up' : 'Care & follow-up'}
        subtitle="Keep your next steps, questions, and care-team details together."
      />

      <Card style={styles.statusCard}>
        <View style={styles.heading}>
          <View style={styles.icon}>
            <Ionicons name={isPostpartum ? 'heart-outline' : 'calendar-outline'} size={21} color={UI.accentDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>{isPostpartum ? 'Your care continues after birth' : 'Your next appointment'}</Text>
            <Text style={styles.copy}>
              {patient?.nextAppointmentDate
                ? `Recorded date: ${patient.nextAppointmentDate}`
                : 'No appointment is recorded yet. Please confirm your next visit with your health facility.'}
            </Text>
          </View>
        </View>
        {isPostpartum ? (
          <Text style={styles.copy}>
            {patient?.postpartumFollowUpDate
              ? `Postpartum follow-up: ${patient.postpartumFollowUpDate}`
              : 'Ask your care team to confirm when your postpartum follow-up is due.'}
          </Text>
        ) : null}
      </Card>

      <SectionHeading title="Quick support" />
      <PrimaryButton
        label="Share a symptom or concern"
        icon="chatbubble-ellipses-outline"
        onPress={() => router.push('/mother-symptoms')}
      />

      <Card>
        <SectionHeading title="Ask your care team to follow up" />
        {patient ? (
          <>
            <Field
              label="Your question or request"
              value={message}
              onChangeText={setMessage}
              placeholder="Write a short message"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <PrimaryButton label="Send follow-up request" onPress={sendRequest} disabled={!message.trim()} />
            {sent ? <Text style={styles.success}>Your request was added to the demo care-team queue.</Text> : null}
            {latestRequest ? (
              <Text style={styles.copy}>
                Latest request: “{latestRequest.message}” · {new Date(latestRequest.requestedAt).toLocaleDateString()}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.copy}>
            No approved, consented maternal record is linked to this account yet. Contact your health facility to link your profile.
          </Text>
        )}
      </Card>

      <SectionHeading title="Your care team" />
      <Card>
        {patient ? (
          <>
            <Text style={styles.title}>{patient.facility || 'Facility not recorded'}</Text>
            <Text style={styles.copy}>Facility contact: {patient.facilityContactPhone || 'Ask your health facility for a contact number'}</Text>
            <Text style={styles.copy}>Clinician: {patient.clinicianName || 'Not recorded'}</Text>
            {patient.communityHealthWorker ? (
              <Text style={styles.copy}>Community health worker: {patient.communityHealthWorker}</Text>
            ) : null}
            {patient.referralFacility ? (
              <View style={styles.referral}>
                <Text style={styles.referralTitle}>Referral recorded</Text>
                <Text style={styles.copy}>{patient.referralFacility} · {patient.referralReason || 'Reason not recorded'}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.copy}>Ask your health facility for the correct contact and referral information.</Text>
        )}
      </Card>

      <SectionHeading title="Your plan and reminders" />
      <Card>
        {patient ? (
          <>
            <Text style={styles.copy}>
              Next visit: {patient.nextAppointmentDate || 'Ask your facility to confirm the next visit.'}
            </Text>
            <Text style={styles.copy}>
              Tests to follow up: {patient.missingAssessments || 'No pending tests recorded.'}
            </Text>
            <Text style={styles.copy}>
              Medicines and supplements: {patient.medications || 'Ask your clinician what is prescribed. Do not start or stop medicines based on this app.'}
            </Text>
            <Text style={styles.copy}>Care plan: {patient.carePlan || 'No clinician plan recorded.'}</Text>
            {patient.careTeamMessage ? (
              <View style={styles.referral}>
                <Text style={styles.referralTitle}>Message from your care team</Text>
                <Text style={styles.copy}>{patient.careTeamMessage}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.copy}>Your appointment and care plan will appear here after your facility links an approved profile.</Text>
        )}
      </Card>

      <SectionHeading title="Your profile goes with you" />
      <Card>
        <Text style={styles.copy}>
          {patient
            ? `M-CARE ID: ${patient.id}. Share this ID with an authorized health worker when you change facilities. Records are only shared with your consent.`
            : 'Ask your facility about your M-CARE ID and authorized sharing when changing facilities.'}
        </Text>
        <Text style={styles.note}>
          Secure cross-facility transfer and offline synchronization are not connected in this demo. Information entered here stays in session memory and is not a clinical record.
        </Text>
      </Card>

      {isPostpartum ? (
        <Card style={styles.postpartumCard}>
          <Text style={styles.title}>Postpartum and newborn support</Text>
          <Text style={styles.copy}>
            Keep follow-up with your health team after birth. Ask about your recovery, feeding support, and newborn care. Seek urgent local care if you feel seriously unwell.
          </Text>
        </Card>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  statusCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: UI.white, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 4 },
  title: { color: UI.ink, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  success: { color: UI.green, fontSize: 12, fontWeight: '700' },
  referral: { paddingTop: 10, borderTopWidth: 1, borderTopColor: UI.border, gap: 4 },
  referralTitle: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  note: { color: UI.muted, fontSize: 10, lineHeight: 16 },
  postpartumCard: { backgroundColor: UI.greenLight, borderColor: '#DDEDE4' },
});
