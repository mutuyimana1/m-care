import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type PatientRecord = {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  preferredLanguage: string;
  facility: string;
  consent: boolean;
  confirmationMethod: string;
  pregnancyResult: string;
  confirmationDate: string;
  clinicianName: string;
  gravida: string;
  para: string;
  previousPregnancies: string;
  complications: string;
  conditions: string;
  medications: string;
  allergies: string;
  systolic: string;
  diastolic: string;
  weightKg: string;
  temperatureC: string;
  pulse: string;
  hemoglobin: string;
  bloodGroup: string;
  hiv: string;
  syphilis: string;
  urineProtein: string;
  otherTests: string;
  riskFactors: string;
  missingAssessments: string;
  followUp: string;
  carePlan: string;
  clinicianApproved: boolean;
  createdAt: string;
};

type ClinicContextValue = {
  patients: PatientRecord[];
  addPatient: (patient: Omit<PatientRecord, 'id' | 'createdAt'>) => PatientRecord;
};

const demoPatient: PatientRecord = {
  id: 'MC-24018',
  name: 'Beata Mukamana',
  phone: '+250 788 120 458',
  dateOfBirth: '1997-04-12',
  preferredLanguage: 'Kinyarwanda',
  facility: 'Kigali Health Centre',
  consent: true,
  confirmationMethod: 'Ultrasound',
  pregnancyResult: 'Confirmed',
  confirmationDate: '2026-09-10',
  clinicianName: 'Dr. Eric Niyonzima',
  gravida: '2',
  para: '1',
  previousPregnancies: 'One previous pregnancy',
  complications: 'None reported',
  conditions: 'None reported',
  medications: 'Prenatal supplement (as prescribed)',
  allergies: 'None reported',
  systolic: '112',
  diastolic: '72',
  weightKg: '64',
  temperatureC: '36.7',
  pulse: '78',
  hemoglobin: '11.8',
  bloodGroup: 'O+',
  hiv: 'Completed',
  syphilis: 'Pending',
  urineProtein: 'Negative',
  otherTests: 'Routine antenatal panel',
  riskFactors: 'No risk factors recorded in this demo profile.',
  missingAssessments: 'Syphilis result',
  followUp: 'Review pending result at next antenatal visit.',
  carePlan: 'Continue scheduled antenatal follow-up and review pending tests.',
  clinicianApproved: true,
  createdAt: '2026-09-10',
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: PropsWithChildren) {
  const [patients, setPatients] = useState([demoPatient]);
  const value = useMemo<ClinicContextValue>(
    () => ({
      patients,
      addPatient: (patient) => {
        const record = {
          ...patient,
          id: `MC-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setPatients((current) => [record, ...current]);
        return record;
      },
    }),
    [patients],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
}
