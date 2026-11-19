import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { api } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

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
  syncError: string | null;
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


function humanizeFieldName(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase());
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [symptomReports, setSymptomReports] = useState<MaternalSymptomReport[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<Record<string, string>>({});
  const [followUpRequests, setFollowUpRequests] = useState<FollowUpRequest[]>([]);
  const [nutritionCheckIns, setNutritionCheckIns] = useState<NutritionCheckIn[]>([]);
  const [maternalActivities, setMaternalActivities] = useState<MaternalActivity[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([
      api.listRecords<PatientRecord>('patient'), api.listRecords<MaternalSymptomReport>('symptom'),
      api.listRecords<FollowUpRequest>('followup'), api.listRecords<NutritionCheckIn>('nutrition'),
      api.listRecords<MaternalActivity>('activity'), api.listRecords<{ id: string; patientId: string; uri: string }>('voice'),
    ]).then(([p, symptoms, followUps, nutrition, activities, voices]) => {
      if (!active) return;
      setPatients(p); setSymptomReports(symptoms); setFollowUpRequests(followUps);
      setNutritionCheckIns(nutrition); setMaternalActivities(activities);
      setVoiceNotes(Object.fromEntries(voices.map((voice) => [voice.patientId, voice.uri])));
      setSyncError(null);
    }).catch((error) => setSyncError(error instanceof Error ? error.message : 'Unable to load clinic data.'));
    return () => { active = false; };
  }, [token]);

  const persist = useCallback(<T extends { id: string },>(type: string, record: T, isNew = false) => {
    const operation = isNew ? api.createRecord(type, record) : api.updateRecord(type, record);
    void operation.then(() => setSyncError(null)).catch((error) =>
      setSyncError(error instanceof Error ? error.message : `Unable to save ${type} record.`),
    );
  }, []);

  const value = useMemo<ClinicContextValue>(
    () => ({
      syncError,
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
        persist('patient', record, true);
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId: record.id,
            title: 'Maternal passport created',
            details: 'A new maternal profile was added to the care record.',
            result: `Approved by ${record.reviewedBy}`,
            occurredAt: new Date().toISOString(),
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
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
        persist('symptom', newReport, true);
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Symptom check-in submitted',
            details: [report.symptoms.join(', '), report.notes].filter(Boolean).join(' · '),
            result: `New report ${id} is waiting for care-team review`,
            occurredAt: reportedAt,
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
        return id;
      },
      saveVoiceNote: (patientId, uri) => {
        setVoiceNotes((current) => ({ ...current, [patientId]: uri }));
        persist('voice', { id: patientId, patientId, uri }, true);
      },
      updateSymptomReportStatus: (reportId, status, actor, note) => {
        const report = symptomReports.find((item) => item.id === reportId);
        if (!report) return;
        const occurredAt = new Date().toISOString();
        const updatedReport = {
          ...report,
          status,
          actions: [...report.actions, { status, actor, note, occurredAt }],
          reviewed: status !== 'new',
          reviewedBy: status !== 'new' ? actor : report.reviewedBy,
          reviewedAt: status !== 'new' ? occurredAt : report.reviewedAt,
        };
        persist('symptom', updatedReport);
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
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId: report.patientId,
            title: `Symptom report ${status}`,
            details: note || report.symptoms.join(', '),
            result: `Updated by ${actor}`,
            occurredAt,
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
      },
      requestFollowUp: (patientId, message) => {
        const requestedAt = new Date().toISOString();
        const request = {
            id: `REQ-${Date.now()}`,
            patientId,
            message,
            requestedAt,
            responses: [],
            reviewed: false,
          };
        setFollowUpRequests((current) => [request, ...current]);
        persist('followup', request, true);
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Follow-up requested',
            details: message,
            result: 'Sent to the care-team queue',
            occurredAt: requestedAt,
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
      },
      respondToFollowUpRequest: (requestId, responder, response) => {
        const request = followUpRequests.find((item) => item.id === requestId);
        if (!request || !response.trim()) return;
        const respondedAt = new Date().toISOString();
        const updatedRequest = {
          ...request,
          responses: [...request.responses, { message: response.trim(), responder, respondedAt }],
          reviewed: true,
          reviewedBy: responder,
          reviewedAt: respondedAt,
        };
        persist('followup', updatedRequest);
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
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId: request.patientId,
            title: 'Professional replied to a message',
            details: response.trim(),
            result: `Responded by ${responder}`,
            occurredAt: respondedAt,
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
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
        persist('nutrition', entry, true);
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId,
            title: 'Nutrition check-in submitted',
            details: checkIn.notes || 'Daily food and access check-in completed.',
            result: checkIn.foodAccessDifficulty === 'Yes' ? 'Food access concern noted for care-team review' : 'Saved to the session care record',
            occurredAt: recordedAt,
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
      },
      recordMaternalActivity: (patientId, title, details, result) => {
        const activity = {
            id: `ACT-${Date.now()}`,
            patientId,
            title,
            details,
            result,
            occurredAt: new Date().toISOString(),
          };
        setMaternalActivities((current) => [activity, ...current]);
        persist('activity', activity, true);
      },
      reviewSymptomReport: (reportId, reviewer) => {
        const report = symptomReports.find((item) => item.id === reportId);
        if (report) {
          const activity = {
              id: `ACT-${Date.now()}`,
              patientId: report.patientId,
              title: 'Symptom report reviewed',
              details: report.symptoms.join(', '),
              result: `Reviewed by ${reviewer}`,
              occurredAt: new Date().toISOString(),
            };
          setMaternalActivities((current) => [activity, ...current]);
          persist('activity', activity, true);
          persist('symptom', { ...report, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() });
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
          const activity = {
              id: `ACT-${Date.now()}`,
              patientId: request.patientId,
              title: 'Follow-up request reviewed',
              details: request.message,
              result: `Reviewed by ${reviewer}`,
              occurredAt: new Date().toISOString(),
            };
          setMaternalActivities((current) => [activity, ...current]);
          persist('activity', activity, true);
          persist('followup', { ...request, reviewed: true, reviewedBy: reviewer, reviewedAt: new Date().toISOString() });
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
          const activity = {
              id: `ACT-${Date.now()}`,
              patientId,
              title: 'Maternal record updated',
              details: `Updated: ${updatedFields.join(', ')}`,
              result: 'Saved to the session care record',
              occurredAt: new Date().toISOString(),
            };
          setMaternalActivities((current) => [activity, ...current]);
          persist('activity', activity, true);
        }
        setPatients((current) =>
          current.map((patient) =>
            patient.id === patientId ? { ...patient, ...updates } : patient,
          ),
        );
        const existing = patients.find((patient) => patient.id === patientId);
        if (existing) persist('patient', { ...existing, ...updates });
      },
    }),
    [followUpRequests, maternalActivities, nutritionCheckIns, patients, persist, symptomReports, syncError, voiceNotes],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
