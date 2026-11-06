import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  Field,
  Page,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
  UI,
} from '@/components/mcare-ui';
import { useClinic, type PatientRecord } from '@/contexts/clinic-context';

type PatientDraft = Omit<PatientRecord, 'id' | 'createdAt' | 'clinicianApproved'>;
type DraftKey = keyof PatientDraft;
type DraftTextKey = Exclude<DraftKey, 'consent'>;

const steps = [
  { title: 'Find or identify', subtitle: 'Search first to help avoid duplicate records.' },
  { title: 'Personal information', subtitle: 'Record contact details, language, and consent.' },
  { title: 'Pregnancy confirmation', subtitle: 'Document the method, result, date, and clinician.' },
  { title: 'Obstetric history', subtitle: 'Capture previous pregnancies and related history.' },
  { title: 'Medical history', subtitle: 'Record known conditions, medicines, and allergies.' },
  { title: 'Clinical measurements', subtitle: 'Add measurements from the current assessment.' },
  { title: 'Laboratory results', subtitle: 'Enter available results and tests still pending.' },
  { title: 'Assessment summary', subtitle: 'Summarize risks, gaps, and planned follow-up.' },
  { title: 'Clinical review', subtitle: 'Review and approve the initial care plan.' },
];

const initialDraft: PatientDraft = {
  name: '',
  phone: '',
  dateOfBirth: '',
  preferredLanguage: 'Kinyarwanda',
  facility: '',
  consent: false,
  confirmationMethod: '',
  pregnancyResult: 'Pending',
  confirmationDate: '',
  clinicianName: '',
  gravida: '',
  para: '',
  previousPregnancies: '',
  complications: '',
  conditions: '',
  medications: '',
  allergies: '',
  systolic: '',
  diastolic: '',
  weightKg: '',
  temperatureC: '',
  pulse: '',
  hemoglobin: '',
  bloodGroup: '',
  hiv: '',
  syphilis: '',
  urineProtein: '',
  otherTests: '',
  riskFactors: '',
  missingAssessments: '',
  followUp: '',
  carePlan: '',
};

const fieldsByStep: Record<number, { key: DraftTextKey; label: string; multiline?: boolean; numeric?: boolean }[]> = {
  0: [
    { key: 'name', label: 'Full name' },
    { key: 'phone', label: 'Phone number' },
  ],
  1: [
    { key: 'dateOfBirth', label: 'Date of birth (YYYY-MM-DD)' },
    { key: 'preferredLanguage', label: 'Preferred language' },
    { key: 'facility', label: 'Health facility' },
  ],
  2: [
    { key: 'confirmationDate', label: 'Date confirmed (YYYY-MM-DD)' },
    { key: 'clinicianName', label: 'Confirming clinician' },
  ],
  3: [
    { key: 'gravida', label: 'Total pregnancies (gravida)', numeric: true },
    { key: 'para', label: 'Previous births (para)', numeric: true },
    { key: 'previousPregnancies', label: 'Previous pregnancy details', multiline: true },
    { key: 'complications', label: 'Previous complications', multiline: true },
  ],
  4: [
    { key: 'conditions', label: 'Medical conditions', multiline: true },
    { key: 'medications', label: 'Current medicines', multiline: true },
    { key: 'allergies', label: 'Allergies or reactions', multiline: true },
  ],
  5: [
    { key: 'systolic', label: 'Blood pressure — systolic (mmHg)', numeric: true },
    { key: 'diastolic', label: 'Blood pressure — diastolic (mmHg)', numeric: true },
    { key: 'weightKg', label: 'Weight (kg)', numeric: true },
    { key: 'temperatureC', label: 'Temperature (°C)', numeric: true },
    { key: 'pulse', label: 'Pulse (beats/min)', numeric: true },
  ],
  6: [
    { key: 'hemoglobin', label: 'Hemoglobin result', numeric: true },
    { key: 'bloodGroup', label: 'Blood group' },
    { key: 'hiv', label: 'HIV test status' },
    { key: 'syphilis', label: 'Syphilis test status' },
    { key: 'urineProtein', label: 'Urine protein result' },
    { key: 'otherTests', label: 'Other tests / EMR reference', multiline: true },
  ],
  7: [
    { key: 'riskFactors', label: 'Risk factors identified', multiline: true },
    { key: 'missingAssessments', label: 'Missing tests or assessments', multiline: true },
    { key: 'followUp', label: 'Follow-up needed', multiline: true },
  ],
};

