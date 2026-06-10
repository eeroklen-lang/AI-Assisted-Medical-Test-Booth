/**
 * Thin API client for the AI Spirometry Booth backend.
 * All requests go to /api/* which is proxied to localhost:3001 by Vite.
 */

import { MOCK_RESULT_DETAIL, MOCK_RESULT_LIST } from './mockClinician';
import { MOCK_PATIENT } from './mockPatient';

const BASE = '/api';
const LOCAL_RESULTS_KEY = 'spirometry_local_results';

const DEMO_USERS = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@clinic.com',
    password: 'doctor123',
    role: 'doctor',
    department: 'Pulmonology',
  },
  {
    id: 3,
    name: 'Nurse Emma Virtanen',
    email: 'emma.virtanen@clinic.com',
    password: 'nurse123',
    role: 'nurse',
    department: 'Respiratory Clinic',
  },
  {
    id: 5,
    name: 'Admin User',
    email: 'admin@clinic.com',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  },
] as const;

const DEMO_PATIENTS = [
  {
    ...MOCK_PATIENT,
  },
];

function getStoredResults(): any[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_RESULTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredResults(results: any[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
}

function buildLocalResult(data: Record<string, unknown>) {
  const now = new Date();
  const isoDate = now.toISOString().split('T')[0];
  const timestampId = `${isoDate.replace(/-/g, '')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const sessionId = `SPR-${timestampId}`;

  const patient = DEMO_PATIENTS.find((item) => item.id === data.patient_id) ?? DEMO_PATIENTS[0];
  const result = {
    session_id: sessionId,
    test_date: isoDate,
    status: 'pending',
    ai_pattern: data.ai_pattern ?? 'Unknown',
    ai_severity: data.ai_severity ?? null,
    ai_confidence: data.ai_confidence ?? null,
    ai_summary: data.ai_summary ?? null,
    clinician_notes: '',
    first_name: patient.first_name,
    last_name: patient.last_name,
    pid: patient.patient_id,
    date_of_birth: patient.date_of_birth,
    sex: patient.sex,
    height_cm: patient.height_cm,
    weight_kg: patient.weight_kg,
    ethnicity: 'Caucasian',
    smoker: 1,
    patient_notes: 'Former smoker, 20 pack-years',
    performed_by_name: 'Booth Auto Intake',
    performed_by_role: 'booth',
    reviewed_by_name: null,
    fvc_measured: data.fvc_measured,
    fev1_measured: data.fev1_measured,
    fev1_fvc_ratio: Number((((data.fev1_measured as number) / (data.fvc_measured as number)) * 100).toFixed(1)),
    pef_measured: data.pef_measured ?? null,
    fef2575_measured: data.fef2575_measured ?? null,
    fvc_percent_pred: data.fvc_percent_pred ?? null,
    fev1_percent_pred: data.fev1_percent_pred ?? null,
    fvc_predicted: data.fvc_predicted ?? null,
    fev1_predicted: data.fev1_predicted ?? null,
    pef_predicted: data.pef_predicted ?? null,
    flowVolumeCurve: data.flowVolumeCurve ?? [],
  };

  const existing = getStoredResults();
  saveStoredResults([result, ...existing.filter((item) => item.session_id !== sessionId)]);
  return result;
}

function mergeResultsWithLocal(results: any[]) {
  const local = getStoredResults();
  const merged = [...local];

  for (const result of results) {
    if (!merged.some((item) => item.session_id === result.session_id)) {
      merged.push(result);
    }
  }

  return merged.sort((a, b) => `${b.test_date}${b.session_id}`.localeCompare(`${a.test_date}${a.session_id}`));
}

function buildStats(results: any[]) {
  return {
    total: results.length,
    pending: results.filter((item) => item.status === 'pending').length,
    reviewed: results.filter((item) => item.status === 'reviewed').length,
    flagged: results.filter((item) => item.status === 'flagged').length,
    normal: results.filter((item) => item.ai_pattern === 'Normal').length,
    obstructive: results.filter((item) => item.ai_pattern === 'Obstructive').length,
    restrictive: results.filter((item) => item.ai_pattern === 'Restrictive').length,
    mixed: results.filter((item) => item.ai_pattern === 'Mixed').length,
  };
}

function fallbackLogin(email: string, password: string): LoginResponse {
  const user = DEMO_USERS.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password
  );

  if (!user) {
    throw new Error('Invalid credentials');
  }

  return {
    token: `demo-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string | null;
  };
}

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Login failed');
    }

    return res.json() as Promise<LoginResponse>;
  } catch (error) {
    if (error instanceof TypeError) {
      return fallbackLogin(email, password);
    }

    throw error;
  }
}

// ── Patients ──────────────────────────────────────────────────────────────────

function authHeaders(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function findPatients(search: string, token?: string | null, limit = 1) {
  try {
    const params = new URLSearchParams({ search, limit: String(limit) });
    const res = await fetch(`${BASE}/patients?${params}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Patient lookup failed');
    return res.json() as Promise<{ patients: any[]; total: number }>;
  } catch (error) {
    if (error instanceof TypeError) {
      return { patients: DEMO_PATIENTS.slice(0, limit), total: DEMO_PATIENTS.length };
    }

    throw error;
  }
}

// ── Results ───────────────────────────────────────────────────────────────────

export async function submitResult(data: Record<string, unknown>, token?: string | null) {
  try {
    const res = await fetch(`${BASE}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error ?? 'Failed to submit result');
    }
    return res.json() as Promise<{ result: any; session_id: string }>;
  } catch (error) {
    if (error instanceof TypeError) {
      const result = buildLocalResult(data);
      return { result, session_id: result.session_id };
    }

    throw error;
  }
}

export async function getResult(sessionId: string, token?: string | null) {
  try {
    const res = await fetch(`${BASE}/results/${sessionId}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch result');
    return res.json() as Promise<{ result: any }>;
  } catch (error) {
    if (error instanceof TypeError) {
      const localResult = getStoredResults().find((item) => item.session_id === sessionId);
      return { result: localResult ?? MOCK_RESULT_DETAIL[sessionId] ?? MOCK_RESULT_DETAIL['SPR-20260329-001'] };
    }

    throw error;
  }
}

export async function listResults(
  params: Record<string, string | number | undefined>,
  token?: string | null
) {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    }

    const res = await fetch(`${BASE}/results?${query}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch results');
    const data = await res.json() as {
      results: any[];
      total: number;
      limit: number;
      offset: number;
      stats: Record<string, number>;
    };
    const mergedResults = mergeResultsWithLocal(data.results);
    return {
      ...data,
      results: mergedResults,
      total: mergedResults.length,
      stats: buildStats(mergedResults),
    };
  } catch (error) {
    if (error instanceof TypeError) {
      const mergedResults = mergeResultsWithLocal(MOCK_RESULT_LIST.results);
      return {
        ...MOCK_RESULT_LIST,
        results: mergedResults,
        total: mergedResults.length,
        stats: buildStats(mergedResults),
      };
    }

    throw error;
  }
}
