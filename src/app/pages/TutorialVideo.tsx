import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleDot, Play, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { backgroundImage, logoImage } from '../lib/assets';
import { AssistActions } from '../components/AssistActions';

const tutorialSteps = [
  {
    title: 'Sit upright',
    description: 'Keep your back straight and feet flat on the floor.',
    cue: 'Get ready',
  },
  {
    title: 'Seal lips tightly',
    description: 'Place the mouthpiece in your mouth and keep the nose clip on.',
    cue: 'Tight seal',
  },
  {
    title: 'Take the deepest breath possible',
    description: 'Fill your lungs fully before you begin blowing.',
    cue: 'Big breath in',
  },
  {
    title: 'Blow out hard and keep going',
    description: 'Blow as fast and as long as you can until told to stop.',
    cue: 'Fast and long',
  },
] as const;

export function TutorialVideo() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % tutorialSteps.length);
    }, 2600);

    return () => window.clearInterval(timer);
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
          <h1 className="text-7xl text-white tracking-tight">Watch Tutorial</h1>
        </motion.div>

        {/* Instruction Video Area */}
        <motion.div 
          className="flex-1 flex w-full items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="grid w-full max-w-6xl grid-cols-[1.3fr_0.9fr] gap-10">
            <motion.div
              className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950/30 p-10 backdrop-blur-sm"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <div className="absolute right-8 top-8 flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white/75">
                <Play className="h-5 w-5" />
                <span className="text-lg">Instruction Video</span>
              </div>

              <div className="flex h-[28rem] items-center justify-center">
                <div className="relative flex h-80 w-80 items-center justify-center">
                  <motion.div
                    className="absolute h-64 w-64 rounded-full border border-white/15 bg-white/5"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute h-48 w-48 rounded-full border-2 border-white/20"
                    animate={{ scale: [0.92, 1.18], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <motion.div
                    key={tutorialSteps[activeStep].title}
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-white/30 bg-white/10"
                  >
                    {activeStep < 2 ? (
                      <CircleDot className="h-20 w-20 text-white/80" />
                    ) : (
                      <Wind className="h-20 w-20 text-white/80" />
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="flex gap-3">
                {tutorialSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`h-2 flex-1 rounded-full transition ${
                      index === activeStep ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col justify-center rounded-[2.5rem] border border-white/20 bg-white/8 p-10 text-white backdrop-blur-sm"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Current Instruction</p>
              <motion.h2
                key={tutorialSteps[activeStep].title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-5xl tracking-tight"
              >
                {tutorialSteps[activeStep].title}
              </motion.h2>
              <motion.p
                key={tutorialSteps[activeStep].description}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-2xl leading-relaxed text-white/75"
              >
                {tutorialSteps[activeStep].description}
              </motion.p>

              <div className="mt-10 rounded-[1.75rem] border border-white/15 bg-slate-950/20 p-6">
                <p className="text-lg uppercase tracking-[0.28em] text-white/45">Key Cue</p>
                <p className="mt-3 text-4xl">{tutorialSteps[activeStep].cue}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="w-full max-w-4xl space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Start Test Button */}
          <motion.button
            onClick={() => navigate('/spirometer/test')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
          >
            <span className="text-4xl tracking-wide">Start Test</span>
          </motion.button>
          
          {/* Skip */}
          <button
            onClick={() => navigate('/spirometer/test')}
            className="w-full text-2xl text-white/50 hover:text-white/80 transition-colors py-4"
          >
            Skip
          </button>
        </motion.div>
      </div>
    </div>
  );
}
