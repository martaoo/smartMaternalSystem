/** WHO maternal tetanus toxoid schedule (TD1–TD5). */
export const MATERNAL_TD_VACCINES = [
  { code: 'TT1', doseNumber: 1, label: 'TD1 — Tetanus Toxoid 1', intervalWeeks: 4 },
  { code: 'TT2', doseNumber: 2, label: 'TD2 — Tetanus Toxoid 2', intervalWeeks: 26 },
  { code: 'TT3', doseNumber: 3, label: 'TD3 — Tetanus Toxoid 3', intervalWeeks: 52 },
  { code: 'TT4', doseNumber: 4, label: 'TD4 — Tetanus Toxoid 4', intervalWeeks: 52 },
  { code: 'TT5', doseNumber: 5, label: 'TD5 — Tetanus Toxoid 5', intervalWeeks: 52 },
] as const;

export interface MaternalVaccineRecord {
  _id: string;
  vaccineName: string;
  doseNumber: number;
  givenDate: string;
  nextDoseDate?: string;
  status: 'GIVEN' | 'SCHEDULED' | 'MISSED' | 'NOT_APPLICABLE';
  batchNumber?: string;
  notes?: string;
}

function matchesDose(record: MaternalVaccineRecord, code: string, doseNumber: number) {
  return (
    record.vaccineName === code ||
    record.doseNumber === doseNumber ||
    record.vaccineName?.toUpperCase().includes(`TT${doseNumber}`)
  );
}

/** Next TD dose the mother may receive; null if complete or pending scheduled dose exists. */
export function getNextEligibleTdDose(history: MaternalVaccineRecord[]): string | null {
  for (const td of MATERNAL_TD_VACCINES) {
    const records = history.filter(r => matchesDose(r, td.code, td.doseNumber));
    const given = records.some(r => r.status === 'GIVEN');
    const scheduled = records.some(r => r.status === 'SCHEDULED');
    if (scheduled) return null;
    if (!given) return td.code;
  }
  return null;
}

export function getTdVaccineInfo(code: string) {
  return MATERNAL_TD_VACCINES.find(v => v.code === code);
}

export function calculateSuggestedNextTdDate(
  vaccineCode: string,
  administeredDate: string,
): string {
  const info = getTdVaccineInfo(vaccineCode);
  if (!info || vaccineCode === 'TT5') return '';
  const nextTd = MATERNAL_TD_VACCINES.find(v => v.doseNumber === info.doseNumber + 1);
  if (!nextTd) return '';
  const d = new Date(administeredDate);
  d.setDate(d.getDate() + nextTd.intervalWeeks * 7);
  return d.toISOString().split('T')[0];
}
