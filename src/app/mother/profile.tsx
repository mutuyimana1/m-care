import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, InfoLine, Page, PageHeader, StatusPill, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';

export default function MotherProfileScreen() {
  const { user } = useAuth();

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
          <StatusPill label="Verified" />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Pregnancy profile</Text>
        <InfoLine label="Pregnancy status" value="Confirmed" />
        <InfoLine label="M-CARE ID" value="MC-24018" />
        <InfoLine label="Estimated stage" value="Week 21" />
        <InfoLine label="Preferred facility" value="Kigali Health Centre" />
        <InfoLine label="Preferred language" value="Kinyarwanda" />
        <InfoLine label="Consent to care record" value="Granted in demo" />
      </Card>

      <View style={styles.notice}>
        <Ionicons name="shield-checkmark-outline" size={19} color={UI.green} />
        <Text style={styles.noticeText}>
          Your real health information should only be shared with your permission and through
          authorized care teams.
        </Text>
      </View>

      <Text style={styles.footer}>
        This sample profile is not connected to a health facility or a secure medical record.
      </Text>
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
