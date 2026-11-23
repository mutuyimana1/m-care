import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, InfoLine, Page, PageHeader, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { getMaternalSymptomCode, isEmergencyMaternalReport, isEmergencyMaternalSymptom } from '@/utils/maternal-symptom-codes';

export default function ChwMotherDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { patients, symptomReports, triggerIvrCall } = useClinic();
  const patientId = Array.isArray(id) ? id[0] : id;
  const patient = patients.find(
    (record) =>
      record.id === patientId &&
      record.communityHealthWorker.trim().toLowerCase() === user?.name.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );

  if (!patient) {
    return (
      <Page>
        <PageHeader
          eyebrow="CHW CARE RECORD"
          title="Mother not available"
          onBack={() => router.replace('/chw')}
          backLabel="Back to mothers"
        />
        <Card>
          <Text style={styles.copy}>This mother is not assigned to your CHW account or is unavailable.</Text>
        </Card>
      </Page>
    );
  }

  const reports = symptomReports
    .filter((report) => report.patientId === patient.id)
    .sort((left, right) => right.reportedAt.localeCompare(left.reportedAt));
  const openReports = reports.filter((report) => report.status !== 'closed');
  const hasEmergency = openReports.some(isEmergencyMaternalReport);

  const callMother = async () => {
    const phone = patient.phone.trim();
    if (!phone || phone.toLowerCase().includes('demo')) {
      Alert.alert('Call unavailable', 'This demo profile does not have a callable phone number.');
      return;
    }

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

  const promptIvrCall = () => {
    Alert.alert('Automated IVR check-in', `Trigger a simulated check-in for ${patient.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Healthy (Key 1)',
        onPress: () => {
          triggerIvrCall(patient.id, 'Healthy');
          Alert.alert('Call completed', `The check-in for ${patient.name} was recorded as healthy.`);
        },
      },
      {
        text: 'Danger sign (Key 2)',
        style: 'destructive',
        onPress: () => {
          triggerIvrCall(patient.id, 'Danger Sign');
          Alert.alert('Urgent alert created', 'A danger-sign report has been added to the Alerts tab.');
        },
      },
    ]);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="CHW · MOTHER DETAILS"
        title={patient.name}
        subtitle={`${patient.id} · Assigned to ${patient.communityHealthWorker}`}
        onBack={() => router.back()}
        backLabel="Back to mothers"
      />

      <Card style={[styles.profileCard, hasEmergency && styles.emergencyCard]}>
        <View style={styles.profileHeading}>
          <View style={[styles.profileIcon, hasEmergency && styles.emergencyIcon]}>
            <Ionicons name={hasEmergency ? 'warning-outline' : 'person-outline'} size={23} color={hasEmergency ? UI.red : UI.accentDark} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileTitle}>{patient.postpartumStatus === 'postpartum' ? 'Postpartum follow-up' : 'Pregnancy follow-up'}</Text>
            <Text style={styles.copy}>{patient.gestationalAgeWeeks} weeks {patient.gestationalAgeDays} days · Due {patient.estimatedDueDate}</Text>
          </View>
          {hasEmergency ? <UrgentPill /> : <StatusPill label="Assigned" tone="green" />}
        </View>
        {hasEmergency ? (
          <View style={styles.emergencyBanner}>
            <Ionicons name="alert-circle" size={18} color={UI.red} />
            <Text style={styles.emergencyText}>Open danger-sign report. Follow local emergency escalation protocol now; do not wait for an app reply.</Text>
          </View>
        ) : null}
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            disabled={!patient.phone.trim() || patient.phone.toLowerCase().includes('demo')}
            onPress={() => void callMother()}
            style={({ pressed }) => [
              styles.callButton,
              (!patient.phone.trim() || patient.phone.toLowerCase().includes('demo')) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="call-outline" size={17} color={UI.accentDark} />
            <Text style={styles.callButtonText}>Call mother</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={promptIvrCall} style={({ pressed }) => [styles.ivrButton, pressed && styles.pressed]}>
            <Ionicons name="phone-portrait-outline" size={17} color={UI.green} />
            <Text style={styles.ivrButtonText}>IVR check-in</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <SectionHeading title="Contact and community" />
        <InfoLine label="Phone" value={patient.phone} />
        <InfoLine label="Preferred language" value={patient.preferredLanguage} />
        <InfoLine label="Village / cell / sector" value={[patient.village, patient.cell, patient.sector].filter(Boolean).join(', ')} />
        <InfoLine label="Health facility" value={patient.facility} />
        <InfoLine label="Facility contact" value={patient.facilityContactPhone} />
        <InfoLine label="Emergency contact" value={[patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(' · ')} />
        <InfoLine label="Last IVR check-in" value={patient.lastIvrCallDate ? `${new Date(patient.lastIvrCallDate).toLocaleString()} · ${patient.lastIvrOutcome || 'Outcome not recorded'}` : 'No call logged yet'} />
      </Card>

      <Card>
        <SectionHeading title="Pregnancy and care" />
        <InfoLine label="Pregnancy status" value={patient.postpartumStatus === 'postpartum' ? 'Postpartum' : patient.pregnancyResult} />
        <InfoLine label="Gestational age" value={`${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays} days`} />
        <InfoLine label="Estimated due date" value={patient.estimatedDueDate} />
        <InfoLine label="Gravida / para" value={`${patient.gravida || '—'} / ${patient.para || '—'}`} />
        <InfoLine label="Current concerns" value={patient.currentSymptoms} />
        <InfoLine label="Risk factors" value={patient.riskFactors} />
        <InfoLine label="Next appointment" value={patient.nextAppointmentDate} />
        <InfoLine label="Referral status" value={referralLabel(patient.referralStatus)} />
        {patient.referralReason ? <InfoLine label="Referral reason" value={patient.referralReason} /> : null}
      </Card>

      <SectionHeading title="Symptom reports" action={`${openReports.length} open`} />
      {reports.map((report) => {
        const urgent = report.status !== 'closed' && isEmergencyMaternalReport(report);
        return (
          <Card key={report.id} style={[styles.reportCard, urgent && styles.emergencyCard]}>
            <View style={styles.reportHeading}>
              <View style={styles.profileCopy}>
                <Text style={styles.reportTitle}>{report.symptoms.join(', ')}</Text>
                <Text style={styles.reportMeta}>{report.id} · {new Date(report.reportedAt).toLocaleString()}</Text>
              </View>
              {urgent ? <UrgentPill /> : <StatusPill label={statusLabel(report.status)} tone={report.status === 'closed' ? 'green' : 'amber'} />}
            </View>
            <View style={styles.codeList}>
              {report.symptoms.map((symptom) => {
                const code = getMaternalSymptomCode(symptom);
                const urgentCode = isEmergencyMaternalSymptom(symptom);
                return (
                  <View key={symptom} style={[styles.codeChip, urgentCode && styles.emergencyCodeChip]}>
                    <Text style={[styles.codeText, urgentCode && styles.emergencyCodeText]}>{code.code}</Text>
                    <Text style={[styles.codeSource, urgentCode && styles.emergencyCodeText]}>{code.source}</Text>
                  </View>
                );
              })}
            </View>
            <InfoLine label="Status" value={statusLabel(report.status)} />
            <InfoLine label="Severity reported" value={report.severity} />
            <InfoLine label="Onset and pattern" value={`${report.onset} · ${report.pattern}`} />
            <InfoLine label="Getting worse" value={report.worsening} />
            <InfoLine label="Contacted CHW / visited facility" value={`${report.contactedChw ? 'CHW contacted' : 'CHW not contacted'} · ${report.visitedFacility ? 'Facility visited' : 'Facility not visited'}`} />
            {report.notes ? <Text style={styles.copy}>{report.notes}</Text> : null}
            {report.actions.length > 0 ? (
              <View style={styles.timeline}>
                <Text style={styles.timelineTitle}>Follow-up history</Text>
                {report.actions.map((action, index) => (
                  <Text key={`${report.id}-${index}`} style={styles.reportMeta}>
                    {statusLabel(action.status)} · {action.actor} · {new Date(action.occurredAt).toLocaleString()}
                    {action.note ? ` · ${action.note}` : ''}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
      {reports.length === 0 ? (
        <Card>
          <Text style={styles.profileTitle}>No symptom reports</Text>
          <Text style={styles.copy}>There are no symptom reports recorded for this mother.</Text>
        </Card>
      ) : null}

      <Text style={styles.footer}>Only assigned, consented, clinician-approved records are available here. Follow local clinical and emergency protocols.</Text>
    </Page>
  );
}

function UrgentPill() {
  return <Text style={styles.urgentPill}>Urgent</Text>;
}

function referralLabel(status: string) {
  const labels: Record<string, string> = {
    'not-started': 'Not started',
    sent: 'Sent',
    received: 'Received',
    completed: 'Action recorded',
  };
  return labels[status] ?? status;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    new: 'New',
    acknowledged: 'Acknowledged',
    contacted: 'Contacted',
    referred: 'Referred',
    closed: 'Closed',
  };
  return labels[status] ?? status;
}

const styles = StyleSheet.create({
  profileCard: { gap: 14 },
  emergencyCard: { borderColor: '#F3B9B9', backgroundColor: '#FFF5F5' },
  profileHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: UI.lavender, alignItems: 'center', justifyContent: 'center' },
  emergencyIcon: { backgroundColor: '#FDE8E7' },
  profileCopy: { flex: 1, gap: 4 },
  profileTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  emergencyBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 13, backgroundColor: '#FDE8E7' },
  emergencyText: { flex: 1, color: UI.red, fontSize: 12, fontWeight: '800', lineHeight: 17 },
  actionRow: { flexDirection: 'row', gap: 9 },
  callButton: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: UI.lavender },
  callButtonText: { color: UI.accentDark, fontSize: 12, fontWeight: '800' },
  ivrButton: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: UI.greenLight, borderWidth: 1, borderColor: '#C8E6C9' },
  ivrButtonText: { color: UI.green, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  reportCard: { gap: 11 },
  reportHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  reportTitle: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  reportMeta: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  codeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  codeChip: { flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: UI.amberLight },
  emergencyCodeChip: { backgroundColor: '#FDE8E7' },
  codeText: { color: UI.amber, fontSize: 11, fontWeight: '900' },
  codeSource: { color: UI.muted, fontSize: 9, fontWeight: '700' },
  emergencyCodeText: { color: UI.red },
  urgentPill: { color: UI.red, fontSize: 10, fontWeight: '900', borderRadius: 10, backgroundColor: '#FDE8E7', paddingHorizontal: 9, paddingVertical: 6 },
  timeline: { gap: 6, padding: 11, borderRadius: 13, backgroundColor: UI.white },
  timelineTitle: { color: UI.ink, fontSize: 12, fontWeight: '800' },
  footer: { color: UI.muted, fontSize: 10, lineHeight: 16 },
  pressed: { opacity: 0.78 },
});
