import type { Patient } from '../context/AppContext';

export function getMockScanData(patient: Patient | null) {
  const height = patient?.height_cm ?? 178;
  const weight = patient?.weight_kg ?? 82;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  return {
    scanId: `SCAN-${patient?.patient_id ?? 'P-00101'}-042`,
    boothId: 'BOOTH-01',
    source: 'Finnish ID card + booth sensors',
    confidence: '98.7%',
    capturedAt: '09:42',
    visitType: 'Respiratory screening',
    bloodPressure: '128 / 79',
    pulse: '72 bpm',
    spo2: '98%',
    bmi: `${bmi} BMI`,
  };
}
