import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, Field, InfoLine, Page, PageHeader, PrimaryButton, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic, type MaternalSymptomReport, type SymptomReportStatus } from '@/contexts/clinic-context';
import { useChwRecords } from '@/hooks/use-chw-records';
import { getMaternalSymptomCode, isEmergencyMaternalReport, isEmergencyMaternalSymptom } from '@/utils/maternal-symptom-codes';

export default function ChwAlertsPage() {
  const { user } = useAuth();
  const { updatePatient, updateSymptomReportStatus } = useClinic();
  const { assignedPatients, alerts, openAlerts, urgentAlertCount } = useChwRecords();
  const [contactNotes, setContactNotes] = useState<Record<string, string>>({});

  const saveAction = (report: MaternalSymptomReport, status: SymptomReportStatus, action: string) => {
    const note = contactNotes[report.id]?.trim() ?? '';
    updateSymptomReportStatus(report.id, status, user?.name ?? 'CHW', [action, note].filter(Boolean).join(': '));
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

  return (
    <Page>
      <PageHeader
        eyebrow="M-CARE · COMMUNITY HEALTH WORKER"
        title="Alerts"
        subtitle={`${openAlerts.length} open · ${urgentAlertCount} urgent`}
      />
      {urgentAlertCount > 0 ? (
        <View style={styles.urgentNotice}>
          <Ionicons name="warning-outline" size={19} color={UI.red} />
          <Text style={styles.urgentNoticeText}>
            Danger signs need immediate action under local emergency protocol. Do not wait for an app reply.
          </Text>
        </View>
      ) : null}
      <SectionHeading title="Notifications and symptom alerts" action={`${alerts.length}`} />
      {alerts.map((report) => {
        const patient = assignedPatients.find((item) => item.id === report.patientId);
        if (!patient) return null;
        const urgent = report.status !== 'closed' && isEmergencyMaternalReport(report);
        const isIvrReport = report.symptoms.some((symptom) => symptom.toLowerCase().includes('ivr')) || report.id.startsWith('IVR');

        return (
          <Card key={report.id} style={[styles.alertCard, urgent && styles.emergencyCard]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/chw/mother/[id]', params: { id: patient.id } })}
              style={({ pressed }) => [styles.alertHeading, pressed && styles.pressed]}>
              <View style={[styles.alertIcon, urgent && styles.urgentIcon]}>
                <Ionicons name={urgent ? 'alert-circle-outline' : isIvrReport ? 'phone-portrait-outline' : 'notifications-outline'} size={21} color={urgent ? UI.red : UI.amber} />
              </View>
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>{patient.name}</Text>
                <Text style={styles.meta}>{patient.id} · Report {report.id}</Text>
              </View>
              {urgent ? (
                <UrgentPill />
              ) : (
                <StatusPill
                  label={statusLabel(report.status)}
                  tone={report.status === 'closed' ? 'green' : report.status === 'new' ? 'amber' : 'lavender'}
                />
              )}
            </Pressable>
            {urgent ? (
              <View style={styles.emergencyBanner}>
                <Ionicons name="warning-outline" size={17} color={UI.red} />
                <Text style={styles.emergencyText}>
                  Follow local escalation protocol immediately and arrange facility care as needed.
                </Text>
              </View>
            ) : null}
            <View style={styles.symptomList}>
              {report.symptoms.map((symptom) => {
                const code = getMaternalSymptomCode(symptom);
                const urgentCode = urgent && isEmergencyMaternalSymptom(symptom);
                return (
                  <View key={symptom} style={styles.symptomRow}>
                    <Text style={styles.symptom}>{symptom}</Text>
                    <View style={[styles.codeBadge, urgentCode && styles.codeBadgeUrgent]}>
                      <Text style={[styles.codeText, urgentCode && styles.codeTextUrgent]}>{code.code}</Text>
                    </View>
                    <Text style={styles.codeSource}>{code.source}</Text>
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
            {report.notes ? <Text style={styles.note}>{report.notes}</Text> : null}
            {report.voiceTranscriptAuthorized && report.voiceTranscript ? (
              <View style={styles.transcript}>
                <Text style={styles.transcriptTitle}>Authorized transcript</Text>
                <Text style={styles.note}>{report.voiceTranscript}</Text>
              </View>
            ) : null}
            {report.actions.length > 0 ? (
              <View style={styles.timeline}>
                <Text style={styles.timelineTitle}>Follow-up history</Text>
                {report.actions.map((action, index) => (
                  <Text key={`${report.id}-${index}`} style={styles.meta}>
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
      {alerts.length === 0 ? (
        <Card style={styles.emptyState}>
          <Text style={styles.alertTitle}>No symptom alerts</Text>
          <Text style={styles.note}>New reports from your assigned mothers will appear here.</Text>
        </Card>
      ) : null}
    </Page>
  );
}

function UrgentPill() {
  return <Text style={styles.urgentPill}>Urgent</Text>;
}

function statusLabel(status: SymptomReportStatus) {
  const labels: Record<SymptomReportStatus, string> = {
    new: 'New',
    acknowledged: 'Acknowledged',
    contacted: 'Contacted',
    referred: 'Referred',
    closed: 'Closed',
  };
  return labels[status];
}

const styles = StyleSheet.create({
  urgentNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 14, backgroundColor: '#FDE8E7' },
  urgentNoticeText: { flex: 1, color: UI.red, fontSize: 12, fontWeight: '800', lineHeight: 17 },
  alertCard: { gap: 12 },
  emergencyCard: { borderColor: '#F3B9B9', backgroundColor: '#FFF9F8' },
  alertHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.amberLight },
  urgentIcon: { backgroundColor: '#FDE8E7' },
  alertCopy: { flex: 1, gap: 3 },
  alertTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  meta: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  emergencyBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 13, backgroundColor: '#FDE8E7' },
  emergencyText: { flex: 1, color: UI.red, fontSize: 11, fontWeight: '800', lineHeight: 16 },
  symptomList: { gap: 7 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  symptom: { flex: 1, color: UI.ink, fontSize: 13, fontWeight: '700' },
  codeBadge: { minWidth: 38, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, backgroundColor: UI.amberLight },
  codeBadgeUrgent: { backgroundColor: '#FDE8E7' },
  codeText: { color: UI.amber, fontSize: 11, fontWeight: '900' },
  codeTextUrgent: { color: UI.red },
  codeSource: { color: UI.muted, fontSize: 9, fontWeight: '700' },
  note: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  transcript: { gap: 7, padding: 12, borderRadius: 14, backgroundColor: '#F7F2FA' },
  transcriptTitle: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  timeline: { gap: 7, padding: 11, borderRadius: 13, backgroundColor: '#F7F5F8' },
  timelineTitle: { color: UI.ink, fontSize: 12, fontWeight: '800' },
  actions: { gap: 7 },
  closeAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: UI.white, borderWidth: 1, borderColor: UI.border },
  closeActionText: { color: UI.red, fontSize: 13, fontWeight: '800' },
  urgentPill: { color: UI.red, fontSize: 10, fontWeight: '900', borderRadius: 10, backgroundColor: '#FDE8E7', paddingHorizontal: 9, paddingVertical: 6 },
  emptyState: { gap: 6 },
  pressed: { opacity: 0.78 },
});
