import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';

export function Step1() {
  const navigate = useNavigate();

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
          transition={{ duration: 0.8 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="w-px h-16 bg-white/30" />
          <h1 className="text-7xl text-white tracking-tight">Step 1 of 3</h1>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center space-y-12"
        >
          {/* Visual */}
          <div className="relative flex h-80 w-80 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10">
            <motion.div
              className="absolute h-52 w-52 rounded-full border border-cyan-100/25"
              animate={{ scale: [0.92, 1.08], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute h-36 w-36 rounded-full border border-white/25"
              animate={{ scale: [1, 1.14, 1], opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/30 bg-cyan-200/10">
              <Droplets className="h-16 w-16 text-white/80" />
            </div>
          </div>

          {/* Number */}
          <div className="w-32 h-32 rounded-full border-4 border-white/40 flex items-center justify-center">
            <span className="text-7xl text-white">1</span>
          </div>

          {/* Title */}
          <div className="text-center space-y-6">
            <div className="w-48 h-px bg-white/30 mx-auto" />
            <h2 className="text-7xl text-white tracking-tight">Sanitize</h2>
            <div className="w-48 h-px bg-white/30 mx-auto" />
            <p className="text-3xl text-white/70 max-w-2xl">Clean your hands thoroughly before handling the equipment</p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          onClick={() => navigate('/spirometer/step2')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-4xl py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
        >
          <span className="text-4xl tracking-wide">Next Step →</span>
        </motion.button>
      </div>
    </div>
  );
}
