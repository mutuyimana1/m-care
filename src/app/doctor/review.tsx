import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Page, PageHeader, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';

export default function FollowUpScreen() {
  const { patients } = useClinic();
  const followUps = patients.filter((patient) => patient.missingAssessments.trim());

  return (
    <Page>
      <PageHeader
        eyebrow="CLINICAL FOLLOW-UP"
        title="Review & follow-up"
        subtitle="Track outstanding investigations and the care plan documented for each profile."
      />

      <Card style={styles.infoCard}>
        <View style={styles.infoHeading}>
          <Ionicons name="shield-checkmark-outline" size={22} color={UI.green} />
          <Text style={styles.infoTitle}>Clinical oversight matters</Text>
        </View>
        <Text style={styles.infoCopy}>
          Review significant findings in context, document follow-up, and confirm any care plan
          with the responsible authorized professional.
        </Text>
      </Card>

      <SectionHeading title="Outstanding items" action={`${followUps.length} profile${followUps.length === 1 ? '' : 's'}`} />
      {followUps.length === 0 ? (
        <Card>
          <Text style={styles.itemTitle}>No outstanding items</Text>
          <Text style={styles.copy}>New review tasks will appear here after registration.</Text>
        </Card>
      ) : (
        followUps.map((patient) => (
          <Pressable
            key={patient.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/doctor/patient/[id]', params: { id: patient.id } })}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <Card>
              <View style={styles.patientHeader}>
                <View style={styles.itemIcon}>
                  <Ionicons name="flask-outline" size={20} color={UI.amber} />
                </View>
                <View style={styles.patientCopy}>
                  <Text style={styles.itemTitle}>{patient.name}</Text>
                  <Text style={styles.copy}>{patient.id} · {patient.facility}</Text>
                </View>
                <StatusPill label="Follow-up" tone="amber" />
              </View>
              <Text style={styles.followUpText}>{patient.missingAssessments}</Text>
              <View style={styles.carePlan}>
                <Text style={styles.carePlanLabel}>Documented next step</Text>
                <Text style={styles.copy}>{patient.followUp || patient.carePlan}</Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}

      <View style={styles.footnote}>
        <Ionicons name="information-circle-outline" size={17} color={UI.accentDark} />
        <Text style={styles.copy}>
          This list is a session-only demo and is not a clinical task queue.
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  infoCard: { backgroundColor: '#F0F7F3', borderColor: '#DDEDE4' },
  infoHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoTitle: { color: UI.ink, fontWeight: '800', fontSize: 15 },
  infoCopy: { color: UI.muted, fontSize: 12, lineHeight: 19 },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: UI.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCopy: { flex: 1, gap: 3 },
  itemTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  followUpText: { color: UI.amber, fontSize: 12, fontWeight: '700' },
  carePlan: { paddingTop: 10, borderTopWidth: 1, borderTopColor: UI.border, gap: 5 },
  carePlanLabel: { color: UI.ink, fontSize: 11, fontWeight: '800' },
  footnote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  pressed: { opacity: 0.78 },
});
