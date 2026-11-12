import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type PatientRecord = {
  id: string;
  name: string;
  phone: string;
  motherAccountEmail: string;
  dateOfBirth: string;
  nationalId: string;
  preferredLanguage: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  facility: string;
  facilityContactPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  communityHealthWorker: string;
  consent: boolean;
  consentRecordedAt: string;
  confirmationMethod: string;
  pregnancyResult: string;
  confirmationDate: string;
  pregnancyTestDate: string;
  clinicianName: string;
  lastMenstrualPeriod: string;
  estimatedDueDate: string;
  datingMethod: string;
  datingSource: string;
  gestationalAgeWeeks: string;
  gestationalAgeDays: string;
  gravida: string;
  para: string;
  previousPregnancies: string;
  livingChildren: string;
  pregnancyOutcomes: string;
  previousDeliveryMode: string;
  lastBirthDate: string;
  birthSpacing: string;
  currentSymptoms: string;
  complications: string;
  conditions: string;
  surgicalHistory: string;
  familyHistory: string;
  mentalHealthHistory: string;
  medications: string;
  allergies: string;
  systolic: string;
  diastolic: string;
  weightKg: string;
  heightCm: string;
  temperatureC: string;
  pulse: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  fundalHeightCm: string;
  fetalHeartRate: string;
  estimatedBabyWeightGrams: string;
  hemoglobin: string;
  bloodGroup: string;
  rhesusFactor: string;
  hiv: string;
  syphilis: string;
  urineProtein: string;
  urineGlucose: string;
  hepatitisB: string;
  malaria: string;
  sickleCell: string;
  ultrasoundSummary: string;
  investigationSource: string;
  otherTests: string;
  nextAppointmentDate: string;
  riskFactors: string;
  priorityFindings: string;
  missingAssessments: string;
  followUp: string;
  carePlan: string;
  referralFacility: string;
  referralReason: string;
  postpartumStatus: 'pregnant' | 'postpartum';
  deliveryDate: string;
  postpartumFollowUpDate: string;
  careTeamMessage: string;
  clinicianApproved: boolean;
  reviewedBy: string;
  reviewedAt: string;
  createdAt: string;
};

