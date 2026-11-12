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

type ClinicContextValue = {
  patients: PatientRecord[];
  symptomReports: MaternalSymptomReport[];
  followUpRequests: FollowUpRequest[];
  addPatient: (patient: Omit<PatientRecord, 'id' | 'createdAt'>) => PatientRecord;
  submitSymptomReport: (patientId: string, symptoms: string[], notes: string) => void;
  requestFollowUp: (patientId: string, message: string) => void;
  reviewSymptomReport: (reportId: string, reviewer: string) => void;
  reviewFollowUpRequest: (requestId: string, reviewer: string) => void;
  updatePatient: (patientId: string, updates: Partial<PatientRecord>) => void;
};

const demoPatient: PatientRecord = {
  id: 'MC-24018',
  name: 'Beata Mukamana',
  phone: '+250 788 120 458',
  motherAccountEmail: 'mother@mcare.demo',
  dateOfBirth: '1997-04-12',
  nationalId: '',
  preferredLanguage: 'Kinyarwanda',
  district: 'Kigali',
  sector: '',
  cell: '',
  village: '',
  facility: 'Kigali Health Centre',
  facilityContactPhone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  communityHealthWorker: '',
  consent: true,
  consentRecordedAt: '2026-09-10',
  confirmationMethod: 'Ultrasound',
  pregnancyResult: 'Positive',
  confirmationDate: '2026-09-10',
  pregnancyTestDate: '',
  clinicianName: 'Dr. Eric Niyonzima',
  lastMenstrualPeriod: '',
  estimatedDueDate: '2027-03-26',
  datingMethod: 'Ultrasound',
  datingSource: 'Clinician-recorded demo estimate',
  gestationalAgeWeeks: '21',
  gestationalAgeDays: '0',
  gravida: '2',
  para: '1',
  previousPregnancies: 'One previous pregnancy',
  livingChildren: '1',
  pregnancyOutcomes: 'One previous live birth',
  previousDeliveryMode: 'Vaginal delivery',
  lastBirthDate: '',
  birthSpacing: '',
  currentSymptoms: '',
  complications: 'None reported',
  conditions: 'None reported',
  surgicalHistory: 'None reported',
  familyHistory: 'Not recorded',
  mentalHealthHistory: 'Not recorded',
  medications: 'Prenatal supplement (as prescribed)',
  allergies: 'None reported',
  systolic: '112',
  diastolic: '72',
  weightKg: '64',
  heightCm: '',
  temperatureC: '36.7',
  pulse: '78',
  respiratoryRate: '',
  oxygenSaturation: '',
  fundalHeightCm: '',
  fetalHeartRate: '',
  hemoglobin: '11.8',
  bloodGroup: 'O+',
  rhesusFactor: '',
  hiv: 'Completed',
  syphilis: 'Pending',
  urineProtein: 'Negative',
  urineGlucose: '',
  hepatitisB: '',
  malaria: '',
  sickleCell: '',
  ultrasoundSummary: 'Dating ultrasound recorded',
  investigationSource: 'Clinician-entered demo results',
  otherTests: 'Routine antenatal panel',
  nextAppointmentDate: '',
  riskFactors: 'No risk factors recorded in this demo profile.',
  priorityFindings: '',
  missingAssessments: 'Syphilis result',
  followUp: 'Review pending result at next antenatal visit.',
  carePlan: 'Continue scheduled antenatal follow-up and review pending tests.',
  referralFacility: '',
  referralReason: '',
  postpartumStatus: 'pregnant',
  deliveryDate: '',
  postpartumFollowUpDate: '',
  careTeamMessage: '',
  clinicianApproved: true,
  reviewedBy: 'Dr. Eric Niyonzima',
  reviewedAt: '2026-09-10',
  createdAt: '2026-09-10',
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: PropsWithChildren) {
  const [patients, setPatients] = useState([demoPatient]);
  const [symptomReports, setSymptomReports] = useState<MaternalSymptomReport[]>([]);
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const value = useMemo<ClinicContextValue>(
    () => ({
      patients,
      symptomReports,
      followUpRequests,
      addPatient: (patient) => {
        const record = {
          ...patient,
          id: `MC-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setPatients((current) => [record, ...current]);
        return record;
      },
      submitSymptomReport: (patientId, symptoms, notes) => {
        setSymptomReports((current) => [
          {
            id: `SYM-${Date.now()}`,
            patientId,
            symptoms,
            notes,
            reportedAt: new Date().toISOString(),
            reviewed: false,
          },
          ...current,
        ]);
      },
      requestFollowUp: (patientId, message) => {
        setFollowUpRequests((current) => [
          {
            id: `REQ-${Date.now()}`,
            patientId,
            message,
            requestedAt: new Date().toISOString(),
            reviewed: false,
          },
          ...current,
        ]);
      },
      reviewSymptomReport: (reportId, reviewer) => {
        setSymptomReports((current) =>
          current.map((report) =>
            report.id === reportId
              ? { ...report, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() }
              : report,
          ),
        );
      },
      reviewFollowUpRequest: (requestId, reviewer) => {
        setFollowUpRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() }
              : request,
          ),
        );
      },
      updatePatient: (patientId, updates) => {
        setPatients((current) =>
          current.map((patient) =>
            patient.id === patientId ? { ...patient, ...updates } : patient,
          ),
        );
      },
    }),
    [followUpRequests, patients, symptomReports],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
