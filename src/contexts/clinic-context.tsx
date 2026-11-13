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
  referralStatus: ReferralStatus;
  referralOutcome: string;
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
  onset: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  pattern: 'Constant' | 'Comes and goes';
  worsening: 'Yes' | 'No' | 'Not sure';
  contactedChw: boolean;
  visitedFacility: boolean;
  temperatureReading: string;
  bloodPressureReading: string;
  voiceRecordingUri?: string;
  voiceTranscript?: string;
  voiceTranscriptAuthorized?: boolean;
  reportedAt: string;
  status: SymptomReportStatus;
  actions: SymptomReportAction[];
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type SymptomReportStatus = 'new' | 'acknowledged' | 'contacted' | 'referred' | 'closed';

export type SymptomReportAction = {
  status: SymptomReportStatus;
  actor: string;
  note: string;
  occurredAt: string;
};

export type SymptomReportInput = Omit<
  MaternalSymptomReport,
  'id' | 'patientId' | 'reportedAt' | 'status' | 'actions' | 'reviewed' | 'reviewedBy' | 'reviewedAt'
>;

export type FollowUpRequest = {
  id: string;
  patientId: string;
  message: string;
  requestedAt: string;
  responses: FollowUpResponse[];
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type FollowUpResponse = {
  message: string;
  responder: string;
  respondedAt: string;
};

export type NutritionCheckIn = {
  id: string;
  patientId: string;
  ateToday: 'Yes' | 'No' | 'Not sure';
  ateFruitOrVegetables: 'Yes' | 'No' | 'Not sure';
  nauseaOrEatingDifficulty: 'Yes' | 'No';
  foodAccessDifficulty: 'Yes' | 'No';
  notes: string;
  recordedAt: string;
};

export type MaternalActivity = {
  id: string;
  patientId: string;
  title: string;
  details: string;
  result: string;
  occurredAt: string;
};

export type ReferralStatus = 'not-started' | 'sent' | 'received' | 'completed';

type ClinicContextValue = {
  patients: PatientRecord[];
  symptomReports: MaternalSymptomReport[];
  voiceNotes: Record<string, string>;
  followUpRequests: FollowUpRequest[];
  nutritionCheckIns: NutritionCheckIn[];
  maternalActivities: MaternalActivity[];
  addPatient: (patient: Omit<PatientRecord, 'id' | 'createdAt'>) => PatientRecord;
  submitSymptomReport: (patientId: string, report: SymptomReportInput) => string;
  saveVoiceNote: (patientId: string, uri: string) => void;
  updateSymptomReportStatus: (
    reportId: string,
    status: SymptomReportStatus,
    actor: string,
    note: string,
  ) => void;
  requestFollowUp: (patientId: string, message: string) => void;
  respondToFollowUpRequest: (requestId: string, responder: string, response: string) => void;
  submitNutritionCheckIn: (
    patientId: string,
    checkIn: Omit<NutritionCheckIn, 'id' | 'patientId' | 'recordedAt'>,
  ) => void;
  recordMaternalActivity: (patientId: string, title: string, details: string, result: string) => void;
  reviewSymptomReport: (reportId: string, reviewer: string) => void;
  reviewFollowUpRequest: (requestId: string, reviewer: string) => void;
  updatePatient: (patientId: string, updates: Partial<PatientRecord>) => void;
};

const demoPatient: PatientRecord = {
  id: 'MC-24018',
  name: 'Beata Mukamana',
  phone: '0784988435',
  motherAccountEmail: 'mother@mcare.demo',
  dateOfBirth: '1997-04-12',
  nationalId: 'DEMO-MC-24018',
  preferredLanguage: 'Kinyarwanda',
  district: 'Kigali',
  sector: 'Kacyiru',
  cell: 'Kamatamu',
  village: 'Village',
  facility: 'Kigali Health Centre',
  facilityContactPhone: '0784988435',
  emergencyContactName: '114',
  emergencyContactPhone: '0784988435',
  communityHealthWorker: 'Aliane merci',
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
  datingSource: 'within the clinic',
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
  currentSymptoms: 'No concerns reported.',
  complications: 'None reported ',
  conditions: 'None reported ',
  surgicalHistory: 'None reported ',
  familyHistory: 'No relevant family history reported .',
  mentalHealthHistory: 'No psychosocial concerns reported .',
  medications: 'Prenatal supplement',
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
  investigationSource: 'Clinician-entered results',
  otherTests: 'Routine antenatal panel ',
  nextAppointmentDate: '2026-11-20',
  riskFactors: 'No risk factors identified in this sample assessment.',
  priorityFindings: 'Routine antenatal follow-up; no urgent concerns reported .',
  missingAssessments: 'Syphilis result',
  followUp: 'Review pending result at next antenatal visit.',
  carePlan: 'Continue scheduled antenatal follow-up and review pending tests.',
  referralFacility: 'Kigali Referral Hospital ',
  referralReason: 'Sample facility referral for report SYM-DEMO-002 .',
  referralStatus: 'sent',
  referralOutcome: '',
  postpartumStatus: 'pregnant',
  deliveryDate: '',
  postpartumFollowUpDate: '',
  careTeamMessage: 'Bring your maternal passport to the next visit .',
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
  const [symptomReports, setSymptomReports] = useState<MaternalSymptomReport[]>([
    {
      id: 'SYM-DEMO-001',
      patientId: demoPatient.id,
      symptoms: ['Vaginal or heavy bleeding', 'Severe abdominal pain'],
      notes: 'Sample report for CHW dashboard testing; not a real patient report.',
      onset: 'Today',
      severity: 'Severe',
      pattern: 'Constant',
      worsening: 'Yes',
      contactedChw: false,
      visitedFacility: false,
      temperatureReading: '36.8',
      bloodPressureReading: '112/72',
      voiceTranscript: 'Sample voice transcription: I noticed bleeding and abdominal pain this morning.',
      voiceTranscriptAuthorized: true,
      reportedAt: '2026-11-12T08:30:00.000Z',
      status: 'new',
      actions: [],
      reviewed: false,
    },
    {
      id: 'SYM-DEMO-002',
      patientId: demoPatient.id,
      symptoms: ['Severe headache or vision changes'],
      notes: 'Sample follow-up report for dashboard testing; not a real patient report.',
      onset: 'Yesterday',
      severity: 'Moderate',
      pattern: 'Comes and goes',
      worsening: 'No',
      contactedChw: true,
      visitedFacility: false,
      temperatureReading: '37.2',
      bloodPressureReading: '118/76',
      reportedAt: '2026-11-11T13:15:00.000Z',
      status: 'referred',
      actions: [
        {
          status: 'acknowledged',
          actor: 'community health worker',
          note: 'Sample alert acknowledged for dashboard testing.',
          occurredAt: '2026-11-11T13:20:00.000Z',
        },
        {
          status: 'contacted',
          actor: 'community health worker',
          note: 'Sample call attempt documented for dashboard testing.',
          occurredAt: '2026-11-11T13:35:00.000Z',
        },
        {
          status: 'referred',
          actor: 'community health worker',
          note: 'Sample referral sent to Kigali Referral Hospital.',
          occurredAt: '2026-11-11T14:00:00.000Z',
        },
      ],
      reviewed: true,
      reviewedBy: 'community health worker',
      reviewedAt: '2026-11-11T14:00:00.000Z',
    },
  ]);
  const [voiceNotes, setVoiceNotes] = useState<Record<string, string>>({});
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const [nutritionCheckIns, setNutritionCheckIns] = useState<NutritionCheckIn[]>([]);
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
      voiceNotes,
      followUpRequests,
      nutritionCheckIns,
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
      submitSymptomReport: (patientId, report) => {
        const reportedAt = new Date().toISOString();
        const id = `SYM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newReport: MaternalSymptomReport = {
          ...report,
          id,
          patientId,
          reportedAt,
          status: 'new',
          actions: [],
          reviewed: false,
        };
        setSymptomReports((current) => [
          newReport,
          ...current,
        ]);
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Symptom check-in submitted',
            details: [report.symptoms.join(', '), report.notes].filter(Boolean).join(' · '),
            result: `New report ${id} is waiting for care-team review`,
            occurredAt: reportedAt,
          },
          ...current,
        ]);
        return id;
      },
      saveVoiceNote: (patientId, uri) => {
        setVoiceNotes((current) => ({ ...current, [patientId]: uri }));
      },
      updateSymptomReportStatus: (reportId, status, actor, note) => {
        const report = symptomReports.find((item) => item.id === reportId);
        if (!report) return;
        const occurredAt = new Date().toISOString();
        setSymptomReports((current) =>
          current.map((item) =>
            item.id === reportId
              ? {
                  ...item,
                  status,
                  actions: [...item.actions, { status, actor, note, occurredAt }],
                  reviewed: status !== 'new',
                  reviewedBy: status !== 'new' ? actor : item.reviewedBy,
                  reviewedAt: status !== 'new' ? occurredAt : item.reviewedAt,
                }
              : item,
          ),
        );
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId: report.patientId,
            title: `Symptom report ${status}`,
            details: note || report.symptoms.join(', '),
            result: `Updated by ${actor}`,
            occurredAt,
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
            responses: [],
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
            result: 'Sent to the care-team queue',
            occurredAt: requestedAt,
          },
          ...current,
        ]);
      },
      respondToFollowUpRequest: (requestId, responder, response) => {
        const request = followUpRequests.find((item) => item.id === requestId);
        if (!request || !response.trim()) return;
        const respondedAt = new Date().toISOString();
        setFollowUpRequests((current) =>
          current.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  responses: [...item.responses, { message: response.trim(), responder, respondedAt }],
                  reviewed: true,
                  reviewedBy: responder,
                  reviewedAt: respondedAt,
                }
              : item,
          ),
        );
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId: request.patientId,
            title: 'Professional replied to a message',
            details: response.trim(),
            result: `Responded by ${responder}`,
            occurredAt: respondedAt,
          },
          ...current,
        ]);
      },
      submitNutritionCheckIn: (patientId, checkIn) => {
        const recordedAt = new Date().toISOString();
        const entry: NutritionCheckIn = {
          ...checkIn,
          id: `NUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          patientId,
          recordedAt,
        };
        setNutritionCheckIns((current) => [entry, ...current]);
        setMaternalActivities((current) => [
          {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Nutrition check-in submitted',
            details: checkIn.notes || 'Daily food and access check-in completed.',
            result: checkIn.foodAccessDifficulty === 'Yes' ? 'Food access concern noted for care-team review' : 'Saved to the session care record',
            occurredAt: recordedAt,
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
    [followUpRequests, maternalActivities, nutritionCheckIns, patients, symptomReports, voiceNotes],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
