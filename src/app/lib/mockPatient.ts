import type { Patient } from '../context/AppContext';

export const MOCK_PATIENT: Patient = {
  id: 1,
  patient_id: 'P-00101',
  first_name: 'Juhani',
  last_name: 'Korhonen',
  date_of_birth: '1968-04-15',
  sex: 'M',
  height_cm: 178,
  weight_kg: 82,
  age: 57,
};
