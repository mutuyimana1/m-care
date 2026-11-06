import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  Field,
  IconTile,
  Page,
  PageHeader,
  PrimaryButton,
  SectionHeading,
  StatusPill,
  UI,
} from '@/components/mcare-ui';
import { useClinic } from '@/contexts/clinic-context';

export default function DoctorHomeScreen() {
  const { patients } = useClinic();
  const [query, setQuery] = useState('');
  const matchingPatients = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.id.toLowerCase().includes(search) ||
        patient.phone.replace(/\s/g, '').includes(search.replace(/\s/g, '')),
    );
  }, [patients, query]);
  const pendingTests = patients.filter((patient) => patient.missingAssessments.trim()).length;

  const openPatient = (id: string) => {
    router.push({ pathname: '/doctor/patient/[id]', params: { id } });
  };

  return (
    <Page>
      <PageHeader
        eyebrow="M-CARE · CLINICIAN"
        title="Care overview"
        subtitle="Find a maternal profile or begin a first-visit assessment."
      />

      <View style={styles.welcomeBanner}>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerEyebrow}>TODAY AT A GLANCE</Text>
          <Text style={styles.bannerTitle}>A clearer picture of every visit.</Text>
          <Text style={styles.bannerNote}>
            Review records, capture assessments, and plan follow-up.
          </Text>
        </View>
        <Text style={styles.bannerArt}>🩺</Text>
      </View>

      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <IconTile name="people-outline" />
          <Text style={styles.metricValue}>{patients.length}</Text>
          <Text style={styles.metricLabel}>Demo profiles</Text>
        </Card>
        <Card style={styles.metric}>
          <IconTile name="flask-outline" color={UI.amber} />
          <Text style={styles.metricValue}>{pendingTests}</Text>
          <Text style={styles.metricLabel}>Follow-up items</Text>
        </Card>
      </View>

      <Card>
        <SectionHeading title="Search a patient" />
        <Field
          label="Name, M-CARE ID, or phone"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Beata or MC-24018"
          returnKeyType="search"
        />
        {query.trim() && matchingPatients.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={18} color={UI.muted} />
            <Text style={styles.emptyText}>No matching demo profile. Check details or register new.</Text>
          </View>
        ) : null}
        {matchingPatients.map((patient) => (
          <Pressable
            key={patient.id}
            accessibilityRole="button"
            onPress={() => openPatient(patient.id)}
            style={({ pressed }) => [styles.searchResult, pressed && styles.pressed]}>
            <View style={styles.resultAvatar}>
              <Text style={styles.resultInitial}>{patient.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.resultCopy}>
              <Text style={styles.resultName}>{patient.name}</Text>
              <Text style={styles.resultMeta}>{patient.id} · {patient.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={UI.muted} />
          </Pressable>
        ))}
        <PrimaryButton
          label="Start new maternal registration"
          icon="person-add-outline"
          onPress={() => router.navigate('/doctor/registration')}
        />
      </Card>

      <SectionHeading title="Recently updated" action="All profiles in Patients" />
      {patients.slice(0, 3).map((patient) => (
        <Pressable
          key={patient.id}
          accessibilityRole="button"
          onPress={() => openPatient(patient.id)}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Card style={styles.patientRow}>
            <View style={styles.resultAvatar}>
              <Text style={styles.resultInitial}>{patient.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.resultCopy}>
              <Text style={styles.resultName}>{patient.name}</Text>
              <Text style={styles.resultMeta}>{patient.id} · Updated {patient.createdAt}</Text>
            </View>
            <StatusPill label={patient.clinicianApproved ? 'Reviewed' : 'Draft'} tone={patient.clinicianApproved ? 'green' : 'amber'} />
          </Card>
        </Pressable>
      ))}

      <View style={styles.localNotice}>
        <Ionicons name="cloud-offline-outline" size={17} color={UI.accentDark} />
        <Text style={styles.localText}>
          Prototype mode: sample records stay in memory for this session only. Secure offline
          capture and facility sync are not connected.
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  welcomeBanner: {
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#F3E8FC',
  },
  bannerCopy: { flex: 1, gap: 7 },
  bannerEyebrow: { color: UI.accentDark, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: UI.ink, fontSize: 20, lineHeight: 25, fontWeight: '800', maxWidth: 250 },
  bannerNote: { color: UI.muted, fontSize: 12, lineHeight: 17, maxWidth: 260 },
  bannerArt: { fontSize: 50, marginLeft: 8 },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, minHeight: 132 },
  metricValue: { color: UI.ink, fontSize: 24, fontWeight: '800' },
  metricLabel: { color: UI.muted, fontSize: 12 },
  emptySearch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyText: { flex: 1, color: UI.muted, fontSize: 12, lineHeight: 18 },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  resultAvatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInitial: { color: UI.accentDark, fontSize: 16, fontWeight: '800' },
  resultCopy: { flex: 1, gap: 3 },
  resultName: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  resultMeta: { color: UI.muted, fontSize: 11 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  localNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingHorizontal: 2 },
  localText: { flex: 1, color: UI.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.78 },
});
