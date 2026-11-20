export type MaternalSymptomCode = {
  code: string;
  source: 'RapidSMS' | 'M-CARE';
};

const symptomCodes: Record<string, MaternalSymptomCode> = {
  'Vaginal or heavy bleeding': { code: 'HE', source: 'RapidSMS' },
  'Severe abdominal pain': { code: 'AP', source: 'RapidSMS' },
  'Trouble breathing': { code: 'BR', source: 'M-CARE' },
  'Severe headache or vision changes': { code: 'SH', source: 'RapidSMS' },
  Convulsions: { code: 'CO', source: 'RapidSMS' },
  Fever: { code: 'FE', source: 'RapidSMS' },
  'Reduced or no baby movement': { code: 'FM', source: 'M-CARE' },
  'Other concern': { code: 'SC', source: 'RapidSMS' },
};

export function getMaternalSymptomCode(symptom: string): MaternalSymptomCode {
  return symptomCodes[symptom] ?? { code: 'SC', source: 'RapidSMS' };
}

const emergencySymptomCodes = new Set(['HE', 'AP', 'BR', 'SH', 'CO', 'FM']);

export function isEmergencyMaternalSymptom(symptom: string): boolean {
  return emergencySymptomCodes.has(getMaternalSymptomCode(symptom).code);
}

export function isEmergencyMaternalReport(report: {
  id: string;
  severity: string;
  symptoms: string[];
}): boolean {
  return (
    report.severity === 'Severe' ||
    report.id.startsWith('IVR') ||
    report.symptoms.some(
      (symptom) =>
        symptom.toLowerCase().includes('ivr') ||
        isEmergencyMaternalSymptom(symptom),
    )
  );
}
