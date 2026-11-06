import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Page, PageHeader, PrimaryButton, StatusPill, UI } from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';

export default function PatientsScreen() {
  const { patients } = useClinic();
  const [query, setQuery] = useState('');
  const filteredPatients = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return patients;
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.id.toLowerCase().includes(search) ||
        patient.phone.replace(/\s/g, '').includes(search.replace(/\s/g, '')),
    );
  }, [patients, query]);

  return (
    <Page>
      <PageHeader
        eyebrow="CARE RECORDS"
        title="Patient profiles"
        subtitle={`${patients.length} demo profile${patients.length === 1 ? '' : 's'} available on this device.`}
      />
      <Field
        label="Search profiles"
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, M-CARE ID, or phone"
        returnKeyType="search"
      />
      {filteredPatients.map((patient) => (
        <Pressable
          key={patient.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/doctor/patient/[id]', params: { id: patient.id } })}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Card style={styles.patientCard}>
            <View style={styles.patientIcon}>
              <Ionicons name="person-outline" size={21} color={UI.accentDark} />
            </View>
            <View style={styles.patientCopy}>
              <Text style={styles.name}>{patient.name}</Text>
              <Text style={styles.meta}>{patient.id} · {patient.phone}</Text>
              <Text style={styles.meta}>{patient.facility || 'Facility not recorded'}</Text>
            </View>
            <StatusPill
              label={patient.clinicianApproved ? 'Reviewed' : 'Needs review'}
              tone={patient.clinicianApproved ? 'green' : 'amber'}
            />
          </Card>
        </Pressable>
      ))}
      {filteredPatients.length === 0 ? (
        <Card>
          <Text style={styles.name}>No matching profile</Text>
          <Text style={styles.meta}>
            Check the spelling or start a new registration after confirming the patient is not
            already registered at another authorized facility.
          </Text>
        </Card>
      ) : null}
      <PrimaryButton
        label="Register a new patient"
        icon="person-add-outline"
        onPress={() => router.navigate('/doctor/registration')}
      />
      <Text style={styles.note}>
        Always confirm identity and obtain consent before viewing or sharing a real health record.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  patientIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCopy: { flex: 1, gap: 4 },
  name: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  meta: { color: UI.muted, fontSize: 11, lineHeight: 16 },
  note: { color: UI.muted, fontSize: 11, lineHeight: 17 },
  pressed: { opacity: 0.78 },
});
