import type { PatientRecord } from '@/contexts/clinic-context';

type CompletenessInput = Pick<
  PatientRecord,
  | 'name'
  | 'phone'
  | 'dateOfBirth'
  | 'preferredLanguage'
  | 'district'
  | 'facility'
  | 'consent'
  | 'confirmationMethod'
  | 'pregnancyResult'
  | 'confirmationDate'
  | 'clinicianName'
  | 'gravida'
  | 'para'
  | 'previousPregnancies'
  | 'pregnancyOutcomes'
  | 'complications'
  | 'conditions'
  | 'medications'
  | 'allergies'
  | 'surgicalHistory'
  | 'systolic'
  | 'diastolic'
  | 'weightKg'
  | 'temperatureC'
  | 'pulse'
  | 'hemoglobin'
  | 'bloodGroup'
  | 'hiv'
  | 'syphilis'
  | 'urineProtein'
  | 'investigationSource'
  | 'otherTests'
  | 'riskFactors'
  | 'missingAssessments'
  | 'followUp'
  | 'carePlan'
>;

export function getMaternalCompleteness(record: CompletenessInput) {
  const items = [
    { label: 'Patient identity and contact', complete: Boolean(record.name.trim() && record.phone.trim()) },
    {
      label: 'Personal information, location, and consent',
      complete: Boolean(
        isValidDate(record.dateOfBirth) &&
          record.preferredLanguage.trim() &&
          record.district.trim() &&
          record.facility.trim() &&
          record.consent,
      ),
    },
    {
      label: 'Pregnancy confirmation assessment',
      complete: Boolean(
        record.confirmationMethod.trim() &&
          isValidDate(record.confirmationDate) &&
          record.clinicianName.trim() &&
          record.pregnancyResult.trim(),
      ),
    },
    {
      label: 'Obstetric history',
      complete: Boolean(
        record.gravida.trim() &&
          record.para.trim() &&
          record.previousPregnancies.trim() &&
          record.pregnancyOutcomes.trim() &&
          record.complications.trim(),
      ),
    },
    {
      label: 'Medical history',
      complete: Boolean(
        record.conditions.trim() &&
          record.medications.trim() &&
          record.allergies.trim() &&
          record.surgicalHistory.trim(),
      ),
    },
    {
      label: 'Clinical measurements',
      complete: Boolean(
        isPositiveNumber(record.systolic) &&
          isPositiveNumber(record.diastolic) &&
          isPositiveNumber(record.weightKg) &&
          isPositiveNumber(record.temperatureC) &&
          isPositiveNumber(record.pulse),
      ),
    },
    {
      label: 'Laboratory investigations and source',
      complete: Boolean(
        record.hemoglobin.trim() &&
          record.bloodGroup.trim() &&
          record.hiv.trim() &&
          record.syphilis.trim() &&
          record.urineProtein.trim() &&
          record.investigationSource.trim() &&
          record.otherTests.trim(),
      ),
    },
    {
      label: 'Assessment and follow-up',
      complete: Boolean(record.riskFactors.trim() && record.missingAssessments.trim() && record.followUp.trim()),
    },
    { label: 'Initial care plan', complete: Boolean(record.carePlan.trim()) },
  ];

  const missing = items.filter((item) => !item.complete);
  return {
    items,
    missing,
    percent: Math.round(((items.length - missing.length) / items.length) * 100),
  };
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  return (
    date.getFullYear() === Number(yearText) &&
    date.getMonth() === Number(monthText) - 1 &&
    date.getDate() === Number(dayText)
  );
}

function isPositiveNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0;
}
