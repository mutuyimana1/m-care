import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, Field, Page, PageHeader, PrimaryButton, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic, type SymptomReportInput } from '@/contexts/clinic-context';
import { getMaternalSymptomCode } from '@/utils/maternal-symptom-codes';

const symptoms = [
  'Vaginal or heavy bleeding',
  'Severe abdominal pain',
  'Trouble breathing',
  'Severe headache or vision changes',
  'Convulsions',
  'Fever',
  'Reduced or no baby movement',
  'Other concern',
];

const urgentSymptoms = new Set([
  'Vaginal or heavy bleeding',
  'Severe abdominal pain',
  'Trouble breathing',
  'Severe headache or vision changes',
  'Convulsions',
  'Fever',
  'Reduced or no baby movement',
]);

const onsetOptions = ['Today', 'Yesterday', 'More than two days ago'] as const;
const severityOptions = ['Mild', 'Moderate', 'Severe'] as const;
const patternOptions = ['Constant', 'Comes and goes'] as const;
const worseningOptions = ['Yes', 'No', 'Not sure'] as const;
const yesNoOptions = ['Yes', 'No'] as const;

export default function MotherSymptomsScreen() {
  const { user } = useAuth();
  const { patients, submitSymptomReport, voiceNotes } = useClinic();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [onset, setOnset] = useState<(typeof onsetOptions)[number] | ''>('');
  const [severity, setSeverity] = useState<SymptomReportInput['severity'] | ''>('');
  const [pattern, setPattern] = useState<SymptomReportInput['pattern'] | ''>('');
  const [worsening, setWorsening] = useState<SymptomReportInput['worsening'] | ''>('');
  const [contactedChw, setContactedChw] = useState<'Yes' | 'No' | ''>('');
  const [visitedFacility, setVisitedFacility] = useState<'Yes' | 'No' | ''>('');
  const [temperatureReading, setTemperatureReading] = useState('');
  const [bloodPressureReading, setBloodPressureReading] = useState('');
  const [attachVoiceNote, setAttachVoiceNote] = useState(false);
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const voiceNoteUri = patient ? voiceNotes[patient.id] : undefined;
  const urgent = severity === 'Severe' || selected.some((item) => urgentSymptoms.has(item));

  const toggleSymptom = (symptom: string) => {
    setSelected((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
    );
    setSubmitted(false);
    setReferenceId('');
  };

  const submit = () => {
    if (
      !patient ||
      selected.length === 0 ||
      !onset ||
      !severity ||
      !pattern ||
      !worsening ||
      !contactedChw ||
      !visitedFacility
    ) return;
    const reportId = submitSymptomReport(patient.id, {
      symptoms: selected,
      notes: notes.trim(),
      onset,
      severity,
      pattern,
      worsening,
      contactedChw: contactedChw === 'Yes',
      visitedFacility: visitedFacility === 'Yes',
      temperatureReading: temperatureReading.trim(),
      bloodPressureReading: bloodPressureReading.trim(),
      voiceRecordingUri: attachVoiceNote ? voiceNoteUri : undefined,
      voiceTranscriptAuthorized: attachVoiceNote,
    });
    setReferenceId(reportId);
    setSubmitted(true);
  };

  const canSubmit = Boolean(
    selected.length &&
      onset &&
      severity &&
      pattern &&
      worsening &&
      contactedChw &&
      visitedFacility,
  );

  return (
    <Page>
      <PageHeader
        eyebrow="CHECK IN"
        title="Share a symptom"
        subtitle="Tell your care team how you are feeling. This is not an emergency service."
        onBack={() => router.back()}
        backLabel="Back to care"
      />

      {urgent ? (
        <Card style={styles.urgentCard}>
          <View style={styles.alertHeading}>
            <Ionicons name="warning-outline" size={21} color={UI.red} />
            <Text style={styles.alertTitle}>Please seek urgent care now</Text>
          </View>
          <Text style={styles.alertText}>
            Seek urgent medical assessment now. Contact your health facility or emergency service; do not wait for a reply in this app.
          </Text>
        </Card>
      ) : null}

      {!patient ? (
        <Card>
          <Text style={styles.copy}>An approved, consented maternal record is not linked to this account, so this report cannot be submitted.</Text>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.sectionTitle}>What are you experiencing?</Text>
            <Text style={styles.copy}>Select all that apply. If you feel seriously unwell, seek care now.</Text>
            <View style={styles.options}>
              {symptoms.map((symptom) => {
                const checked = selected.includes(symptom);
                return (
                  <Pressable
                    key={symptom}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    onPress={() => toggleSymptom(symptom)}
                    style={styles.option}>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked ? <Ionicons name="checkmark" size={15} color={UI.white} /> : null}
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionText}>{symptom}</Text>
                      <Text style={styles.optionCode}>
                        {getMaternalSymptomCode(symptom).code} · {getMaternalSymptomCode(symptom).source}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <ChoiceQuestion
              label="When did this start?"
              options={onsetOptions}
              value={onset}
              onChange={(value) => {
                setOnset(value);
                setSubmitted(false);
              }}
            />
            <ChoiceQuestion
              label="How severe is it?"
              options={severityOptions}
              value={severity}
              onChange={(value) => {
                setSeverity(value);
                setSubmitted(false);
              }}
            />
            <ChoiceQuestion
              label="Does it come and go or stay constant?"
              options={patternOptions}
              value={pattern}
              onChange={(value) => {
                setPattern(value);
                setSubmitted(false);
              }}
            />
            <ChoiceQuestion
              label="Is it getting worse?"
              options={worseningOptions}
              value={worsening}
              onChange={(value) => {
                setWorsening(value);
                setSubmitted(false);
              }}
            />
            <ChoiceQuestion
              label="Have you contacted a CHW?"
              options={yesNoOptions}
              value={contactedChw}
              onChange={(value) => {
                setContactedChw(value);
                setSubmitted(false);
              }}
            />
            <ChoiceQuestion
              label="Have you visited a health facility?"
              options={yesNoOptions}
              value={visitedFacility}
              onChange={(value) => {
                setVisitedFacility(value);
                setSubmitted(false);
              }}
            />
            <Field
              label="Temperature, if known (°C)"
              value={temperatureReading}
              onChangeText={(value) => {
                setTemperatureReading(value);
                setSubmitted(false);
              }}
              keyboardType="decimal-pad"
            />
            <Field
              label="Blood pressure, if known"
              value={bloodPressureReading}
              onChangeText={(value) => {
                setBloodPressureReading(value);
                setSubmitted(false);
              }}
              placeholder="For example, 120/80"
            />
            <Field
              label="Anything else you would like your care team to know"
              value={notes}
              onChangeText={(value) => {
                setNotes(value);
                setSubmitted(false);
              }}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            {voiceNoteUri ? (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: attachVoiceNote }}
                onPress={() => {
                  setAttachVoiceNote((current) => !current);
                  setSubmitted(false);
                }}
                style={styles.voiceConsent}>
                <View style={[styles.checkbox, attachVoiceNote && styles.checkboxChecked]}>
                  {attachVoiceNote ? <Ionicons name="checkmark" size={15} color={UI.white} /> : null}
                </View>
                <View style={styles.voiceConsentCopy}>
                  <Text style={styles.optionText}>Share my saved voice note with the assigned care team</Text>
                  <Text style={styles.copy}>Sharing is optional. Only attach it if you authorize CHW and facility review.</Text>
                </View>
              </Pressable>
            ) : null}
            <PrimaryButton label="Submit check-in" onPress={submit} disabled={!canSubmit} />
            {submitted ? (
              <Text style={styles.success}>
                Report {referenceId} saved for care-team review. This prototype does not provide real-time triage.
              </Text>
            ) : null}
          </Card>
          <Text style={styles.note}>
            Reports are kept in session memory only and are not monitored in real time. This prototype does not apply clinical triage rules. Do not enter real health information.
          </Text>
        </>
      )}

    </Page>
  );
}

