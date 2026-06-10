import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

export interface Patient {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: string;
  height_cm: number;
  weight_kg: number;
  age: number;
}

export interface TestSession {
  session_id: string;
  fvc_measured: number;
  fev1_measured: number;
  fev1_fvc_ratio: number;
  pef_measured: number;
  fvc_percent_pred: number | null;
  fev1_percent_pred: number | null;
  ai_pattern: string;
  ai_severity: string | null;
  ai_confidence: number | null;
  ai_summary: string | null;
  clinician_notes?: string | null;
}

// The spirometry payload assembled after the test animation completes,
// ready to be submitted to POST /api/results
export interface TestPayload {
  patient_id: number;
  fvc_measured: number;
  fev1_measured: number;
  pef_measured: number;
  fvc_predicted: number;
  fev1_predicted: number;
  fvc_percent_pred: number;
  fev1_percent_pred: number;
  ai_pattern: string;
  ai_severity: string | null;
  ai_confidence: number;
  ai_summary: string;
  flowVolumeCurve: { volume: number; flow: number }[];
}

interface AppContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  testPayload: TestPayload | null;
  setTestPayload: (payload: TestPayload | null) => void;
  sessionResult: TestSession | null;
  setSessionResult: (session: TestSession | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [testPayload, setTestPayload] = useState<TestPayload | null>(null);
  const [sessionResult, setSessionResult] = useState<TestSession | null>(null);

  const value = useMemo(() => ({
    token,
    setToken,
    user,
    setUser,
    patient,
    setPatient,
    testPayload,
    setTestPayload,
    sessionResult,
    setSessionResult,
  }), [token, user, patient, testPayload, sessionResult]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
