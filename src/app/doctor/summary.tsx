import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, InfoLine, Page, PageHeader, PrimaryButton, SectionHeading, UI } from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';

export default function DoctorSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients } = useClinic();
  const patientId = Array.isArray(id) ? id[0] : id;
  const patient = patients.find((record) => record.id === patientId);

  if (!patient) {
    return (
      <Page>
        <PageHeader
          eyebrow="CARE RECORD"
          title="No summary available"
          subtitle="Choose a patient profile to view an assessment summary."
          onBack={() => router.replace('/doctor/patients')}
          backLabel="Back to patients"
        />
        <Card>
          <Text style={styles.copy}>This patient record is not available in the current session.</Text>
        </Card>
      </Page>
    );
  }

  const riskFlags = [
    patient.riskFactors,
    patient.priorityFindings,
    patient.missingAssessments,
  ].filter(Boolean);

  return (
    <Page>
      <PageHeader
        eyebrow="ASSESSMENT SUMMARY"
        title={`${patient.name} · summary`}
        subtitle={`${patient.id} · ${patient.facility || 'Facility not recorded'}`}
        onBack={() => router.replace('/doctor/patients')}
        backLabel="Back to patient list"
      />

      <Card style={styles.banner}>
        <View style={styles.bannerRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color={UI.green} />
          <Text style={styles.bannerText}>{patient.clinicianApproved ? 'Reviewed and approved' : 'Awaiting clinical review'}</Text>
        </View>
        <Text style={styles.copy}>
          {patient.confirmationMethod} · confirmed {patient.confirmationDate || 'date not recorded'} by {patient.clinicianName || 'clinician not recorded'}
        </Text>
      </Card>

      <SectionHeading title="Pregnancy overview" />
      <Card>
        <InfoLine label="Pregnancy result" value={patient.pregnancyResult} />
        <InfoLine label="Estimated gestational age" value={patient.gestationalAgeWeeks ? `${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays || '0'} days` : 'Not recorded'} />
        <InfoLine label="Estimated due date" value={patient.estimatedDueDate} />
        <InfoLine label="Next ANC visit" value={patient.nextAppointmentDate || 'Not recorded'} />
        <InfoLine label="Current symptoms" value={patient.currentSymptoms || 'No symptoms recorded'} />
      </Card>

      <SectionHeading title="Assessment findings" />
      <Card>
        <InfoLine label="Blood pressure" value={patient.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic} mmHg` : 'Not recorded'} />
        <InfoLine label="Weight" value={patient.weightKg ? `${patient.weightKg} kg` : 'Not recorded'} />
        <InfoLine label="Urine protein" value={patient.urineProtein || 'Not recorded'} />
        <InfoLine label="Hemoglobin" value={patient.hemoglobin || 'Not recorded'} />
        <InfoLine label="HIV status" value={patient.hiv || 'Not recorded'} />
        <InfoLine label="Relevant history" value={[patient.conditions, patient.complications].filter(Boolean).join(' · ') || 'No history recorded'} />
      </Card>

      <SectionHeading title="Recommended actions" />
      <Card>
        {riskFlags.length ? (
          riskFlags.map((flag) => (
            <View key={flag} style={styles.flagRow}>
              <Ionicons name="alert-circle-outline" size={17} color={UI.amber} />
              <Text style={styles.flagText}>{flag}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>No additional risk flags or follow-up notes were recorded in this demo record.</Text>
        )}
      </Card>

      <PrimaryButton label="Open patient record" onPress={() => router.push({ pathname: '/doctor/patient/[id]', params: { id: patient.id } })} />
    </Page>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#F0F7F3', borderColor: '#DDEDE4' },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerText: { color: UI.green, fontWeight: '800', fontSize: 14 },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 },
  flagText: { flex: 1, color: UI.ink, fontSize: 12, lineHeight: 18 },
});
