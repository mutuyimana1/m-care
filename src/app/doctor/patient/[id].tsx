import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  Card,
  InfoLine,
  Page,
  PageHeader,
  PrimaryButton,
  SectionHeading,
  StatusPill,
  UI,
} from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients } = useClinic();
  const patientId = Array.isArray(id) ? id[0] : id;
  const patient = patients.find((record) => record.id === patientId);

  if (!patient) {
    return (
      <Page>
        <PageHeader eyebrow="CARE RECORD" title="Profile not found" />
        <Card>
          <Text style={styles.copy}>This profile is not available in the current demo session.</Text>
          <PrimaryButton label="Return to patient list" onPress={() => router.replace('/doctor/patients')} />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="MATERNAL CARE RECORD"
        title={patient.name}
        subtitle={`${patient.id} · Added ${patient.createdAt}`}
      />

      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="shield-checkmark-outline" size={23} color={UI.green} />
          <Text style={styles.statusTitle}>Pregnancy episode</Text>
          <StatusPill label={patient.pregnancyResult} />
        </View>
        <Text style={styles.copy}>
          {patient.confirmationMethod} · confirmed {patient.confirmationDate} by {patient.clinicianName}
        </Text>
        <Text style={styles.copy}>
          {patient.clinicianApproved ? 'Initial care plan reviewed and approved.' : 'Clinical review required.'}
        </Text>
      </Card>

      <Card>
        <SectionHeading title="Personal information" />
        <InfoLine label="Phone" value={patient.phone} />
        <InfoLine label="Date of birth" value={patient.dateOfBirth} />
        <InfoLine label="Preferred language" value={patient.preferredLanguage} />
        <InfoLine label="Health facility" value={patient.facility} />
        <InfoLine label="Consent" value={patient.consent ? 'Recorded' : 'Not recorded'} />
      </Card>

      <Card>
        <SectionHeading title="Obstetric and medical history" />
        <InfoLine label="Gravida / para" value={`${patient.gravida || '—'} / ${patient.para || '—'}`} />
        <InfoLine label="Previous pregnancies" value={patient.previousPregnancies} />
        <InfoLine label="Complications" value={patient.complications} />
        <InfoLine label="Conditions" value={patient.conditions} />
        <InfoLine label="Medicines" value={patient.medications} />
        <InfoLine label="Allergies" value={patient.allergies} />
      </Card>

      <Card>
        <SectionHeading title="Clinical measurements" />
        <InfoLine label="Blood pressure" value={patient.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic} mmHg` : 'Not recorded'} />
        <InfoLine label="Weight" value={patient.weightKg ? `${patient.weightKg} kg` : 'Not recorded'} />
        <InfoLine label="Temperature" value={patient.temperatureC ? `${patient.temperatureC} °C` : 'Not recorded'} />
        <InfoLine label="Pulse" value={patient.pulse ? `${patient.pulse} bpm` : 'Not recorded'} />
      </Card>

      <Card>
        <SectionHeading title="Laboratory investigations" />
        <InfoLine label="Hemoglobin" value={patient.hemoglobin} />
        <InfoLine label="Blood group" value={patient.bloodGroup} />
        <InfoLine label="HIV" value={patient.hiv} />
        <InfoLine label="Syphilis" value={patient.syphilis} />
        <InfoLine label="Urine protein" value={patient.urineProtein} />
        <InfoLine label="Other tests" value={patient.otherTests} />
        {patient.missingAssessments ? (
          <View style={styles.followUp}>
            <Ionicons name="time-outline" size={17} color={UI.amber} />
            <Text style={styles.followUpText}>Outstanding: {patient.missingAssessments}</Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <SectionHeading title="Assessment and plan" />
        <InfoLine label="Risk factors" value={patient.riskFactors} />
        <InfoLine label="Follow-up" value={patient.followUp} />
        <InfoLine label="Care plan" value={patient.carePlan} />
      </Card>

      <PrimaryButton label="Back to patient list" onPress={() => router.replace('/doctor/patients')} />
      <Text style={styles.footer}>
        Demo patient information only. Clinical decisions must be made by an authorized
        professional using verified records and local protocols.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  statusCard: { backgroundColor: '#F0F7F3', borderColor: '#DDEDE4' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  statusTitle: { color: UI.ink, fontSize: 15, fontWeight: '800', flex: 1 },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  followUp: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 12, backgroundColor: UI.amberLight },
  followUpText: { flex: 1, color: UI.amber, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  footer: { color: UI.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
