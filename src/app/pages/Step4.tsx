import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { backgroundImage, logoImage } from '../lib/assets';

export function Step4() {
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
          <h1 className="text-7xl text-white tracking-tight">Step 4 of 4</h1>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center space-y-12"
        >
          {/* Image */}
          <div className="w-80 h-80 rounded-3xl overflow-hidden border-4 border-white/30">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1638332746371-9461a7734121?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3NlJTIwY2xpcCUyMHN3aW1taW5nfGVufDF8fHx8MTc3NDcyNzQ0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Nose Clip"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Number */}
          <div className="w-32 h-32 rounded-full border-4 border-white/40 flex items-center justify-center">
            <span className="text-7xl text-white">4</span>
          </div>

          {/* Title */}
          <div className="text-center space-y-6">
            <div className="w-48 h-px bg-white/30 mx-auto" />
            <h2 className="text-7xl text-white tracking-tight">Nose Clip</h2>
            <div className="w-48 h-px bg-white/30 mx-auto" />
            <p className="text-3xl text-white/70 max-w-2xl">Attach the nose clip to ensure all air goes through the device</p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          onClick={() => navigate('/spirometer/tutorial')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-4xl py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
        >
          <span className="text-4xl tracking-wide">Continue to Tutorial →</span>
        </motion.button>
      </div>
    </div>
  );
}
