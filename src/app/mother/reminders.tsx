import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import {
  Card,
  EmergencySOSBanner,
  InfoLine,
  Page,
  PageHeader,
  SectionHeading,
  UI,
} from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { useLanguage } from '@/contexts/language-context';

export default function MotherRemindersScreen() {
  const { user } = useAuth();
  const { patients } = useClinic();
  const { t } = useLanguage();

  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );

  const tests = patient?.missingAssessments
    ? patient.missingAssessments.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
    : [];

  return (
    <Page>
      <PageHeader
        eyebrow={t('FOLLOW-UP')}
        title={t('Reminders & next steps')}
        subtitle={t('Keep track of appointments, tests, and the plan agreed with your care team.')}
        onBack={() => router.replace('/mother')}
        backLabel={t('Back')}
      />

      {/* Visual Appointment Ticket */}
      <Card style={styles.cardTone}>
        <View style={styles.headerLine}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={styles.calIcon}>
              <Ionicons name="calendar" size={24} color={UI.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('Next appointment')}</Text>
              <Text style={styles.facilitySubtitle}>{patient?.facility || 'Kacyiru Health Center'}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.strongValue}>
          {patient?.nextAppointmentDate || t('Ask your health facility to confirm your next appointment.')}
        </Text>
      </Card>

      {/* Visual Daily Medication / Vitamin Cards */}
      <SectionHeading title={t('Daily vitamins & medicine')} />
      <View style={styles.vitaminsRow}>
        <View style={styles.vitaminCard}>
          <View style={[styles.vitaminIcon, { backgroundColor: '#FFF9C4' }]}>
            <Ionicons name="sunny" size={22} color="#F57F17" />
          </View>
          <Text style={styles.vitaminTime}>{t('Morning')}</Text>
          <Text style={styles.vitaminName}>Iron & Folic Acid</Text>
          <Text style={styles.vitaminNote}>1 pill with safe water</Text>
        </View>

        <View style={styles.vitaminCard}>
          <View style={[styles.vitaminIcon, { backgroundColor: '#E1BEE7' }]}>
            <Ionicons name="moon" size={20} color="#7B1FA2" />
          </View>
          <Text style={styles.vitaminTime}>{t('Evening')}</Text>
          <Text style={styles.vitaminName}>Water & Rest</Text>
          <Text style={styles.vitaminNote}>Drink water and rest</Text>
        </View>
      </View>

      <SectionHeading title={t('Care plan')} />
      <Card>
        <InfoLine label={t('Appointment')} value={patient?.nextAppointmentDate || t('Not recorded')} />
        <InfoLine label={t('Facility')} value={patient?.facility || t('Not recorded')} />
        <InfoLine label={t('Clinician')} value={patient?.clinicianName || t('Not recorded')} />
        <InfoLine label={t('Care plan')} value={patient?.carePlan || t('No clinician plan recorded yet.')} />
      </Card>

      {tests.length ? (
        <>
          <SectionHeading title={t('Tests and checks')} />
          <Card>
            {tests.map((item) => (
              <View key={item} style={styles.checkRow}>
                <Ionicons name="time-outline" size={19} color={UI.amber} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {/* Emergency SOS Banner */}
      <EmergencySOSBanner
        phoneNumber="114"
        chwPhone={patient?.phone || undefined}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  cardTone: { backgroundColor: '#F3E8FC', borderColor: '#E7D5FB', padding: 18, gap: 10 },
  headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: UI.white, alignItems: 'center', justifyContent: 'center' },
  title: { color: UI.ink, fontSize: 16, fontWeight: '700' },
  facilitySubtitle: { color: UI.muted, fontSize: 12, marginTop: 2 },
  strongValue: { color: UI.accentDark, fontSize: 19, fontWeight: '800' },
  vitaminsRow: { flexDirection: 'row', gap: 12 },
  vitaminCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
    gap: 4,
  },
  vitaminIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  vitaminTime: { color: UI.ink, fontSize: 13, fontWeight: '800' },
  vitaminName: { color: UI.ink, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  vitaminNote: { color: UI.muted, fontSize: 11, textAlign: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkText: { flex: 1, color: UI.ink, fontSize: 13, lineHeight: 19 },
});
