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
