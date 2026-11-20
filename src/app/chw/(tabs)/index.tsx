import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, Page, PageHeader, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useChwRecords } from '@/hooks/use-chw-records';
import { isEmergencyMaternalReport } from '@/utils/maternal-symptom-codes';

export default function ChwMothersPage() {
  const { assignedPatients, alerts, user } = useChwRecords();

  return (
    <Page>
      <PageHeader
        eyebrow="M-CARE · COMMUNITY HEALTH WORKER"
        title="Your mothers"
        subtitle={`Assigned to ${user?.name ?? 'your CHW account'}`}
      />
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeading}>
          <View style={styles.summaryIcon}>
            <Ionicons name="people-outline" size={20} color={UI.accentDark} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Community care list</Text>
            <Text style={styles.summaryNote}>
              {assignedPatients.length} assigned mother{assignedPatients.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeading title="Mothers in your community" action={`${assignedPatients.length}`} />
      {assignedPatients.map((patient) => {
        const patientAlerts = alerts.filter(
          (report) => report.patientId === patient.id && report.status !== 'closed',
        );
        const hasEmergency = patientAlerts.some(isEmergencyMaternalReport);

        return (
          <Pressable
            key={patient.id}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${patient.name}${hasEmergency ? ', urgent alert' : ''}`}
            onPress={() => router.push({ pathname: '/chw/mother/[id]', params: { id: patient.id } })}
            style={({ pressed }) => pressed && styles.pressed}>
            <Card style={[styles.motherCard, hasEmergency && styles.emergencyCard]}>
              <View style={styles.motherHeading}>
                <View style={[styles.motherIcon, hasEmergency && styles.urgentIcon]}>
                  <Ionicons
                    name={hasEmergency ? 'alert-circle-outline' : 'person-outline'}
                    size={21}
                    color={hasEmergency ? UI.red : UI.accentDark}
                  />
                </View>
                <View style={styles.motherCopy}>
                  <Text style={styles.motherName}>{patient.name}</Text>
                  <Text style={styles.meta}>{patient.id} · {patient.village}, {patient.cell}</Text>
                </View>
                {hasEmergency ? <UrgentPill /> : <StatusPill label="Assigned" tone="lavender" />}
                <Ionicons name="chevron-forward" size={18} color={UI.muted} />
              </View>
              <View style={styles.motherMetaRow}>
                <Text style={styles.meta}>
                  {patient.postpartumStatus === 'postpartum'
                    ? 'Postpartum follow-up'
                    : `${patient.gestationalAgeWeeks} weeks · Due ${patient.estimatedDueDate}`}
                </Text>
                {patientAlerts.length ? (
                  <Text style={[styles.alertCount, hasEmergency && styles.alertCountUrgent]}>
                    {patientAlerts.length} open alert{patientAlerts.length === 1 ? '' : 's'}
                  </Text>
                ) : null}
              </View>
            </Card>
          </Pressable>
        );
      })}
      {assignedPatients.length === 0 ? (
        <Card style={styles.emptyState}>
          <Text style={styles.motherName}>No mothers assigned</Text>
          <Text style={styles.meta}>Mothers assigned to your CHW account will appear here.</Text>
        </Card>
      ) : null}
      <Text style={styles.footer}>
        Mother records are limited to consented profiles assigned to your CHW account and approved by a clinician.
      </Text>
    </Page>
  );
}

function UrgentPill() {
  return (
    <View style={styles.urgentPill}>
      <Text style={styles.urgentPillText}>Urgent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: '#F6ECFD', borderColor: '#EBDDFA' },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  summaryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.white },
  summaryCopy: { flex: 1, gap: 3 },
  summaryTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  summaryNote: { color: UI.muted, fontSize: 11 },
  motherCard: { gap: 10 },
  emergencyCard: { borderColor: '#F3B9B9', backgroundColor: '#FFF5F5' },
  motherHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  motherIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.lavender },
  urgentIcon: { backgroundColor: '#FDE8E7' },
  motherCopy: { flex: 1, gap: 3 },
  motherName: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  meta: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  motherMetaRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  alertCount: { color: UI.amber, fontSize: 10, fontWeight: '800' },
  alertCountUrgent: { color: UI.red },
  urgentPill: { borderRadius: 10, backgroundColor: '#FDE8E7', paddingHorizontal: 9, paddingVertical: 6 },
  urgentPillText: { color: UI.red, fontSize: 10, fontWeight: '900' },
  emptyState: { gap: 6 },
  footer: { color: UI.muted, fontSize: 10, lineHeight: 16 },
  pressed: { opacity: 0.78 },
});