export type MaternalSymptomReport = {
  id: string;
  patientId: string;
  symptoms: string[];
  notes: string;
  reportedAt: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type FollowUpRequest = {
  id: string;
  patientId: string;
  message: string;
  requestedAt: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type MaternalActivity = {
  id: string;
  patientId: string;
  title: string;
  details: string;
  result: string;
  occurredAt: string;
};

type ClinicContextValue = {
  patients: PatientRecord[];
  symptomReports: MaternalSymptomReport[];
  followUpRequests: FollowUpRequest[];
  maternalActivities: MaternalActivity[];
  addPatient: (patient: Omit<PatientRecord, 'id' | 'createdAt'>) => PatientRecord;
  submitSymptomReport: (patientId: string, symptoms: string[], notes: string) => void;
  requestFollowUp: (patientId: string, message: string) => void;
  recordMaternalActivity: (patientId: string, title: string, details: string, result: string) => void;
  reviewSymptomReport: (reportId: string, reviewer: string) => void;
  reviewFollowUpRequest: (requestId: string, reviewer: string) => void;
  updatePatient: (patientId: string, updates: Partial<PatientRecord>) => void;
};

const demoPatient: PatientRecord = {
  id: 'MC-24018',
  name: 'Beata Mukamana',
  phone: 'Demo only (not a working number)',
  motherAccountEmail: 'mother@mcare.demo',
  dateOfBirth: '1997-04-12',
  nationalId: 'DEMO-MC-24018',
  preferredLanguage: 'Kinyarwanda',
  district: 'Kigali',
  sector: 'Kacyiru',
  cell: 'Kamatamu',
  village: 'Demo Village',
  facility: 'Kigali Health Centre',
  facilityContactPhone: 'Demo only (not a working number)',
  emergencyContactName: 'Demo emergency contact',
  emergencyContactPhone: 'Demo only (not a working number)',
  communityHealthWorker: 'Demo community health worker',
  consent: true,
  consentRecordedAt: '2026-09-10',
  confirmationMethod: 'Ultrasound',
  pregnancyResult: 'Positive',
  confirmationDate: '2026-09-10',
  pregnancyTestDate: '2026-08-25',
  clinicianName: 'Dr. Eric Niyonzima',
  lastMenstrualPeriod: '2026-06-18',
  estimatedDueDate: '2027-03-25',
  datingMethod: 'Ultrasound',
  datingSource: 'Clinician-recorded demo estimate',
  gestationalAgeWeeks: '21',
  gestationalAgeDays: '0',
  gravida: '2',
  para: '1',
  previousPregnancies: 'One previous pregnancy ',
  livingChildren: '1',
  pregnancyOutcomes: 'One previous live birth ',
  previousDeliveryMode: 'Vaginal delivery ',
  lastBirthDate: '2023-02-14',
  birthSpacing: 'Approximately 3 years 4 months ',
  currentSymptoms: 'No concerns reported at the latest demo visit.',
  complications: 'None reported ',
  conditions: 'None reported ',
  surgicalHistory: 'None reported ',
  familyHistory: 'No relevant family history reported .',
  mentalHealthHistory: 'No psychosocial concerns reported .',
  medications: 'Prenatal supplement (demo; use only as prescribed)',
  allergies: 'None reported ',
  systolic: '112',
  diastolic: '72',
  weightKg: '64',
  heightCm: '162',
  temperatureC: '36.7',
  pulse: '78',
  respiratoryRate: '18',
  oxygenSaturation: '98',
  fundalHeightCm: '21',
  fetalHeartRate: '145',
  estimatedBabyWeightGrams: '399',
  hemoglobin: '11.8',
  bloodGroup: 'O+',
  rhesusFactor: 'Positive',
  hiv: 'Negative ',
  syphilis: 'Pending',
  urineProtein: 'Negative ',
  urineGlucose: 'Negative ',
  hepatitisB: 'Negative ',
  malaria: 'Negative ',
  sickleCell: 'Screen negative ',
  ultrasoundSummary: 'Dating ultrasound recorded ',
  investigationSource: 'Clinician-entered demo results',
  otherTests: 'Routine antenatal panel ',
  nextAppointmentDate: '2026-11-20',
  riskFactors: 'No risk factors identified in this sample assessment.',
  priorityFindings: 'Routine antenatal follow-up; no urgent concerns reported .',
  missingAssessments: 'Syphilis result',
  followUp: 'Review pending result at next antenatal visit.',
  carePlan: 'Continue scheduled antenatal follow-up and review pending tests.',
  referralFacility: 'Kigali Referral Hospital ',
  referralReason: 'Routine specialist review scheduled for 20 Nov 2026 (demo only).',
  postpartumStatus: 'pregnant',
  deliveryDate: '',
  postpartumFollowUpDate: '',
  careTeamMessage: 'Bring your maternal passport to the next visit (demo message).',
  clinicianApproved: true,
  reviewedBy: 'Dr. Eric Niyonzima',
  reviewedAt: '2026-09-10',
  createdAt: '2026-09-10',
};

function humanizeFieldName(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase());
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: PropsWithChildren) {
  const [patients, setPatients] = useState([demoPatient]);
  const [symptomReports, setSymptomReports] = useState<MaternalSymptomReport[]>([]);
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const [maternalActivities, setMaternalActivities] = useState<MaternalActivity[]>([
    {
      id: 'ACT-MC-24018-REVIEW',
      patientId: demoPatient.id,
      title: 'Maternal record reviewed',
      details: 'Initial pregnancy profile and care plan were approved.',
      result: 'Approved by Dr. Eric Niyonzima',
      occurredAt: `${demoPatient.reviewedAt}T09:00:00.000Z`,
    },
  ]);
  const value = useMemo<ClinicContextValue>(
    () => ({
      patients,
      symptomReports,
      followUpRequests,
      maternalActivities,
      addPatient: (patient) => {
        const record = {
          ...patient,
          id: `MC-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setPatients((current) => [record, ...current]);
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId: record.id,
            title: 'Maternal passport created',
            details: 'A new maternal profile was added to the care record.',
            result: `Approved by ${record.reviewedBy}`,
            occurredAt: new Date().toISOString(),
          },
          ...current,
        ]);
        return record;
      },
      submitSymptomReport: (patientId, symptoms, notes) => {
        const reportedAt = new Date().toISOString();
        setSymptomReports((current) => [
          {
            id: `SYM-${Date.now()}`,
            patientId,
            symptoms,
            notes,
            reportedAt,
            reviewed: false,
          },
          ...current,
        ]);
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Symptom check-in submitted',
            details: [symptoms.join(', '), notes].filter(Boolean).join(' · '),
            result: 'Waiting for care-team review',
            occurredAt: reportedAt,
          },
          ...current,
        ]);
      },
      requestFollowUp: (patientId, message) => {
        const requestedAt = new Date().toISOString();
        setFollowUpRequests((current) => [
          {
            id: `REQ-${Date.now()}`,
            patientId,
            message,
            requestedAt,
            reviewed: false,
          },
          ...current,
        ]);
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Follow-up requested',
            details: message,
            result: 'Sent to the demo care-team queue',
            occurredAt: requestedAt,
          },
          ...current,
        ]);
      },
      recordMaternalActivity: (patientId, title, details, result) => {
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId,
            title,
            details,
            result,
            occurredAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
      reviewSymptomReport: (reportId, reviewer) => {
        const report = symptomReports.find((item) => item.id === reportId);
        if (report) {
          setMaternalActivities((current) => [
            {
              id: `ACT-${Date.now()}`,
              patientId: report.patientId,
              title: 'Symptom report reviewed',
              details: report.symptoms.join(', '),
              result: `Reviewed by ${reviewer}`,
              occurredAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }
        setSymptomReports((current) =>
          current.map((report) =>
            report.id === reportId
              ? { ...report, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() }
              : report,
          ),
        );
      },
      reviewFollowUpRequest: (requestId, reviewer) => {
        const request = followUpRequests.find((item) => item.id === requestId);
        if (request) {
          setMaternalActivities((current) => [
            {
              id: `ACT-${Date.now()}`,
              patientId: request.patientId,
              title: 'Follow-up request reviewed',
              details: request.message,
              result: `Reviewed by ${reviewer}`,
              occurredAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }
        setFollowUpRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() }
              : request,
          ),
        );
      },
      updatePatient: (patientId, updates) => {
        const updatedFields = Object.keys(updates).map(humanizeFieldName);
        if (updatedFields.length) {
          setMaternalActivities((current) => [
            {
              id: `ACT-${Date.now()}`,
              patientId,
              title: 'Maternal record updated',
              details: `Updated: ${updatedFields.join(', ')}`,
              result: 'Saved to the session care record',
              occurredAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }
        setPatients((current) =>
          current.map((patient) =>
            patient.id === patientId ? { ...patient, ...updates } : patient,
          ),
        );
      },
    }),
    [followUpRequests, maternalActivities, patients, symptomReports],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
