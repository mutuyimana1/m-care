import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, InfoLine, Page, PageHeader, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';

export default function MotherProfileScreen() {
  const { user } = useAuth();
  const { patients } = useClinic();
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const isPostpartum = patient?.postpartumStatus === 'postpartum';

  return (
    <Page>
      <PageHeader
        eyebrow="YOUR M-CARE PROFILE"
        title="My profile"
        subtitle="Your information can travel with you when authorized sharing is enabled."
      />

      <Card style={styles.profileCard}>
        <View style={styles.profileHeading}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={28} color={UI.accentDark} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user?.name ?? 'Aline Uwase'}</Text>
            <Text style={styles.muted}>Maternal member · M-CARE demo</Text>
          </View>
          <StatusPill label={patient ? 'Reviewed' : 'Not linked'} tone={patient ? 'green' : 'amber'} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{isPostpartum ? 'Postpartum profile' : 'Pregnancy profile'}</Text>
        {patient ? (
          <>
            <InfoLine label="Pregnancy status" value={isPostpartum ? 'Postpartum follow-up' : patient.pregnancyResult} />
            <InfoLine label="M-CARE ID" value={patient.id} />
            <InfoLine label="Estimated stage" value={patient.gestationalAgeWeeks ? `${patient.gestationalAgeWeeks} weeks ${patient.gestationalAgeDays || '0'} days` : 'Not recorded'} />
            <InfoLine label="Estimated due date" value={patient.estimatedDueDate} />
            {isPostpartum ? <InfoLine label="Delivery date" value={patient.deliveryDate} /> : null}
            <InfoLine label="Preferred facility" value={patient.facility} />
            <InfoLine label="Preferred language" value={patient.preferredLanguage} />
            <InfoLine label="Consent to care record" value="Granted" />
          </>
        ) : (
          <Text style={styles.muted}>
            No approved, consented maternal record is linked to this account. Ask your health facility to verify your identity and link your profile.
          </Text>
        )}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  profileHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: UI.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: { flex: 1, gap: 3 },
  name: { color: UI.ink, fontSize: 17, fontWeight: '800' },
  muted: { color: UI.muted, fontSize: 12 },
  sectionTitle: { color: UI.ink, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  notice: { flexDirection: 'row', gap: 9, padding: 14, borderRadius: 15, backgroundColor: UI.greenLight },
  noticeText: { flex: 1, color: UI.green, fontSize: 12, lineHeight: 18 },
  footer: { color: UI.muted, fontSize: 11, lineHeight: 17 },
});