function ChoiceQuestion<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | '';
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.question}>
      <Text style={styles.questionLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option }}
            onPress={() => onChange(option)}
            style={[styles.choice, value === option && styles.choiceSelected]}>
            <Text style={[styles.choiceText, value === option && styles.choiceTextSelected]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  urgentCard: { backgroundColor: '#FFF0F0', borderColor: '#F1D2D5', gap: 8 },
  alertHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { color: UI.red, fontSize: 14, fontWeight: '800' },
  alertText: { color: UI.red, fontSize: 12, lineHeight: 18 },
  sectionTitle: { color: UI.ink, fontSize: 15, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  options: { gap: 3 },
  question: { gap: 7 },
  questionLabel: { color: UI.ink, fontSize: 12, fontWeight: '700' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#F1EDF4' },
  choiceSelected: { backgroundColor: UI.accentDark },
  choiceText: { color: UI.muted, fontSize: 11, fontWeight: '700' },
  choiceTextSelected: { color: UI.white },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: '#C9B9D2', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: UI.accentDark, borderColor: UI.accentDark },
  optionText: { flex: 1, color: UI.ink, fontSize: 13 },
  optionCopy: { flex: 1, gap: 2 },
  optionCode: { color: UI.muted, fontSize: 10, fontWeight: '700' },
  voiceConsent: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  voiceConsentCopy: { flex: 1, gap: 3 },
  success: { color: UI.green, fontSize: 12, fontWeight: '700' },
  note: { color: UI.muted, fontSize: 10, lineHeight: 16 },
});
