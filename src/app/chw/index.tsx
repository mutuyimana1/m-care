import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import {
  Card,
  Field,
  InfoLine,
  Page,
  PageHeader,
  PrimaryButton,
  SectionHeading,
  StatusPill,
  UI,
} from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic, type MaternalSymptomReport, type PatientRecord, type ReferralStatus, type SymptomReportStatus } from '@/contexts/clinic-context';
import { getMaternalSymptomCode } from '@/utils/maternal-symptom-codes';

export default function CommunityHealthWorkerScreen() {
  const { user } = useAuth();
  const { patients, symptomReports, updatePatient, updateSymptomReportStatus } = useClinic();
  const [contactNotes, setContactNotes] = useState<Record<string, string>>({});
  const [referralOutcomes, setReferralOutcomes] = useState<Record<string, string>>({});
  const assignedPatients = patients.filter(
    (patient) =>
      patient.communityHealthWorker.trim().toLowerCase() === user?.name.toLowerCase() &&
      patient.consent &&
      patient.clinicianApproved,
  );
  const assignedPatientIds = new Set(assignedPatients.map((patient) => patient.id));
  const alerts = symptomReports
    .filter((report) => assignedPatientIds.has(report.patientId))
    .sort((left, right) => right.reportedAt.localeCompare(left.reportedAt));
  const openCount = alerts.filter((report) => report.status !== 'closed').length;
  const newCount = alerts.filter((report) => report.status === 'new').length;
  const referrals = assignedPatients.filter((patient) => patient.referralStatus !== 'not-started');
  const waitingForFacility = referrals.filter((patient) => patient.referralStatus !== 'completed').length;

  const saveAction = (
    report: MaternalSymptomReport,
    status: SymptomReportStatus,
    action: string,
  ) => {
    const note = contactNotes[report.id]?.trim() ?? '';
    const detail = [action, note].filter(Boolean).join(': ');
    updateSymptomReportStatus(
      report.id,
      status,
      user?.name ?? 'CHW',
      detail,
    );
    if (status === 'referred') {
      const patient = assignedPatients.find((item) => item.id === report.patientId);
      if (patient) {
        updatePatient(patient.id, {
          referralStatus: 'sent',
          referralReason: report.symptoms.join(', '),
        });
      }
    }
    setContactNotes((current) => ({ ...current, [report.id]: '' }));
  };

  const callMother = async (patient: PatientRecord) => {
    const phone = patient.phone.trim();
    if (!phone || phone.toLowerCase().includes('demo')) return;

    const phoneUrl = `tel:${phone.replace(/[^\d+]/g, '')}`;
    try {
      if (!(await Linking.canOpenURL(phoneUrl))) {
        Alert.alert('Call unavailable', 'Use the facility contact details to reach the mother.');
        return;
      }
      await Linking.openURL(phoneUrl);
    } catch (error) {
      Alert.alert(
        'Could not open phone',
        error instanceof Error ? error.message : 'Use the facility contact details to reach the mother.',
      );
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="M-CARE · COMMUNITY HEALTH WORKER"
        title="CHW follow-up"
        // subtitle="Review assigned mothers, acknowledge alerts, document contact, and coordinate facility referrals."
      />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeading}>
          <View style={styles.summaryIcon}>
            <Ionicons name="notifications-outline" size={20} color={UI.accentDark} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Care-team notifications</Text>
            <Text style={styles.summaryNote}>Assigned to {user?.name ?? 'your CHW account'}</Text>
          </View>
        </View>
        <View style={styles.metrics}>
          <Metric label="Open alerts" value={openCount} />
          <Metric label="New" value={newCount} />
          <Metric label="Awaiting facility" value={waitingForFacility} />
        </View>
      </Card>

      <SectionHeading title="Assigned mothers" action={`${assignedPatients.length}`} />
      {assignedPatients.map((patient) => (
        <Card key={patient.id} style={styles.caseCard}>
          <View style={styles.caseHeading}>
            <View style={styles.caseIcon}>
              <Ionicons name="person-outline" size={21} color={UI.accentDark} />
            </View>
            <View style={styles.caseCopy}>
              <Text style={styles.caseTitle}>{patient.name}</Text>
              <Text style={styles.caseMeta}>{patient.id} · Assigned CHW: {patient.communityHealthWorker}</Text>
            </View>
            <StatusPill label="Assigned" tone="lavender" />
          </View>
          <InfoLine label="Phone" value={patient.phone} />
          <InfoLine label="Pregnancy stage" value={`${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays} days`} />
          <InfoLine label="Estimated due date" value={patient.estimatedDueDate} />
          <InfoLine label="Preferred language" value={patient.preferredLanguage} />
          <InfoLine label="Community" value={`${patient.village}, ${patient.cell}, ${patient.sector}`} />
          <InfoLine label="Assigned health facility" value={patient.facility} />
          <Text style={styles.caseNote}>
            Mother identity and pregnancy details are shown only for cases assigned to this CHW account.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: patient.phone.toLowerCase().includes('demo') }}
            disabled={patient.phone.toLowerCase().includes('demo')}
            onPress={() => void callMother(patient)}
            style={({ pressed }) => [
              styles.callButton,
              patient.phone.toLowerCase().includes('demo') && styles.disabledAction,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="call-outline" size={17} color={UI.accentDark} />
            <Text style={styles.callButtonText}>
              {patient.phone.toLowerCase().includes('demo') ? 'Call unavailable for demo number' : 'Call mother'}
            </Text>
          </Pressable>
        </Card>
      ))}

      <SectionHeading title="Notifications and symptom alerts" action={`${alerts.length}`} />
      {alerts.map((report) => {
        const patient = assignedPatients.find((item) => item.id === report.patientId);
        if (!patient) return null;

        return (
          <Card key={report.id} style={styles.caseCard}>
            <View style={styles.caseHeading}>
              <View style={styles.alertIcon}>
                <Ionicons name="alert-circle-outline" size={21} color={UI.amber} />
              </View>
              <View style={styles.caseCopy}>
                <Text style={styles.caseTitle}>{patient.name}</Text>
                <Text style={styles.caseMeta}>{patient.id} · Report {report.id}</Text>
              </View>
              <StatusPill
                label={statusLabel(report.status)}
                tone={report.status === 'new' ? 'amber' : report.status === 'closed' ? 'green' : 'lavender'}
              />
            </View>

            <View style={styles.notificationBanner}>
              <Ionicons name={report.status === 'new' ? 'notifications' : 'time-outline'} size={17} color={UI.accentDark} />
              <Text style={styles.notificationText}>
                {report.status === 'new'
                  ? `New alert for ${patient.communityHealthWorker}; acknowledge and follow your local escalation protocol.`
                  : `Alert assigned to ${patient.communityHealthWorker} for documented follow-up.`}
              </Text>
            </View>

            <View style={styles.symptomList}>
              {report.symptoms.map((symptom) => {
                const symptomCode = getMaternalSymptomCode(symptom);
                return (
                  <View key={symptom} style={styles.symptomRow}>
                    <Text style={styles.symptoms}>{symptom}</Text>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{symptomCode.code}</Text>
                    </View>
                    <Text style={styles.codeSource}>{symptomCode.source}</Text>
                  </View>
                );
              })}
            </View>
            <InfoLine label="Pregnancy stage" value={`${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays} days`} />
            <InfoLine label="Reported" value={new Date(report.reportedAt).toLocaleString()} />
            <InfoLine label="Onset and pattern" value={`${report.onset} · ${report.pattern}`} />
            <InfoLine label="Self-reported severity" value={report.severity} />
            <InfoLine label="Getting worse" value={report.worsening} />
            <InfoLine label="Contacted CHW" value={report.contactedChw ? 'Yes' : 'No'} />
            <InfoLine label="Visited facility" value={report.visitedFacility ? 'Yes' : 'No'} />
            {report.temperatureReading ? <InfoLine label="Temperature reading" value={`${report.temperatureReading} °C`} /> : null}
            {report.bloodPressureReading ? <InfoLine label="Blood pressure reading" value={report.bloodPressureReading} /> : null}
            {report.notes ? <Text style={styles.caseNote}>{report.notes}</Text> : null}
            {report.voiceTranscriptAuthorized &&
            (report.voiceTranscript || report.voiceRecordingUri) ? (
              <View style={styles.transcriptCard}>
                {report.voiceTranscript ? (
                  <>
                    <View style={styles.transcriptHeading}>
                      <Ionicons name="chatbox-ellipses-outline" size={17} color={UI.accentDark} />
                      <Text style={styles.transcriptTitle}>Authorized voice transcript</Text>
                    </View>
                    <Text style={styles.caseNote}>{report.voiceTranscript}</Text>
                  </>
                ) : null}
                {report.voiceRecordingUri ? (
                  <VoiceRecording uri={report.voiceRecordingUri} />
                ) : null}
              </View>
            ) : null}
            {report.actions.length ? (
              <View style={styles.timeline}>
                <Text style={styles.timelineTitle}>Follow-up history</Text>
                {report.actions.map((action, index) => (
                  <Text key={`${report.id}-${index}`} style={styles.timelineEntry}>
                    {statusLabel(action.status)} · {action.actor} · {new Date(action.occurredAt).toLocaleString()}
                    {action.note ? ` · ${action.note}` : ''}
                  </Text>
                ))}
              </View>
            ) : null}

            {report.status !== 'closed' ? (
              <>
                <Field
                  label="Contact attempt or observation"
                  value={contactNotes[report.id] ?? ''}
                  onChangeText={(value) => setContactNotes((current) => ({ ...current, [report.id]: value }))}
                  placeholder="Describe the call, visit, or observation before saving"
                  multiline
                  numberOfLines={2}
                />
                <View style={styles.actions}>
                  {report.status === 'new' ? (
                    <PrimaryButton
                      label="Acknowledge alert"
                      icon="checkmark-circle-outline"
                      onPress={() => saveAction(report, 'acknowledged', 'Alert acknowledged')}
                    />
                  ) : null}
                  <PrimaryButton
                    label="Log call attempt"
                    icon="call-outline"
                    disabled={!contactNotes[report.id]?.trim()}
                    onPress={() => saveAction(report, 'contacted', 'Call attempt')}
                  />
                  <PrimaryButton
                    label="Log home visit"
                    icon="walk-outline"
                    disabled={!contactNotes[report.id]?.trim()}
                    onPress={() => saveAction(report, 'contacted', 'Home visit')}
                  />
                  <PrimaryButton
                    label="Escalate and refer to facility"
                    icon="git-branch-outline"
                    disabled={!patient.referralFacility.trim() || !contactNotes[report.id]?.trim()}
                    onPress={() => saveAction(report, 'referred', 'Facility referral sent')}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => saveAction(report, 'closed', 'Alert closed')}
                    style={({ pressed }) => [styles.closeAction, pressed && styles.pressed]}>
                    <Text style={styles.closeActionText}>Close alert</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Card>
        );
      })}

      <SectionHeading title="Facility referral tracking" action={`${referrals.length}`} />
      {referrals.map((patient) => (
        <Card key={patient.id} style={styles.referralCard}>
          <View style={styles.caseHeading}>
            <View style={styles.caseIcon}>
              <Ionicons name="git-branch-outline" size={20} color={UI.accentDark} />
            </View>
            <View style={styles.caseCopy}>
              <Text style={styles.caseTitle}>{patient.name}</Text>
              <Text style={styles.caseMeta}>{patient.referralFacility}</Text>
            </View>
            <StatusPill label={referralLabel(patient.referralStatus)} tone={patient.referralStatus === 'completed' ? 'green' : 'amber'} />
          </View>
          <InfoLine label="Referral reason" value={patient.referralReason} />
          <InfoLine
            label="Facility receipt"
            value={
              patient.referralStatus === 'sent'
                ? 'Referral sent to facility; receipt confirmation is pending.'
                : 'Facility receipt confirmed in the CHW follow-up workflow.'
            }
          />
          <InfoLine
            label="Facility action"
            value={
              patient.referralStatus === 'completed'
                ? patient.referralOutcome
                : patient.referralStatus === 'received'
                  ? 'Referral received; facility outcome is pending.'
                  : 'Referral sent; facility response is pending.'
            }
          />
          {patient.referralStatus === 'sent' ? (
            <PrimaryButton
              label="Confirm receiving facility received referral"
              onPress={() => updatePatient(patient.id, { referralStatus: 'received' })}
            />
          ) : null}
          {patient.referralStatus === 'received' ? (
            <>
              <Field
                label="Outcome shared by receiving facility"
                value={referralOutcomes[patient.id] ?? ''}
                onChangeText={(value) => setReferralOutcomes((current) => ({ ...current, [patient.id]: value }))}
                placeholder="Record the action or care outcome reported by the facility"
                multiline
                numberOfLines={2}
              />
              <PrimaryButton
                label="Record facility action and complete referral"
                disabled={!referralOutcomes[patient.id]?.trim()}
                onPress={() => {
                  const outcome = referralOutcomes[patient.id]?.trim();
                  if (!outcome) return;
                  updatePatient(patient.id, { referralOutcome: outcome, referralStatus: 'completed' });
                  setReferralOutcomes((current) => ({ ...current, [patient.id]: '' }));
                }}
              />
            </>
          ) : null}
        </Card>
      ))}
    </Page>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function VoiceRecording({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const playerStatus = useAudioPlayerStatus(player);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playerStatus.playing ? 'Pause authorized voice recording' : 'Play authorized voice recording'}
      onPress={() => (playerStatus.playing ? player.pause() : player.play())}
      style={({ pressed }) => [styles.audioButton, pressed && styles.pressed]}>
      <Ionicons name={playerStatus.playing ? 'pause' : 'play'} size={17} color={UI.accentDark} />
      <Text style={styles.audioButtonText}>
        {playerStatus.playing ? 'Pause voice recording' : 'Play voice recording'}
      </Text>
    </Pressable>
  );
}

const referralLabel = (status: ReferralStatus) => {
  const labels: Record<ReferralStatus, string> = {
    'not-started': 'Not started',
    sent: 'Sent',
    received: 'Received',
    completed: 'Action recorded',
  };
  return labels[status];
};

const statusLabel = (status: SymptomReportStatus) => {
  const labels: Record<SymptomReportStatus, string> = {
    new: 'New',
    acknowledged: 'Acknowledged',
    contacted: 'Contacted',
    referred: 'Referred',
    closed: 'Closed',
  };
  return labels[status];
};

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  summaryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.white },
  summaryCopy: { flex: 1, gap: 3 },
  summaryTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  summaryNote: { color: UI.muted, fontSize: 11 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  metric: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 8, borderRadius: 14, backgroundColor: UI.white },
  metricValue: { color: UI.accentDark, fontSize: 20, fontWeight: '800' },
  metricLabel: { color: UI.muted, fontSize: 10, textAlign: 'center' },
  demoNotice: { color: UI.muted, fontSize: 11, lineHeight: 16 },
  caseCard: { gap: 12 },
  caseHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  caseIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.lavender },
  alertIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.amberLight },
  caseCopy: { flex: 1, gap: 3 },
  caseTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  caseMeta: { color: UI.muted, fontSize: 10 },
  caseNote: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  callButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, backgroundColor: UI.lavender },
  callButtonText: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  disabledAction: { opacity: 0.6 },
  notificationBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 11, borderRadius: 13, backgroundColor: '#F6ECFD' },
  notificationText: { flex: 1, color: UI.accentDark, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  symptomList: { gap: 7 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  symptoms: { flex: 1, color: UI.ink, fontSize: 13, fontWeight: '700' },
  codeBadge: { minWidth: 38, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, backgroundColor: UI.amberLight },
  codeText: { color: UI.amber, fontSize: 11, fontWeight: '900' },
  codeSource: { color: UI.muted, fontSize: 9, fontWeight: '700' },
  transcriptCard: { gap: 8, padding: 12, borderRadius: 14, backgroundColor: '#F7F2FA' },
  transcriptHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  transcriptTitle: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  audioButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, backgroundColor: UI.white },
  audioButtonText: { color: UI.accentDark, fontSize: 11, fontWeight: '800' },
  timeline: { gap: 7, padding: 11, borderRadius: 13, backgroundColor: '#F7F5F8' },
  timelineTitle: { color: UI.ink, fontSize: 12, fontWeight: '800' },
  timelineEntry: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  actions: { gap: 7 },
  closeAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: UI.white, borderWidth: 1, borderColor: UI.border },
  closeActionText: { color: UI.red, fontSize: 13, fontWeight: '800' },
  referralCard: { backgroundColor: '#F8F3FB' },
  pressed: { opacity: 0.78 },
});
