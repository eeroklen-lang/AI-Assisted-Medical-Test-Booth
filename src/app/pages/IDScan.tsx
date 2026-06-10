import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { backgroundImage, logoImage } from '../lib/assets';
import { MOCK_PATIENT } from '../lib/mockPatient';

export function IDScan() {
  const navigate = useNavigate();
  const { setPatient } = useApp();

  useEffect(() => {
    // Simulate a 3-second card scan, then populate the flow with the demo patient.
    const timer = setTimeout(() => {
      setPatient(MOCK_PATIENT);
      navigate('/welcome');
    }, 3400);

    return () => clearTimeout(timer);
  }, [navigate, setPatient]);

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

        {/* Scanning Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85 }}
          className="mb-16"
        >
          {/* Card Slot with Pulsing Effect */}
          <motion.div
            className="relative w-96 h-64 rounded-3xl border-4 border-white/40 flex items-center justify-center"
            animate={{
              borderColor: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Card Icon */}
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CreditCard className="w-32 h-32 text-white/60" />
            </motion.div>

            {/* Scanning Line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="text-center space-y-6"
        >
          <h1 className="text-6xl text-white tracking-tight">Scan Your Finnish ID Card</h1>
          <div className="w-64 h-px bg-white/30 mx-auto" />
          <p className="text-3xl text-white/70">Place your card on the reader</p>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex gap-4 mt-20">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-4 h-4 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