export default function RegistrationScreen() {
  const { patients, addPatient } = useClinic();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PatientDraft>(initialDraft);
  const [search, setSearch] = useState('');
  const [clinicianReviewed, setClinicianReviewed] = useState(false);

  const duplicates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.phone.replace(/\s/g, '').includes(query.replace(/\s/g, '')),
    );
  }, [patients, search]);

  const completenessItems = [
    { label: 'Patient identity and contact', complete: Boolean(draft.name.trim() && draft.phone.trim()) },
    {
      label: 'Personal information and consent',
      complete: Boolean(
        isValidDate(draft.dateOfBirth) &&
          draft.preferredLanguage.trim() &&
          draft.facility.trim() &&
          draft.consent,
      ),
    },
    {
      label: 'Pregnancy confirmation',
      complete: Boolean(
        draft.confirmationMethod &&
          isValidDate(draft.confirmationDate) &&
          draft.clinicianName.trim() &&
          draft.pregnancyResult === 'Confirmed',
      ),
    },
    { label: 'Obstetric history', complete: Boolean(draft.gravida.trim() && draft.para.trim() && draft.previousPregnancies.trim() && draft.complications.trim()) },
    { label: 'Medical history', complete: Boolean(draft.conditions.trim() && draft.medications.trim() && draft.allergies.trim()) },
    {
      label: 'Clinical measurements',
      complete: Boolean(
        isPositiveNumber(draft.systolic) &&
          isPositiveNumber(draft.diastolic) &&
          isPositiveNumber(draft.weightKg) &&
          isPositiveNumber(draft.temperatureC) &&
          isPositiveNumber(draft.pulse),
      ),
    },
    { label: 'Laboratory investigations', complete: Boolean(draft.hemoglobin.trim() && draft.bloodGroup.trim() && draft.hiv.trim() && draft.syphilis.trim() && draft.urineProtein.trim() && draft.otherTests.trim()) },
    { label: 'Assessment and follow-up', complete: Boolean(draft.riskFactors.trim() && draft.missingAssessments.trim() && draft.followUp.trim()) },
    { label: 'Initial care plan', complete: Boolean(draft.carePlan.trim()) },
  ];
  const approvalItems = completenessItems;
  const missingItems = approvalItems.filter((item) => !item.complete);
  const missingSections = completenessItems.filter((item) => !item.complete);
  const completeness = Math.round(
    ((completenessItems.length - missingSections.length) / completenessItems.length) * 100,
  );

  const setField = (key: DraftKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const continueStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const approveRegistration = () => {
    if (missingItems.length || !clinicianReviewed) return;
    const normalizedPhone = draft.phone.replace(/\s/g, '');
    const duplicate = patients.find(
      (patient) =>
        patient.phone.replace(/\s/g, '') === normalizedPhone ||
        patient.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
    );
    if (duplicate) {
      Alert.alert(
        'Possible duplicate profile',
        `${duplicate.name} (${duplicate.id}) already matches this information. Open the existing record instead of creating another.`,
        [{ text: 'Open record', onPress: () => router.push({ pathname: '/doctor/patient/[id]', params: { id: duplicate.id } }) }, { text: 'Cancel', style: 'cancel' }],
      );
      return;
    }

    const patient = addPatient({ ...draft, clinicianApproved: true });
    Alert.alert('Registration approved', `${patient.name} was added to this session's patient list.`);
    router.replace('/doctor/patients');
  };

  return (
    <Page>
      <PageHeader
        eyebrow="FIRST VISIT · NEW MATERNAL PROFILE"
        title="Patient registration"
        subtitle="Complete the clinical intake with the patient and authorized care team."
      />

      <Card style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <Text style={styles.progressLabel}>STEP {step + 1} OF {steps.length}</Text>
          <Text style={styles.progressPercent}>{completeness}% complete</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
        </View>
        <View>
          <Text style={styles.stepTitle}>{steps[step].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[step].subtitle}</Text>
        </View>
        <View style={styles.stepMarkers}>
          {steps.map((item, index) => (
            <View
              key={item.title}
              accessibilityLabel={`Step ${index + 1}: ${item.title}${index === step ? ', current' : ''}`}
              style={[styles.marker, index <= step && styles.markerActive]}
            />
          ))}
        </View>
      </Card>

      {step === 0 ? (
        <Card>
          <SectionHeading title="Search before registering" />
          <Field
            label="Search existing profile"
            value={search}
            onChangeText={setSearch}
            placeholder="Name, M-CARE ID, or phone"
            returnKeyType="search"
          />
          {duplicates.map((patient) => (
            <Pressable
              key={patient.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/doctor/patient/[id]', params: { id: patient.id } })}
              style={({ pressed }) => [styles.duplicateResult, pressed && styles.pressed]}>
              <View style={styles.duplicateIcon}>
                <Ionicons name="person-outline" size={18} color={UI.accentDark} />
              </View>
              <View style={styles.duplicateCopy}>
                <Text style={styles.duplicateName}>{patient.name}</Text>
                <Text style={styles.fieldHint}>{patient.id} · {patient.phone}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={UI.muted} />
            </Pressable>
          ))}
          {search.trim() && duplicates.length === 0 ? (
            <Text style={styles.fieldHint}>
              No matching local demo record. Confirm with the facility before creating a new profile.
            </Text>
          ) : null}
          <View style={styles.divider} />
          <SectionHeading title="New patient details" />
          {fieldsByStep[0].map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              onChangeText={(value) => setField(field.key, value)}
              keyboardType={field.numeric ? 'numeric' : 'default'}
              autoCapitalize={field.key === 'phone' ? 'none' : 'words'}
            />
          ))}
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <SectionHeading title="Personal information" />
          {fieldsByStep[1].map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              onChangeText={(value) => setField(field.key, value)}
            />
          ))}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.consent }}
            onPress={() => setDraft((current) => ({ ...current, consent: !current.consent }))}
            style={styles.consentRow}>
            <View style={[styles.checkbox, draft.consent && styles.checkboxChecked]}>
              {draft.consent ? <Ionicons name="checkmark" size={15} color={UI.white} /> : null}
            </View>
            <View style={styles.consentCopy}>
              <Text style={styles.consentTitle}>Consent recorded</Text>
              <Text style={styles.fieldHint}>
                The woman has been informed about this record and authorized sharing.
              </Text>
            </View>
          </Pressable>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <SectionHeading title="Pregnancy confirmation" />
          <Text style={styles.fieldLabel}>Confirmation method</Text>
          <ChoiceGroup
            options={['Pregnancy test', 'Ultrasound', 'Clinical assessment']}
            value={draft.confirmationMethod}
            onSelect={(value) => setField('confirmationMethod', value)}
          />
          <Text style={styles.fieldLabel}>Result</Text>
          <ChoiceGroup
            options={['Confirmed', 'Not confirmed', 'Pending']}
            value={draft.pregnancyResult}
            onSelect={(value) => setField('pregnancyResult', value)}
          />
          {fieldsByStep[2].map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              onChangeText={(value) => setField(field.key, value)}
            />
          ))}
          {draft.pregnancyResult !== 'Confirmed' ? (
            <View style={styles.caution}>
              <Ionicons name="alert-circle-outline" size={18} color={UI.amber} />
              <Text style={styles.cautionText}>
                A pregnancy episode should only be activated after an authorized clinician confirms pregnancy.
              </Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      {step >= 3 && step <= 7 ? (
        <Card>
          <SectionHeading title={steps[step].title} />
          {step === 3 ? (
            <Text style={styles.fieldHint}>Document only history shared by the patient or available in an authorized record.</Text>
          ) : null}
          {step === 6 ? (
            <Text style={styles.fieldHint}>Use result values or statuses supplied by the performing laboratory or EMR.</Text>
          ) : null}
          {fieldsByStep[step].map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              onChangeText={(value) => setField(field.key, value)}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 3 : 1}
              keyboardType={field.numeric ? 'decimal-pad' : 'default'}
            />
          ))}
          {step === 7 ? (
            <View style={styles.completenessBox}>
              <View style={styles.completenessHeader}>
                <Ionicons name="clipboard-outline" size={20} color={UI.accentDark} />
                <Text style={styles.completenessTitle}>Registration completeness · {completeness}%</Text>
              </View>
              {completenessItems.map((item) => (
                <View key={item.label} style={styles.checkRow}>
                  <Ionicons
                    name={item.complete ? 'checkmark-circle' : 'ellipse-outline'}
                    size={17}
                    color={item.complete ? UI.green : UI.muted}
                  />
                  <Text style={[styles.checkText, item.complete && styles.checkComplete]}>{item.label}</Text>
                </View>
              ))}
              {missingSections.length ? (
                <Text style={styles.followUpHint}>
                  Still to document: {missingSections.map((item) => item.label).join('; ')}.
                </Text>
              ) : null}
              {draft.missingAssessments.trim() ? (
                <Text style={styles.followUpHint}>
                  Outstanding item: {draft.missingAssessments}. Include a follow-up plan above.
                </Text>
              ) : null}
            </View>
          ) : null}
        </Card>
      ) : null}

      {step === 8 ? (
        <Card>
          <SectionHeading title="Review and approve" />
          <Text style={styles.fieldHint}>
            Check the details with the patient and confirm that you are authorized to approve this plan.
          </Text>
          <Field
            label="Initial care and follow-up plan"
            value={draft.carePlan}
            onChangeText={(value) => setField('carePlan', value)}
            multiline
            numberOfLines={3}
          />
          <View style={styles.summary}>
            <SummaryLine label="Patient" value={draft.name || 'Not recorded'} />
            <SummaryLine label="Phone" value={draft.phone || 'Not recorded'} />
            <SummaryLine label="Consent" value={draft.consent ? 'Recorded' : 'Missing'} />
            <SummaryLine label="Pregnancy" value={`${draft.pregnancyResult}${draft.confirmationMethod ? ` · ${draft.confirmationMethod}` : ''}`} />
            <SummaryLine label="Blood pressure" value={draft.systolic && draft.diastolic ? `${draft.systolic}/${draft.diastolic} mmHg` : 'Not recorded'} />
            <SummaryLine label="Laboratory tests" value={draft.missingAssessments || 'No outstanding items recorded'} />
            <SummaryLine label="Care plan" value={draft.carePlan || 'Not recorded'} />
          </View>
          {missingItems.length ? (
            <View style={styles.caution}>
              <Ionicons name="alert-circle-outline" size={18} color={UI.amber} />
              <Text style={styles.cautionText}>
                Complete these required items before approval: {missingItems.map((item) => item.label).join('; ')}.
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: clinicianReviewed }}
            onPress={() => setClinicianReviewed((current) => !current)}
            style={styles.consentRow}>
            <View style={[styles.checkbox, clinicianReviewed && styles.checkboxChecked]}>
              {clinicianReviewed ? <Ionicons name="checkmark" size={15} color={UI.white} /> : null}
            </View>
            <View style={styles.consentCopy}>
              <Text style={styles.consentTitle}>I reviewed and approve this initial care plan</Text>
              <Text style={styles.fieldHint}>Approval is recorded under the clinician account currently signed in.</Text>
            </View>
          </Pressable>
          <PrimaryButton
            label="Approve and complete registration"
            icon="checkmark-circle-outline"
            onPress={approveRegistration}
            disabled={missingItems.length > 0 || !clinicianReviewed}
          />
          <Text style={styles.approvalNote}>
            This prototype stores records in session memory only. Do not enter real patient details.
          </Text>
        </Card>
      ) : null}

      <View style={styles.navigation}>
        {step > 0 ? <SecondaryButton label="Previous" onPress={previousStep} /> : <View style={styles.buttonSpacer} />}
        {step < steps.length - 1 ? (
          <View style={styles.nextButton}>
            <PrimaryButton label="Continue" icon="arrow-forward" onPress={continueStep} />
          </View>
        ) : null}
      </View>
    </Page>
  );
}

