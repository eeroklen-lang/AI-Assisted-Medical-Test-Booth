import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Activity, CalendarDays, Fingerprint, MoveVertical, Scale, User, VenusAndMars } from 'lucide-react';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { backgroundImage, logoImage } from '../lib/assets';
import { getMockScanData } from '../lib/mockScan';

function formatSex(sex?: string) {
  if (sex === 'M') return 'Male';
  if (sex === 'F') return 'Female';
  return sex ?? 'Unknown';
}

export function Welcome() {
  const navigate = useNavigate();
  const { patient } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/confirm-details');
    }, 3700);
    return () => clearTimeout(timer);
  }, [navigate]);

  const displayName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : 'Patient';
  const scan = getMockScanData(patient);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-center px-16 py-20">
        {/* Logo at top */}
        <motion.div
          className="absolute top-20"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
        </motion.div>

        {/* Patient identification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85 }}
          className="text-center space-y-4 mb-10"
        >
          <div className="w-24 h-24 rounded-full border-2 border-white/40 flex items-center justify-center mx-auto">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-7xl text-white tracking-tight">Patient Identified</h1>
          <h2 className="text-6xl text-white/90">{displayName}</h2>
          <p className="text-2xl text-white/65">Reading demographic and measurement data from the booth sensors.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.75 }}
          className="grid w-full max-w-6xl grid-cols-3 gap-6"
        >
          {[
            { label: 'Patient ID', value: patient?.patient_id ?? '—', icon: Fingerprint },
            { label: 'Date of Birth', value: patient?.date_of_birth ?? '—', icon: CalendarDays },
            { label: 'Sex', value: formatSex(patient?.sex), icon: VenusAndMars },
            { label: 'Age', value: patient ? `${patient.age} years` : '—', icon: Activity },
            { label: 'Height', value: patient ? `${patient.height_cm} cm` : '—', icon: MoveVertical },
            { label: 'Weight', value: patient ? `${patient.weight_kg} kg` : '—', icon: Scale },
          ].map(({ label, value, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + index * 0.1, duration: 0.6 }}
              className="rounded-[1.75rem] border border-white/20 bg-white/8 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Icon className="h-7 w-7 text-white/70" />
              </div>
              <p className="text-lg uppercase tracking-[0.2em] text-white/45">{label}</p>
              <p className="mt-3 text-4xl text-white">{value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.7 }}
          className="mt-6 grid w-full max-w-6xl grid-cols-4 gap-5"
        >
          {[
            { label: 'Scan Source', value: scan.source },
            { label: 'Confidence', value: scan.confidence },
            { label: 'Captured At', value: scan.capturedAt },
            { label: 'Scan ID', value: scan.scanId },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-white/15 bg-slate-950/20 px-5 py-4 text-white backdrop-blur-sm"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">{label}</p>
              <p className="mt-2 text-2xl">{value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="absolute bottom-18 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/15 bg-white/8 px-8 py-4 backdrop-blur-sm"
        >
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.45, 1], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-3 w-3 rounded-full bg-white"
              />
            ))}
          </div>
          <p className="text-xl text-white/75">Preparing confirmation screen</p>
        </motion.div>
      </div>
    </div>
  );
}
