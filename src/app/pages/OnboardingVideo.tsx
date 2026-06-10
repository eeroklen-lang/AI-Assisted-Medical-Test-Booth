import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { backgroundImage, logoImage } from '../lib/assets';
import { AssistActions } from '../components/AssistActions';

const onboardingLines = [
  'Hello, welcome to the Oivio automated test system',
  'This quick breathing test takes about 3 to 5 minutes',
  'Follow the guided instructions and ask for help at any time',
] as const;

export function OnboardingVideo() {
  const navigate = useNavigate();
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = onboardingLines.map((_, index) =>
      window.setTimeout(() => {
        setVisibleLines((current) => Math.max(current, index + 1));
      }, 350 + index * 700),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

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
          <h1 className="text-7xl text-white tracking-tight">Automated Test Booth</h1>
        </motion.div>

        {/* Animated Text Area */}
        <motion.div 
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            <motion.div
              className="absolute h-[28rem] w-[28rem] rounded-full bg-cyan-300/10 blur-3xl"
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.94, 1.06, 0.94] }}
              transition={{ duration: 3.2, repeat: Infinity }}
            />
            <motion.div
              className="absolute h-[20rem] w-[20rem] rounded-full border border-white/15"
              animate={{ scale: [0.9, 1.08], opacity: [0.7, 0] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute left-10 top-10 text-white/35"
              animate={{ y: [0, -10, 0], rotate: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.6, repeat: Infinity }}
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <motion.div
              className="absolute bottom-16 right-16 text-cyan-100/40"
              animate={{ y: [0, 12, 0], rotate: [0, 8, 0], opacity: [0.25, 0.75, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
            >
              <Sparkles className="h-10 w-10" />
            </motion.div>
            <motion.div
              className="relative mx-auto max-w-4xl px-14 py-16 text-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/75">Onboarding</p>
              <div className="mt-8 space-y-6">
                {onboardingLines.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 20 }}
                    animate={visibleLines > index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className={
                      index === 0
                        ? 'text-6xl leading-[1.1] tracking-tight text-white'
                        : index === 1
                          ? 'text-3xl leading-relaxed text-white/78'
                          : 'text-2xl text-white/58'
                    }
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="w-full max-w-4xl space-y-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          {/* Continue Button */}
          <motion.button
            onClick={() => navigate('/spirometer/questionnaire')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
          >
            <span className="text-4xl tracking-wide">Continue</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
