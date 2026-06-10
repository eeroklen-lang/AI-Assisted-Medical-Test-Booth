import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submitResult } from '../lib/api';
import { backgroundImage, logoImage } from '../lib/assets';

export function Processing() {
  const navigate = useNavigate();
  const { token, testPayload, setSessionResult } = useApp();
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    async function submit() {
      if (testPayload) {
        try {
          // Demo mode: skip auth, just submit
          const data = await submitResult(testPayload as unknown as Record<string, unknown>, token);
          setSessionResult(data.result);
        } catch (e) {
          console.error('Failed to submit result:', e);
          // Fall through to education screen even if submission fails
        }
      }
      // After analysis, proceed to mouthpiece disposal before scheduling follow-up.
      setTimeout(() => navigate('/spirometer/disposal'), 1300);
    }

    submit();
  }, [navigate, setSessionResult, testPayload, token]);

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

        {/* Loading Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-20"
        >
          <div className="w-56 h-56 rounded-full border-4 border-white/40 flex items-center justify-center">
            <Loader2 className="w-28 h-28 text-white" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
        >
          <h1 className="text-8xl text-white tracking-tight">Analyzing</h1>
          <div className="w-64 h-px bg-white/30 mx-auto" />
        </motion.div>

        {/* Progress Dots */}
        <div className="flex gap-6 mt-20">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-6 h-6 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
