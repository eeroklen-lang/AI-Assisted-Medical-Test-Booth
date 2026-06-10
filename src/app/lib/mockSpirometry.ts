export const MOCK_SPIROMETRY_ATTEMPTS = [
  { fvc: 3.61, fev1: 3.02, pef: 7.0, fvcPred: 4.0, fev1Pred: 3.3, fvcPct: 90.3, fev1Pct: 91.5 },
  { fvc: 3.74, fev1: 3.14, pef: 7.2, fvcPred: 4.0, fev1Pred: 3.3, fvcPct: 93.5, fev1Pct: 95.2 },
  { fvc: 3.82, fev1: 3.21, pef: 7.4, fvcPred: 4.0, fev1Pred: 3.3, fvcPct: 95.5, fev1Pct: 97.3 },
] as const;

export const MOCK_SPIROMETRY_BEST = MOCK_SPIROMETRY_ATTEMPTS[MOCK_SPIROMETRY_ATTEMPTS.length - 1];

export const MOCK_SPIROMETRY_SUMMARY =
  'Best of three acceptable blows selected. Lung function is within normal limits with no evidence of obstruction or restriction.';

export function buildMockFlowVolumeCurve(fvcMeasured: number, pefMeasured: number) {
  const points: { volume: number; flow: number }[] = [];
  for (let i = 0; i <= 50; i++) {
    const v = (i / 50) * fvcMeasured;
    const t = v / fvcMeasured;
    const flow = t < 0.15
      ? (t / 0.15) * pefMeasured
      : pefMeasured * Math.pow(1 - (t - 0.15) / 0.85, 0.6);
    points.push({ volume: parseFloat(v.toFixed(3)), flow: parseFloat(Math.max(0, flow).toFixed(3)) });
  }
  return points;
}
