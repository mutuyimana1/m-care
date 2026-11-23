import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import {
  Card,
  Field,
  Page,
  PageHeader,
  PictorialSymptomTile,
  PrimaryButton,
  UI,
} from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { useLanguage } from '@/contexts/language-context';

type SymptomItem = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  urgent: boolean;
};

const SYMPTOMS_LIST: SymptomItem[] = [
  { name: 'Vaginal or heavy bleeding', icon: 'water', urgent: true },
  { name: 'Severe abdominal pain', icon: 'flash', urgent: true },
  { name: 'Fever', icon: 'thermometer', urgent: true },
  { name: 'Reduced or no baby movement', icon: 'body', urgent: true },
  { name: 'Severe headache or vision changes', icon: 'alert-circle', urgent: true },
  { name: 'Trouble breathing', icon: 'fitness', urgent: true },
  { name: 'Convulsions', icon: 'pulse', urgent: true },
  { name: 'Other concern', icon: 'help-circle', urgent: false },
];

export default function MotherSymptomsScreen() {
  const { user } = useAuth();
  const { patients, submitSymptomReport } = useClinic();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [onset, setOnset] = useState<'Today' | 'Yesterday' | 'More than two days ago'>('Today');

  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const hasUrgent = selected.some(
    (item) => SYMPTOMS_LIST.find((s) => s.name === item)?.urgent,
  );

  const toggleSymptom = (symptom: string) => {
    setSelected((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom],
    );
    setSubmitted(false);
    setReferenceId('');
  };

  const callNumber = async (number: string) => {
    try {
      const url = `tel:${number}`;
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('Call unavailable'), t('Please contact your nearest health facility directly.'));
      }
    } catch {
      Alert.alert(t('Call unavailable'), t('Please contact your nearest health facility directly.'));
    }
  };

  const submit = () => {
    if (!patient || selected.length === 0) return;
    const reportId = submitSymptomReport(patient.id, {
      symptoms: selected,
      notes: notes.trim(),
      onset,
      severity: hasUrgent ? 'Severe' : 'Moderate',
      pattern: 'Constant',
      worsening: 'Yes',
      contactedChw: false,
      visitedFacility: false,
      temperatureReading: '',
      bloodPressureReading: '',
    });
    setReferenceId(reportId);
    setSubmitted(true);
  };

  return (
    <Page>
      <PageHeader
        eyebrow={t('Quick support')}
        title={t('Share a symptom')}
        subtitle={t('Select what you feel')}
        onBack={() => router.back()}
        backLabel={t('Back')}
      />

      {/* Emergency Alert Card when any danger sign is selected */}
      {hasUrgent ? (
        <View style={styles.dangerAlertCard}>
          <View style={styles.dangerAlertHeader}>
            <View style={styles.dangerAlertIconWrap}>
              <Ionicons name="warning" size={26} color="#D32F2F" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.dangerAlertTitle}>{t('Danger Sign Detected')}</Text>
              <Text style={styles.dangerAlertSubtitle}>
                {t('Call 114 for emergency assistance. Do not wait for an app reply.')}
              </Text>
            </View>
          </View>
          <View style={styles.dangerAlertActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => callNumber('114')}
              style={({ pressed }) => [styles.dangerCallBtn, pressed && styles.pressed]}>
              <Ionicons name="call" size={19} color={UI.white} />
              <Text style={styles.dangerCallBtnText}>{t('Call 114')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => callNumber(patient?.phone || '0788123456')}
              style={({ pressed }) => [styles.chwCallBtn, pressed && styles.pressed]}>
              <Ionicons name="person" size={19} color="#D32F2F" />
              <Text style={styles.chwCallBtnText}>{t('Call Health Worker')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!patient ? (
        <Card>
          <Text style={styles.copy}>
            {t('No approved, consented maternal record is linked to this account.')}
          </Text>
        </Card>
      ) : (
        <>
          {/* Pictorial Symptom Grid */}
          <Card style={{ gap: 14 }}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{t('Select what you feel')}</Text>
                <Text style={styles.copy}>{t('Tap to select any pain or discomfort')}</Text>
              </View>
            </View>

            <View style={styles.tilesGrid}>
              {SYMPTOMS_LIST.map((item) => (
                <PictorialSymptomTile
                  key={item.name}
                  icon={item.icon}
                  label={t(item.name)}
                  selected={selected.includes(item.name)}
                  urgent={item.urgent}
                  onToggle={() => toggleSymptom(item.name)}
                />
              ))}
            </View>
          </Card>

          {/* Quick Onset Selection (Non-blocking) */}
          <Card style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('When did this start?')}</Text>
            <View style={styles.timingRow}>
              {(['Today', 'Yesterday', 'More than two days ago'] as const).map((opt) => (
                <Pressable
                  key={opt}
                  accessibilityRole="button"
                  onPress={() => setOnset(opt)}
                  style={({ pressed }) => [
                    styles.timingPill,
                    onset === opt && styles.timingPillSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.timingPillText, onset === opt && styles.timingPillTextSelected]}>
                    {t(opt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Optional Note */}
          <Card style={{ gap: 10 }}>
            <Field
              label={t('Add a brief note')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('Type here...')}
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Submit Button */}
          <PrimaryButton
            label={t('Submit check-in')}
            onPress={submit}
            disabled={selected.length === 0}
            icon="send"
          />

          {submitted ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={32} color={UI.green} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.successTitle}>{t('Sent to your care team')}</Text>
                <Text style={styles.successText}>
                  {referenceId ? `${referenceId} · ` : ''}{t('Your health worker has been notified.')}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  dangerAlertCard: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFCDD2',
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  dangerAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dangerAlertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerAlertTitle: { color: '#B71C1C', fontSize: 16, fontWeight: '800' },
  dangerAlertSubtitle: { color: '#C62828', fontSize: 12, lineHeight: 17 },
  dangerAlertActions: { flexDirection: 'row', gap: 10 },
  dangerCallBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerCallBtnText: { color: UI.white, fontSize: 14, fontWeight: '800' },
  chwCallBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: UI.white,
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chwCallBtnText: { color: '#D32F2F', fontSize: 13, fontWeight: '700' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { color: UI.ink, fontSize: 16, fontWeight: '700' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 6 },
  timingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timingPill: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F3EDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timingPillSelected: { backgroundColor: UI.accentDark },
  timingPillText: { color: UI.ink, fontSize: 13, fontWeight: '600' },
  timingPillTextSelected: { color: UI.white, fontWeight: '700' },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: UI.greenLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  successTitle: { color: UI.green, fontSize: 15, fontWeight: '800' },
  successText: { color: UI.green, fontSize: 12, lineHeight: 16 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
