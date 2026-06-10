import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Printer, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { backgroundImage, logoImage } from '../lib/assets';

function patternToStatus(pattern: string): string {
  switch (pattern) {
    case 'Normal': return 'Good';
    case 'Obstructive': return 'Reduced';
    case 'Restrictive': return 'Reduced';
    case 'Mixed': return 'Mixed';
    default: return pattern;
  }
}

export function Results() {
  const navigate = useNavigate();
  const { sessionResult } = useApp();

  // Use real data if available, otherwise fall back to demo values
  const lungScore = sessionResult?.fev1_percent_pred
    ? Math.round(sessionResult.fev1_percent_pred)
    : sessionResult?.ai_confidence
    ? Math.round(sessionResult.ai_confidence <= 1 ? sessionResult.ai_confidence * 100 : sessionResult.ai_confidence)
    : 87;

  const status = sessionResult
    ? patternToStatus(sessionResult.ai_pattern)
    : 'Good';

  const fvc = sessionResult ? sessionResult.fvc_measured.toFixed(2) : '3.82';
  const fev1 = sessionResult ? sessionResult.fev1_measured.toFixed(2) : '3.21';
  const ratio = sessionResult ? sessionResult.fev1_fvc_ratio.toFixed(1) : '84.0';

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-between px-16 py-20">

        {/* Header with Logo */}
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="w-px h-16 bg-white/30" />
          <h1 className="text-7xl text-white tracking-tight">Your Results</h1>
        </motion.div>

        {/* Results Grid */}
        <div className="flex-1 flex items-center justify-center gap-16 w-full max-w-7xl">

          {/* Lung Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="relative flex h-96 w-96 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10">
              <motion.div
                className="absolute h-72 w-72 rounded-full border border-cyan-100/20"
                animate={{ scale: [0.94, 1.04, 0.94], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute h-56 w-56 rounded-full border border-white/15"
                animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              />
              <motion.svg
                viewBox="0 0 320 320"
                className="relative h-[18rem] w-[18rem]"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path
                  d="M160 72 L160 154"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M160 108 C142 112 126 124 120 142"
                  stroke="rgba(255,255,255,0.72)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M160 108 C178 112 194 124 200 142"
                  stroke="rgba(255,255,255,0.72)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
                <motion.path
                  d="M154 126 C120 122 86 138 72 178 C58 216 78 258 114 268 C144 276 160 250 160 220 L160 150 C160 136 158 129 154 126 Z"
                  fill="rgba(255,255,255,0.16)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="8"
                  animate={{ d: [
                    'M154 126 C120 122 86 138 72 178 C58 216 78 258 114 268 C144 276 160 250 160 220 L160 150 C160 136 158 129 154 126 Z',
                    'M154 122 C118 118 82 136 68 178 C54 218 78 262 116 272 C146 280 160 252 160 222 L160 148 C160 134 158 126 154 122 Z',
                    'M154 126 C120 122 86 138 72 178 C58 216 78 258 114 268 C144 276 160 250 160 220 L160 150 C160 136 158 129 154 126 Z',
                  ] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M166 126 C200 122 234 138 248 178 C262 216 242 258 206 268 C176 276 160 250 160 220 L160 150 C160 136 162 129 166 126 Z"
                  fill="rgba(198,244,255,0.18)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="8"
                  animate={{ d: [
                    'M166 126 C200 122 234 138 248 178 C262 216 242 258 206 268 C176 276 160 250 160 220 L160 150 C160 136 162 129 166 126 Z',
                    'M166 122 C202 118 238 136 252 178 C266 218 242 262 204 272 C174 280 160 252 160 222 L160 148 C160 134 162 126 166 122 Z',
                    'M166 126 C200 122 234 138 248 178 C262 216 242 258 206 268 C176 276 160 250 160 220 L160 150 C160 136 162 129 166 126 Z',
                  ] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Score Display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-center space-y-12"
          >
            <div className="relative inline-block">
              <svg className="w-80 h-80 transform -rotate-90">
                <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="20" fill="none" opacity="0.2" />
                <motion.circle
                  cx="160" cy="160" r="140"
                  stroke="white" strokeWidth="20" fill="none"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 140 * (1 - lungScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                >
                  <p className="text-9xl text-white">{lungScore}</p>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="border-2 border-white/40 rounded-full py-6 px-16 inline-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-4xl text-white">{status}</p>
            </motion.div>

            {/* Key metrics row */}
            <motion.div
              className="flex gap-12 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {[
                { label: 'FVC', value: `${fvc} L` },
                { label: 'FEV1', value: `${fev1} L` },
                { label: 'FEV1/FVC', value: `${ratio}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl text-white/50">{label}</p>
                  <p className="text-3xl text-white mt-1">{value}</p>
                </div>
              ))}
            </motion.div>

            <div className="w-96 h-px bg-white/20 mx-auto" />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="w-full max-w-4xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="grid grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white shadow-xl transition-all"
            >
              <div className="flex items-center justify-center gap-4">
                <Printer className="w-10 h-10" />
                <span className="text-3xl tracking-wide">Print</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white shadow-xl transition-all"
            >
              <div className="flex items-center justify-center gap-4">
                <Mail className="w-10 h-10" />
                <span className="text-3xl tracking-wide">Email</span>
              </div>
            </motion.button>
          </div>

          <p className="text-center text-2xl text-white/65">
            Your report can be printed or emailed now, and your doctor will also be able to review it.
          </p>

          <button
            onClick={() => navigate('/spirometer/logout')}
            className="w-full py-6 text-2xl text-white/50 hover:text-white/80 transition-colors"
          >
            Done
          </button>
        </motion.div>
      </div>
    </div>
  );
}
