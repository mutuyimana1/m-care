import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import {
  Card,
  EmergencySOSBanner,
  Field,
  Page,
  PageHeader,
  PrimaryButton,
  SectionHeading,
  StatusPill,
  UI,
  VisualActionCard,
} from '@/components/mcare-ui';
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
  const patientRequests = useMemo(
    () => followUpRequests
      .filter((request) => request.patientId === patient?.id)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()),
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
        title={isPostpartum ? 'Postpartum care' : 'Care & follow-up'}
        subtitle="Reach urgent help or leave a message for your care team."
      />

      {/* Low-Literacy Emergency SOS Banner */}
      <EmergencySOSBanner
        phoneNumber="114"
        chwPhone={patient?.phone || undefined}
      />

      <Card style={styles.appointmentCard}>
        <View style={styles.heading}>
          <View style={styles.icon}>
            <Ionicons name={isPostpartum ? 'heart-outline' : 'calendar-outline'} size={21} color={UI.accentDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>{isPostpartum ? 'Postpartum follow-up' : 'Next appointment'}</Text>
            <Text style={styles.appointmentDate}>
              {patient?.nextAppointmentDate || 'Not recorded yet'}
            </Text>
            {isPostpartum && patient?.postpartumFollowUpDate ? (
              <Text style={styles.copy}>Follow-up: {patient.postpartumFollowUpDate}</Text>
            ) : null}
          </View>
        </View>
      </Card>

      <VisualActionCard
        icon="medkit"
        iconBg="#FFEBEE"
        iconColor="#D32F2F"
        title="Share a symptom or concern"
        subtitle="Report pain, fever, or bleeding directly to your care worker"
        onPress={() => router.push('/mother-symptoms')}
      />


      <Card>
        <SectionHeading title="Talk to a health professional" />
        <Text style={styles.copy}>
          Send a message to your authorized care team. This is human support, not an AI chatbot; replies are not guaranteed immediately.
        </Text>
        {patient ? (
          <>
            {patientRequests.length ? (
              <View style={styles.conversation}>
                <SectionHeading title="Conversation history" />
                {patientRequests.map((request) => (
                  <View key={request.id} style={styles.messageThread}>
                    <View style={styles.messageBubble}>
                      <Text style={styles.messageLabel}>You · {new Date(request.requestedAt).toLocaleString()}</Text>
                      <Text style={styles.copy}>{request.message}</Text>
                    </View>
                    {request.responses.length ? request.responses.map((response, index) => (
                      <View key={`${request.id}-response-${index}`} style={styles.replyBubble}>
                        <Text style={styles.messageLabel}>
                          {response.responder} · {new Date(response.respondedAt).toLocaleString()}
                        </Text>
                        <Text style={styles.copy}>{response.message}</Text>
                      </View>
                    )) : (
                      <StatusPill label="Waiting for professional response" tone="amber" />
                    )}
                  </View>
                ))}
              </View>
            ) : null}
            <Field
              label="Your question or request"
              value={message}
              onChangeText={setMessage}
              placeholder="Write a short message"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <PrimaryButton label="Send message" onPress={sendRequest} disabled={!message.trim()} />
            {sent ? <Text style={styles.success}>Your request was added to the demo care-team queue.</Text> : null}
            <Text style={styles.note}>
              This demo inbox is not monitored in real time and has no guaranteed response time. For emergency symptoms, call 114 or seek care now; do not wait for a message.
            </Text>
          </>
        ) : (
          <Text style={styles.copy}>
            No approved, consented maternal record is linked to this account yet.
          </Text>
        )}
      </Card>

      {patient ? (
        <Card style={styles.careTeamCard}>
          <View style={styles.heading}>
            <View style={styles.icon}>
              <Ionicons name="medical-outline" size={21} color={UI.accentDark} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{patient.facility || 'Your health facility'}</Text>
              <Text style={styles.copy}>Care team: {patient.clinicianName || 'Not recorded'}</Text>
            </View>
          </View>
          {patient.referralFacility ? (
            <View style={styles.referral}>
              <Text style={styles.referralTitle}>Active referral</Text>
              <Text style={styles.copy}>{patient.referralFacility} · {patient.referralReason || 'Details not recorded'}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  emergencyCard: { backgroundColor: '#FFF1F1', borderColor: '#F1D6D8', gap: 14 },
  emergencyHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  emergencyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: UI.lavender, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 4 },
  title: { color: UI.ink, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  callButton: { minHeight: 48, borderRadius: 15, backgroundColor: UI.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  callButtonText: { color: UI.white, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.78 },
  appointmentCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  appointmentDate: { color: UI.accentDark, fontSize: 16, fontWeight: '800' },
  success: { color: UI.green, fontSize: 12, fontWeight: '700' },
  conversation: { gap: 8 },
  messageThread: { gap: 7, paddingTop: 8, borderTopWidth: 1, borderTopColor: UI.border },
  messageBubble: { alignSelf: 'flex-start', maxWidth: '94%', padding: 11, gap: 4, borderRadius: 14, backgroundColor: '#F6ECFD' },
  replyBubble: { alignSelf: 'flex-end', maxWidth: '94%', padding: 11, gap: 4, borderRadius: 14, backgroundColor: UI.greenLight },
  messageLabel: { color: UI.muted, fontSize: 10, fontWeight: '700' },
  note: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  referral: { paddingTop: 10, borderTopWidth: 1, borderTopColor: UI.border, gap: 4 },
  referralTitle: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  careTeamCard: { backgroundColor: '#F9F5FB' },
});
