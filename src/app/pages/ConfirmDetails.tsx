import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CalendarDays, CheckCircle2, CircleUserRound, Fingerprint, MoveVertical, Scale, UserRound } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';
import { useApp } from '../context/AppContext';
import { getMockScanData } from '../lib/mockScan';

function formatSex(sex?: string) {
  if (sex === 'M') return 'Male';
  if (sex === 'F') return 'Female';
  return sex ?? 'Unknown';
}

const fallbackPatient = {
  first_name: 'Patient',
  last_name: '',
  patient_id: 'Unavailable',
  date_of_birth: 'Unavailable',
  sex: 'Unknown',
  age: 'Unknown',
  height_cm: '—',
  weight_kg: '—',
};

export function ConfirmDetails() {
  const navigate = useNavigate();
  const { patient } = useApp();
  const scan = getMockScanData(patient);

  const details = patient
    ? {
        first_name: patient.first_name,
        last_name: patient.last_name,
        patient_id: patient.patient_id,
        date_of_birth: patient.date_of_birth,
        sex: formatSex(patient.sex),
        age: `${patient.age} years`,
        height_cm: `${patient.height_cm} cm`,
        weight_kg: `${patient.weight_kg} kg`,
      }
    : fallbackPatient;

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-slate-950/35" />

      <div className="relative flex h-full w-full flex-col px-16 py-20">
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="h-16 w-px bg-white/30" />
          <h1 className="text-7xl tracking-tight text-white">Confirm Your Details</h1>
        </motion.div>

        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid w-full max-w-6xl grid-cols-2 gap-6"
          >
            {[
              { label: 'Full Name', value: `${details.first_name} ${details.last_name}`.trim(), icon: UserRound },
              { label: 'Patient ID', value: details.patient_id, icon: Fingerprint },
              { label: 'Date of Birth', value: details.date_of_birth, icon: CalendarDays },
              { label: 'Sex', value: details.sex, icon: CircleUserRound },
              { label: 'Measured Height', value: details.height_cm, icon: MoveVertical },
              { label: 'Measured Weight', value: details.weight_kg, icon: Scale },
              { label: 'Scan ID', value: scan.scanId, icon: Fingerprint },
              { label: 'Visit Type', value: scan.visitType, icon: UserRound },
              { label: 'Booth ID', value: scan.boothId, icon: Fingerprint },
              { label: 'Blood Pressure', value: scan.bloodPressure, icon: Scale },
              { label: 'Pulse', value: scan.pulse, icon: Scale },
              { label: 'SpO2', value: scan.spo2, icon: Scale },
            ].map(({ label, value, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: index % 2 === 0 ? -32 : 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.07, duration: 0.6 }}
                className="rounded-[2rem] border border-white/20 bg-white/8 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Icon className="h-8 w-8 text-white/75" />
                  </div>
                  <div>
                    <p className="text-xl uppercase tracking-[0.2em] text-white/45">{label}</p>
                    <p className="mt-2 text-4xl text-white">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="mx-auto flex w-full max-w-5xl items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
        >
          <div className="flex items-center gap-4 text-white/70">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <p className="text-2xl">Please confirm the scanned information before starting the test.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full border-2 border-white/40 px-14 py-6 text-3xl text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Confirm
          </button>
        </motion.div>
      </div>
    </div>
  );
}
