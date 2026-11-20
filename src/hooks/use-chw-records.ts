import { useMemo } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useClinic } from '@/contexts/clinic-context';
import { isEmergencyMaternalReport } from '@/utils/maternal-symptom-codes';

export function useChwRecords() {
  const { user } = useAuth();
  const { patients, symptomReports } = useClinic();

  return useMemo(() => {
    const assignedPatients = patients.filter(
      (patient) =>
        patient.communityHealthWorker.trim().toLowerCase() === user?.name.toLowerCase() &&
        patient.consent &&
        patient.clinicianApproved,
    );
    const assignedPatientIds = new Set(assignedPatients.map((patient) => patient.id));
    const alerts = symptomReports
      .filter((report) => assignedPatientIds.has(report.patientId))
      .sort((left, right) => {
        const leftUrgent = left.status !== 'closed' && isEmergencyMaternalReport(left);
        const rightUrgent = right.status !== 'closed' && isEmergencyMaternalReport(right);
        return Number(rightUrgent) - Number(leftUrgent) || right.reportedAt.localeCompare(left.reportedAt);
      });

    return {
      user,
      assignedPatients,
      alerts,
      openAlerts: alerts.filter((report) => report.status !== 'closed'),
      urgentAlertCount: alerts.filter(
        (report) => report.status !== 'closed' && isEmergencyMaternalReport(report),
      ).length,
      referrals: assignedPatients.filter((patient) => patient.referralStatus !== 'not-started'),
    };
  }, [patients, symptomReports, user]);
}
