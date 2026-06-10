import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Progress } from '../components/ui/progress';
import { AssistActions } from '../components/AssistActions';
import { useApp } from '../context/AppContext';
import { backgroundImage, logoImage } from '../lib/assets';
import { buildMockFlowVolumeCurve, MOCK_SPIROMETRY_ATTEMPTS, MOCK_SPIROMETRY_SUMMARY } from '../lib/mockSpirometry';

interface Floret {
  id: number;
  x: number;
  y: number;
  angle: number;
}

const encouragements = [
  'Breathe deep',
  'Keep going',
  'Almost there',
  'Perfect',
];

const TOTAL_ATTEMPTS = 3;
const ATTEMPT_DURATION_MS = 6000;
const TICK_MS = 100;

function createFlorets(): Floret[] {
  return Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const radius = 60 + Math.random() * 30;
    return { id: i, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, angle };
  });
}

export function SpirometryTest() {
  const navigate = useNavigate();
  const { patient, setTestPayload } = useApp();

  const [florets, setFlorets] = useState<Floret[]>(() => createFlorets());
  const [progress, setProgress] = useState(0);
  const [isBlowing, setIsBlowing] = useState(false);
  const [currentEncouragement, setCurrentEncouragement] = useState(encouragements[0]);
  const [attempt, setAttempt] = useState(1);
  const [completedAttempts, setCompletedAttempts] = useState<number[]>([]);
  const [attemptComplete, setAttemptComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const advancingAttemptRef = useRef(false);
  const elapsedMsRef = useRef(0);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const index = Math.floor((progress / 100) * encouragements.length);
      setCurrentEncouragement(encouragements[Math.min(index, encouragements.length - 1)]);
    }
  }, [progress]);

  useEffect(() => {
    if (progress !== 100 || advancingAttemptRef.current) {
      return;
    }

    advancingAttemptRef.current = true;
    stopBlowing();
    setAttemptComplete(true);
    setCompletedAttempts((prev) => (prev.includes(attempt) ? prev : [...prev, attempt]));
    setCurrentEncouragement(attempt < TOTAL_ATTEMPTS ? 'Great job' : 'All attempts complete');

    if (attempt < TOTAL_ATTEMPTS) {
      window.setTimeout(() => {
        setAttempt((prev) => prev + 1);
        setProgress(0);
        elapsedMsRef.current = 0;
        setFlorets(createFlorets());
        setAttemptComplete(false);
        setCurrentEncouragement(encouragements[0]);
        advancingAttemptRef.current = false;
      }, 1400);
      return;
    }

    const bestAttempt = MOCK_SPIROMETRY_ATTEMPTS[MOCK_SPIROMETRY_ATTEMPTS.length - 1];
    if (patient) {
      setTestPayload({
        patient_id: patient.id,
        fvc_measured: bestAttempt.fvc,
        fev1_measured: bestAttempt.fev1,
        pef_measured: bestAttempt.pef,
        fvc_predicted: bestAttempt.fvcPred,
        fev1_predicted: bestAttempt.fev1Pred,
        fvc_percent_pred: bestAttempt.fvcPct,
        fev1_percent_pred: bestAttempt.fev1Pct,
        ai_pattern: 'Normal',
        ai_severity: null,
        ai_confidence: 0.94,
        ai_summary: MOCK_SPIROMETRY_SUMMARY,
        flowVolumeCurve: buildMockFlowVolumeCurve(bestAttempt.fvc, bestAttempt.pef),
      });
    }

    window.setTimeout(() => {
      advancingAttemptRef.current = false;
      navigate('/spirometer/processing');
    }, 1500);
  }, [attempt, navigate, patient, progress, setTestPayload]);

  const updateBlowProgress = () => {
    setFlorets((prev) => {
      if (prev.length === 0) return prev;
      const nextElapsed = Math.min(elapsedMsRef.current + TICK_MS, ATTEMPT_DURATION_MS);
      elapsedMsRef.current = nextElapsed;
      const nextProgress = (nextElapsed / ATTEMPT_DURATION_MS) * 100;
      const expectedRemaining = Math.round(40 * (1 - nextProgress / 100));
      const remaining = prev.slice(0, Math.max(expectedRemaining, 0));
      setProgress(nextProgress);
      return remaining;
    });
  };

  const startBlowing = () => {
    if (florets.length === 0 || attemptComplete) return;
    if (isBlowing) return;
    setIsBlowing(true);
    intervalRef.current = window.setInterval(updateBlowProgress, TICK_MS);
  };

  const stopBlowing = () => {
    setIsBlowing(false);
    if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const remainingSeconds = Math.max(0, (ATTEMPT_DURATION_MS - elapsedMsRef.current) / 1000);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="relative w-full h-full flex flex-col items-center justify-between px-16 py-20">
        <AssistActions />

        {/* Header with Logo */}
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="w-px h-16 bg-white/30" />
          <motion.p
            key={currentEncouragement}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-7xl text-white tracking-tight"
          >
            {currentEncouragement}
          </motion.p>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 rounded-full border border-white/15 bg-white/8 px-8 py-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-2xl text-white/65">Attempt</span>
          <span className="text-4xl text-white">{attempt}</span>
          <span className="text-2xl text-white/45">/ {TOTAL_ATTEMPTS}</span>
        </motion.div>

        {/* Dandelion Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative flex h-[520px] w-[520px] items-center justify-center">
            {/* Stem */}
            <motion.div
              className="absolute bottom-0 w-4 h-64 rounded-full bg-white/20 border border-white/30"
              style={{ transform: 'translateY(160px)' }}
              animate={isBlowing ? { x: [0, -4, 4, -3, 3, 0] } : {}}
              transition={{ duration: 0.3, repeat: isBlowing ? Infinity : 0 }}
            />

            {/* Center */}
            <motion.div
              className="relative w-32 h-32 rounded-full border-2 border-white/40 z-10"
              animate={isBlowing ? { scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 0.2, repeat: isBlowing ? Infinity : 0 }}
            >
              <div className="absolute inset-4 rounded-full bg-white/10" />
            </motion.div>

            {/* Florets */}
            <AnimatePresence>
              {florets.map((floret) => (
                <motion.div
                  key={floret.id}
                  initial={{ x: floret.x, y: floret.y, opacity: 1, scale: 1 }}
                  exit={{
                    x: floret.x * 5 + (Math.random() - 0.5) * 200,
                    y: floret.y * 4 - 800 - Math.random() * 400,
                    opacity: 0,
                    scale: 0.3,
                    rotate: Math.random() * 1080 - 540,
                  }}
                  transition={{ duration: 2.5 + Math.random() * 1, ease: [0.23, 0.86, 0.39, 0.96] }}
                  className="absolute pointer-events-none"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <svg width="20" height="32" viewBox="0 0 20 32" className="drop-shadow-2xl">
                    <ellipse cx="10" cy="28" rx="1.5" ry="2" fill="#8B7355" opacity="0.9" />
                    <line x1="10" y1="28" x2="10" y2="12" stroke="#A0826D" strokeWidth="0.8" opacity="0.8" />
                    <g opacity="0.95">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const angle = (i / 20) * Math.PI * 2;
                        const x1 = 10 + Math.cos(angle) * 2;
                        const y1 = 12 + Math.sin(angle) * 1;
                        const x2 = 10 + Math.cos(angle) * 8;
                        const y2 = 12 + Math.sin(angle) * 4;
                        return (
                          <g key={i}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" opacity="0.9" />
                            {Array.from({ length: 4 }).map((_, j) => {
                              const t = (j + 1) / 5;
                              const bx = x1 + (x2 - x1) * t;
                              const by = y1 + (y2 - y1) * t;
                              const ba = angle + Math.PI / 2;
                              const bl = 1.5 - j * 0.3;
                              return (
                                <line key={j} x1={bx} y1={by}
                                  x2={bx + Math.cos(ba) * bl} y2={by + Math.sin(ba) * bl * 0.5}
                                  stroke="white" strokeWidth="0.3" opacity="0.7" />
                              );
                            })}
                            <circle cx={x2} cy={y2} r="0.6" fill="white" opacity="0.95" />
                          </g>
                        );
                      })}
                      <circle cx="10" cy="12" r="1.5" fill="white" opacity="0.8" />
                    </g>
                  </svg>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Blow effect rings */}
            <AnimatePresence>
              {isBlowing && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute w-32 h-32 rounded-full border-2 border-white/40"
                  />
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="absolute w-32 h-32 rounded-full border-2 border-white/30"
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Section */}
        <motion.div
          className="w-full max-w-4xl space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
        >
          <div className="border-t border-white/20 pt-8 space-y-6">
            <div className="flex justify-between items-center px-4">
              <span className="text-3xl text-white/70">Time Remaining</span>
              <span className="text-4xl text-white">{remainingSeconds.toFixed(1)}s</span>
            </div>
            <Progress value={progress} className="h-4" />
            <div className="flex items-center justify-between px-4">
              <span className="text-2xl text-white/60">Completed Attempts</span>
              <span className="text-2xl text-white">{completedAttempts.length} / {TOTAL_ATTEMPTS}</span>
            </div>
          </div>

          {progress < 100 ? (
            <motion.button
              onMouseDown={startBlowing}
              onMouseUp={stopBlowing}
              onMouseLeave={stopBlowing}
              onTouchStart={startBlowing}
              onTouchEnd={stopBlowing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-12 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all ${
                isBlowing ? 'border-white/60 bg-white/10' : ''
              }`}
            >
              <span className="text-4xl tracking-wide">
                {isBlowing ? 'Blowing...' : 'Hold to Blow'}
              </span>
            </motion.button>
          ) : (
            <div className="w-full rounded-full border-2 border-white/25 bg-white/10 py-8 text-center text-white">
              <span className="text-3xl tracking-wide">
                {attempt < TOTAL_ATTEMPTS ? `Attempt ${attempt} complete. Preparing next blow...` : 'All three attempts complete.'}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
