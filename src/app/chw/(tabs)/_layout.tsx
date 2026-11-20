import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { isEmergencyMaternalReport } from '@/utils/maternal-symptom-codes';

export default function ChwTabsLayout() {
  const { user } = useAuth();
  const { patients, symptomReports } = useClinic();
  const assignedPatientIds = new Set(
    patients
      .filter(
        (patient) =>
          patient.communityHealthWorker.trim().toLowerCase() === user?.name.toLowerCase() &&
          patient.consent &&
          patient.clinicianApproved,
      )
      .map((patient) => patient.id),
  );
  const openAlerts = symptomReports.filter(
    (report) => assignedPatientIds.has(report.patientId) && report.status !== 'closed',
  );
  const hasUrgentAlerts = openAlerts.some(isEmergencyMaternalReport);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: UI.accentDark,
        tabBarInactiveTintColor: UI.muted,
        tabBarStyle: {
          backgroundColor: UI.white,
          borderTopColor: UI.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mothers',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="people-outline" color={focused ? UI.accentDark : UI.muted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarBadge: openAlerts.length || undefined,
          tabBarBadgeStyle: {
            backgroundColor: hasUrgentAlerts ? UI.red : UI.amber,
            color: UI.white,
            fontSize: 9,
          },
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="alert-circle-outline"
              color={hasUrgentAlerts ? UI.red : focused ? UI.accentDark : UI.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          title: 'Referrals',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="git-branch-outline" color={focused ? UI.accentDark : UI.muted} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
