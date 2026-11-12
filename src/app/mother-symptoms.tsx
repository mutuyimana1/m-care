import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Page, PageHeader, PrimaryButton, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

const symptoms = [
  'Heavy bleeding',
  'Severe pain',
  'Trouble breathing',
  'Severe headache or vision changes',
  'Convulsions',
  'Fever',
  'Reduced or no baby movement',
  'Other concern',
];

const urgentSymptoms = new Set([
  'Heavy bleeding',
  'Severe pain',
  'Trouble breathing',
  'Severe headache or vision changes',
  'Convulsions',
  'Fever',
  'Reduced or no baby movement',
]);

export default function MotherSymptomsScreen() {
  const { user } = useAuth();
  const { patients, submitSymptomReport } = useClinic();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const urgent = selected.some((item) => urgentSymptoms.has(item));

  const toggleSymptom = (symptom: string) => {
    setSelected((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
    );
    setSubmitted(false);
  };

  const submit = () => {
    if (!patient || selected.length === 0) return;
    submitSymptomReport(patient.id, selected, notes.trim());
    setSubmitted(true);
  };

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
            Contact your local health facility or emergency service now. Do not wait for a reply in this app.
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
                    <Text style={styles.optionText}>{symptom}</Text>
                  </Pressable>
                );
              })}
            </View>
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
            <PrimaryButton label="Submit check-in" onPress={submit} disabled={!selected.length} />
            {submitted ? (
              <Text style={styles.success}>Your check-in was added to the care-team review list.</Text>
            ) : null}
          </Card>
          <Text style={styles.note}>
            Reports are kept in session memory only and are not monitored in real time. Do not enter real health information in this prototype.
          </Text>
        </>
      )}

    </Page>
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
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: '#C9B9D2', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: UI.accentDark, borderColor: UI.accentDark },
  optionText: { flex: 1, color: UI.ink, fontSize: 13 },
  success: { color: UI.green, fontSize: 12, fontWeight: '700' },
  note: { color: UI.muted, fontSize: 10, lineHeight: 16 },
});
