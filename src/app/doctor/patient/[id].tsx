import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { useClinic } from '@/contexts/clinic-context';
import { getMaternalCompleteness } from '@/utils/maternal-completeness';

export default function PatientDetailsScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    patients,
    symptomReports,
    followUpRequests,
    reviewSymptomReport,
    reviewFollowUpRequest,
    updatePatient,
  } = useClinic();
  const patientId = Array.isArray(id) ? id[0] : id;
  const patient = patients.find((record) => record.id === patientId);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [postpartumFollowUpDate, setPostpartumFollowUpDate] = useState('');
  const patientReports = symptomReports.filter((report) => report.patientId === patientId);
  const patientRequests = followUpRequests.filter((request) => request.patientId === patientId);

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

  const completeness = getMaternalCompleteness(patient);

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
          <Text style={styles.statusTitle}>{patient.postpartumStatus === 'postpartum' ? 'Postpartum follow-up' : 'Pregnancy episode'}</Text>
          <StatusPill
            label={patient.postpartumStatus === 'postpartum' ? 'Postpartum' : patient.pregnancyResult}
            tone={patient.clinicianApproved ? 'green' : 'amber'}
          />
        </View>
        <Text style={styles.copy}>
          {patient.confirmationMethod} · confirmed {patient.confirmationDate} by {patient.clinicianName}
        </Text>
        <Text style={styles.copy}>
          {patient.clinicianApproved ? 'Initial care plan reviewed and approved.' : 'Clinical review required.'}
        </Text>
        {patient.clinicianApproved ? (
          <Text style={styles.copy}>Reviewed by {patient.reviewedBy || 'Authorized clinician'} · {patient.reviewedAt || 'Date not recorded'}</Text>
        ) : null}
        {patient.pregnancyResult !== 'Positive' && patient.pregnancyResult !== 'Confirmed' ? (
          <Text style={styles.copy}>Pregnancy is not confirmed; this maternal profile has no active pregnancy episode.</Text>
        ) : null}
      </Card>

      <Card>
        <SectionHeading title="Registration completeness" action={`${completeness.percent}%`} />
        {completeness.items.map((item) => (
          <View key={item.label} style={styles.completenessRow}>
            <Ionicons
              name={item.complete ? 'checkmark-circle' : 'ellipse-outline'}
              size={17}
              color={item.complete ? UI.green : UI.muted}
            />
            <Text style={styles.copy}>{item.label}</Text>
          </View>
        ))}
        {completeness.missing.length ? (
          <Text style={styles.followUpText}>
            Still to document: {completeness.missing.map((item) => item.label).join('; ')}.
          </Text>
        ) : null}
      </Card>

      <Card>
        <SectionHeading title="Personal information" />
        <InfoLine label="Phone" value={patient.phone} />
        <InfoLine label="Mother account" value={patient.motherAccountEmail} />
        <InfoLine label="National ID" value={patient.nationalId} />
        <InfoLine label="Date of birth" value={patient.dateOfBirth} />
        <InfoLine label="Preferred language" value={patient.preferredLanguage} />
        <InfoLine label="Location" value={[patient.village, patient.cell, patient.sector, patient.district].filter(Boolean).join(', ')} />
        <InfoLine label="Health facility" value={patient.facility} />
        <InfoLine label="Facility contact" value={patient.facilityContactPhone} />
        <InfoLine label="Emergency contact" value={[patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(' · ')} />
        <InfoLine label="Community health worker" value={patient.communityHealthWorker} />
        <InfoLine label="Consent" value={patient.consent ? 'Recorded' : 'Not recorded'} />
        <InfoLine label="Consent recorded" value={patient.consentRecordedAt} />
      </Card>

      <Card>
        <SectionHeading title="Pregnancy dating and confirmation" />
        <InfoLine label="Test date" value={patient.pregnancyTestDate} />
        <InfoLine label="Last menstrual period" value={patient.lastMenstrualPeriod} />
        <InfoLine label="Estimated due date" value={patient.estimatedDueDate} />
        <InfoLine label="Dating method" value={patient.datingMethod} />
        <InfoLine label="Dating source / confidence" value={patient.datingSource} />
        <InfoLine label="Gestational age" value={patient.gestationalAgeWeeks ? `${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays || '0'} days` : 'Not recorded'} />
      </Card>

      <Card>
        <SectionHeading title="Obstetric and medical history" />
        <InfoLine label="Gravida / para" value={`${patient.gravida || '—'} / ${patient.para || '—'}`} />
        <InfoLine label="Previous pregnancies" value={patient.previousPregnancies} />
        <InfoLine label="Previous outcomes" value={patient.pregnancyOutcomes} />
        <InfoLine label="Previous delivery mode" value={patient.previousDeliveryMode} />
        <InfoLine label="Living children" value={patient.livingChildren} />
        <InfoLine label="Most recent birth" value={patient.lastBirthDate} />
        <InfoLine label="Birth spacing" value={patient.birthSpacing} />
        <InfoLine label="Complications" value={patient.complications} />
        <InfoLine label="Current concerns" value={patient.currentSymptoms} />
        <InfoLine label="Conditions" value={patient.conditions} />
        <InfoLine label="Surgical history" value={patient.surgicalHistory} />
        <InfoLine label="Family history" value={patient.familyHistory} />
        <InfoLine label="Mental health / psychosocial history" value={patient.mentalHealthHistory} />
        <InfoLine label="Medicines" value={patient.medications} />
        <InfoLine label="Allergies" value={patient.allergies} />
      </Card>

      <Card>
        <SectionHeading title="Clinical measurements" />
        <InfoLine label="Blood pressure" value={patient.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic} mmHg` : 'Not recorded'} />
        <InfoLine label="Weight" value={patient.weightKg ? `${patient.weightKg} kg` : 'Not recorded'} />
        <InfoLine label="Height" value={patient.heightCm ? `${patient.heightCm} cm` : 'Not recorded'} />
        <InfoLine label="Temperature" value={patient.temperatureC ? `${patient.temperatureC} °C` : 'Not recorded'} />
        <InfoLine label="Pulse" value={patient.pulse ? `${patient.pulse} bpm` : 'Not recorded'} />
        <InfoLine label="Respiratory rate" value={patient.respiratoryRate ? `${patient.respiratoryRate} breaths/min` : 'Not recorded'} />
        <InfoLine label="Oxygen saturation" value={patient.oxygenSaturation ? `${patient.oxygenSaturation}%` : 'Not recorded'} />
        <InfoLine label="Fundal height" value={patient.fundalHeightCm ? `${patient.fundalHeightCm} cm` : 'Not recorded'} />
        <InfoLine label="Fetal heart rate" value={patient.fetalHeartRate ? `${patient.fetalHeartRate} bpm` : 'Not recorded'} />
      </Card>

      <Card>
        <SectionHeading title="Monitoring baseline" />
        <InfoLine label="Blood pressure" value={patient.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic} mmHg` : 'Not recorded'} />
        <InfoLine label="Gestational age source" value={patient.datingSource || patient.datingMethod} />
        <InfoLine label="Relevant history" value={[patient.conditions, patient.complications, patient.riskFactors].filter(Boolean).join(' · ')} />
        <InfoLine label="Urine protein" value={patient.urineProtein} />
        <InfoLine label="Woman-reported concerns" value={patient.currentSymptoms} />
        <Text style={styles.copy}>
          This is a record of available baseline information only. No clinical thresholds or diagnosis are generated; the authorized clinician must review findings using local protocols.
        </Text>
      </Card>

      <Card>
        <SectionHeading title="Laboratory investigations" />
        <InfoLine label="Hemoglobin" value={patient.hemoglobin} />
        <InfoLine label="Blood group" value={patient.bloodGroup} />
        <InfoLine label="Rhesus factor" value={patient.rhesusFactor} />
        <InfoLine label="HIV" value={patient.hiv} />
        <InfoLine label="Syphilis" value={patient.syphilis} />
        <InfoLine label="Urine protein" value={patient.urineProtein} />
        <InfoLine label="Urine glucose" value={patient.urineGlucose} />
        <InfoLine label="Hepatitis B" value={patient.hepatitisB} />
        <InfoLine label="Malaria" value={patient.malaria} />
        <InfoLine label="Sickle cell" value={patient.sickleCell} />
        <InfoLine label="Ultrasound / diagnostics" value={patient.ultrasoundSummary} />
        <InfoLine label="Result source" value={patient.investigationSource} />
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
        <InfoLine label="Priority findings" value={patient.priorityFindings} />
        <InfoLine label="Follow-up" value={patient.followUp} />
        <InfoLine label="Next appointment" value={patient.nextAppointmentDate} />
        <InfoLine label="Care plan" value={patient.carePlan} />
        <InfoLine label="Referral facility" value={patient.referralFacility} />
        <InfoLine label="Referral notes" value={patient.referralReason} />
        <InfoLine label="Message for the woman" value={patient.careTeamMessage} />
      </Card>

      <PrimaryButton
        label="View assessment summary"
        icon="document-text-outline"
        onPress={() => router.push({ pathname: '/doctor/summary', params: { id: patient.id } })}
      />

      {patientReports.length ? (
        <Card>
          <SectionHeading title="Woman-reported symptoms" action={`${patientReports.length} report${patientReports.length === 1 ? '' : 's'}`} />
          {patientReports.map((report) => (
            <View key={report.id} style={styles.report}>
              <Text style={styles.reportTitle}>{report.symptoms.join(', ')}</Text>
              <Text style={styles.copy}>{report.notes || 'No additional notes'}</Text>
              <Text style={styles.reportDate}>{new Date(report.reportedAt).toLocaleString()}</Text>
              <Text style={report.reviewed ? styles.reviewedText : styles.followUpText}>
                {report.reviewed ? 'Reviewed' : 'Needs clinician review'}
              </Text>
              {!report.reviewed ? (
                <PrimaryButton
                  label="Mark symptom report reviewed"
                  onPress={() => reviewSymptomReport(report.id, user?.name ?? 'Authorized clinician')}
                />
              ) : (
                <Text style={styles.reportDate}>Reviewed by {report.reviewedBy} · {report.reviewedAt}</Text>
              )}
            </View>
          ))}
          <Text style={styles.followUpText}>Reports in this prototype are not monitored in real time.</Text>
        </Card>
      ) : null}

      {patientRequests.length ? (
        <Card>
          <SectionHeading title="Follow-up requests" />
          {patientRequests.map((request) => (
            <View key={request.id} style={styles.report}>
              <Text style={styles.reportTitle}>{request.message}</Text>
              <Text style={styles.reportDate}>{new Date(request.requestedAt).toLocaleString()}</Text>
              <Text style={request.reviewed ? styles.reviewedText : styles.followUpText}>
                {request.reviewed ? 'Reviewed' : 'Needs follow-up'}
              </Text>
              {!request.reviewed ? (
                <PrimaryButton
                  label="Mark request reviewed"
                  onPress={() => reviewFollowUpRequest(request.id, user?.name ?? 'Authorized clinician')}
                />
              ) : (
                <Text style={styles.reportDate}>Reviewed by {request.reviewedBy} · {request.reviewedAt}</Text>
              )}
            </View>
          ))}
        </Card>
      ) : null}

      {patient.postpartumStatus === 'pregnant' ? (
        <Card>
          <SectionHeading title="Postpartum transition" />
          <Text style={styles.copy}>
            An authorized clinician can keep this profile active after delivery and record postpartum follow-up.
          </Text>
          <Field label="Delivery date (YYYY-MM-DD)" value={deliveryDate} onChangeText={setDeliveryDate} />
          <Field label="Postpartum follow-up date (optional)" value={postpartumFollowUpDate} onChangeText={setPostpartumFollowUpDate} />
          <PrimaryButton
            label="Transition to postpartum"
            icon="heart-outline"
            disabled={!isValidDate(deliveryDate) || Boolean(postpartumFollowUpDate && !isValidDate(postpartumFollowUpDate))}
            onPress={() => updatePatient(patient.id, {
              postpartumStatus: 'postpartum',
              deliveryDate,
              postpartumFollowUpDate,
            })}
          />
        </Card>
      ) : (
        <Card style={styles.statusCard}>
          <SectionHeading title="Postpartum follow-up" />
          <InfoLine label="Delivery date" value={patient.deliveryDate} />
          <InfoLine label="Follow-up date" value={patient.postpartumFollowUpDate} />
        </Card>
      )}

      <PrimaryButton label="Back to patient list" onPress={() => router.replace('/doctor/patients')} />
      <Text style={styles.footer}>
        Demo patient information only. Clinical decisions must be made by an authorized
        professional using verified records and local protocols.
      </Text>
    </Page>
  );
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  return date.getFullYear() === Number(yearText) && date.getMonth() === Number(monthText) - 1 && date.getDate() === Number(dayText);
}

const styles = StyleSheet.create({
  statusCard: { backgroundColor: '#F0F7F3', borderColor: '#DDEDE4' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  statusTitle: { color: UI.ink, fontSize: 15, fontWeight: '800', flex: 1 },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  followUp: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: 12, backgroundColor: UI.amberLight },
  followUpText: { flex: 1, color: UI.amber, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  report: { gap: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: UI.border },
  reportTitle: { color: UI.ink, fontSize: 12, fontWeight: '800' },
  reportDate: { color: UI.muted, fontSize: 10 },
  reviewedText: { color: UI.green, fontSize: 11, fontWeight: '700' },
  completenessRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { color: UI.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
