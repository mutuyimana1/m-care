import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, Field, InfoLine, Page, PageHeader, PrimaryButton, SectionHeading, StatusPill, UI } from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';
import { useChwRecords } from '@/hooks/use-chw-records';
import type { ReferralStatus } from '@/contexts/clinic-context';

export default function ChwReferralsPage() {
  const { referrals } = useChwRecords();
  const { updatePatient } = useClinic();
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});

  return (
    <Page>
      <PageHeader
        eyebrow="M-CARE · COMMUNITY HEALTH WORKER"
        title="Referrals"
        subtitle={`${referrals.length} referral${referrals.length === 1 ? '' : 's'} in progress`}
      />
      <SectionHeading title="Facility referral tracking" action={`${referrals.length}`} />
      {referrals.map((patient) => (
        <Card key={patient.id} style={styles.referralCard}>
          <View style={styles.heading}>
            <View style={styles.copy}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.meta}>{patient.id} · {patient.referralFacility}</Text>
            </View>
            <StatusPill
              label={referralLabel(patient.referralStatus)}
              tone={patient.referralStatus === 'completed' ? 'green' : 'amber'}
            />
          </View>
          <InfoLine label="Referral reason" value={patient.referralReason || 'Not recorded'} />
          <InfoLine
            label="Facility receipt"
            value={patient.referralStatus === 'sent'
              ? 'Referral sent; receipt confirmation is pending.'
              : 'Facility receipt confirmed in the CHW follow-up workflow.'}
          />
          <InfoLine
            label="Facility action"
            value={patient.referralStatus === 'completed'
              ? patient.referralOutcome
              : patient.referralStatus === 'received'
                ? 'Referral received; facility outcome is pending.'
                : 'Referral sent; facility response is pending.'}
          />
          {patient.referralStatus === 'sent' ? (
            <PrimaryButton
              label="Confirm facility received referral"
              onPress={() => updatePatient(patient.id, { referralStatus: 'received' })}
            />
          ) : null}
          {patient.referralStatus === 'received' ? (
            <>
              <Field
                label="Outcome shared by receiving facility"
                value={outcomes[patient.id] ?? ''}
                onChangeText={(value) => setOutcomes((current) => ({ ...current, [patient.id]: value }))}
                placeholder="Record the action or care outcome reported by the facility"
                multiline
                numberOfLines={2}
              />
              <PrimaryButton
                label="Record facility action and complete referral"
                disabled={!outcomes[patient.id]?.trim()}
                onPress={() => {
                  const outcome = outcomes[patient.id]?.trim();
                  if (!outcome) return;
                  updatePatient(patient.id, { referralOutcome: outcome, referralStatus: 'completed' });
                  setOutcomes((current) => ({ ...current, [patient.id]: '' }));
                }}
              />
            </>
          ) : null}
        </Card>
      ))}
      {referrals.length === 0 ? (
        <Card style={styles.emptyState}>
          <Text style={styles.name}>No active referrals</Text>
          <Text style={styles.meta}>Facility referrals for your assigned mothers will appear here.</Text>
        </Card>
      ) : null}
    </Page>
  );
}

function referralLabel(status: ReferralStatus) {
  const labels: Record<ReferralStatus, string> = {
    'not-started': 'Not started',
    sent: 'Sent',
    received: 'Received',
    completed: 'Action recorded',
  };
  return labels[status];
}

const styles = StyleSheet.create({
  referralCard: { gap: 12, backgroundColor: '#F8F3FB' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  copy: { flex: 1, gap: 3 },
  name: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  meta: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  emptyState: { gap: 6 },
});