function ChoiceGroup({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.choices}>
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === option }}
          onPress={() => onSelect(option)}
          style={[styles.choice, value === option && styles.choiceSelected]}>
          <Text style={[styles.choiceText, value === option && styles.choiceTextSelected]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  return (
    date.getFullYear() === Number(yearText) &&
    date.getMonth() === Number(monthText) - 1 &&
    date.getDate() === Number(dayText)
  );
}

function isPositiveNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0;
}

const styles = StyleSheet.create({
  progressCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: UI.accentDark, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  progressPercent: { color: UI.ink, fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: '#E4D3EE', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: UI.accent, borderRadius: 5 },
  stepTitle: { color: UI.ink, fontSize: 18, fontWeight: '800' },
  stepSubtitle: { color: UI.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  stepMarkers: { flexDirection: 'row', gap: 4 },
  marker: { flex: 1, height: 4, borderRadius: 3, backgroundColor: '#E7E1E9' },
  markerActive: { backgroundColor: UI.accent },
  duplicateResult: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  duplicateIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duplicateCopy: { flex: 1 },
  duplicateName: { color: UI.ink, fontWeight: '800', fontSize: 13 },
  fieldHint: { color: UI.muted, fontSize: 11, lineHeight: 17 },
  divider: { height: 1, backgroundColor: UI.border },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingTop: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C9B9D2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.white,
  },
  checkboxChecked: { backgroundColor: UI.accentDark, borderColor: UI.accentDark },
  consentCopy: { flex: 1, gap: 4 },
  consentTitle: { color: UI.ink, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  fieldLabel: { color: '#514B55', fontSize: 12, fontWeight: '700' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: UI.border },
  choiceSelected: { backgroundColor: UI.lavender, borderColor: '#D5B6E9' },
  choiceText: { color: UI.muted, fontSize: 12, fontWeight: '700' },
  choiceTextSelected: { color: UI.accentDark },
  caution: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 13, backgroundColor: UI.amberLight },
  cautionText: { flex: 1, color: UI.amber, fontSize: 11, lineHeight: 17 },
  completenessBox: { padding: 14, gap: 10, borderRadius: 15, backgroundColor: '#FAF6FC' },
  completenessHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completenessTitle: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { color: UI.muted, fontSize: 11, flex: 1 },
  checkComplete: { color: UI.green },
  followUpHint: { color: UI.amber, fontSize: 11, lineHeight: 17 },
  summary: { paddingVertical: 3, gap: 10 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  summaryLabel: { color: UI.muted, fontSize: 12, width: '36%' },
  summaryValue: { flex: 1, color: UI.ink, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  approvalNote: { color: UI.muted, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  buttonSpacer: { flex: 1 },
  nextButton: { width: '56%', maxWidth: 240 },
  pressed: { opacity: 0.78 },
});
