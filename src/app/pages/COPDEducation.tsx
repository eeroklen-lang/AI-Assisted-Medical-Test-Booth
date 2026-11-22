import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Heart, Users, AlertCircle, MessageCircle, Share2 } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';

export function COPDEducation() {
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
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="w-24 h-24 rounded-full border-2 border-white/40 flex items-center justify-center">
              <Heart className="w-12 h-12 text-rose-300" />
            </div>
          </motion.div>
          <h1 className="text-7xl text-white tracking-tight">Did You Know?</h1>
        </motion.div>

        {/* Content Cards */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-5xl space-y-8">
          <div className="grid grid-cols-2 gap-10">
            {/* What is COPD */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-6 pb-6 border-b border-white/20"
            >
              <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-10 h-10 text-amber-300" />
              </div>
              <div>
                <h3 className="text-4xl text-white mb-4">COPD</h3>
                <p className="text-2xl text-white/80 leading-relaxed">
                  Progressive lung disease that can make breathing more difficult over time
                </p>
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-6 pb-6 border-b border-white/20"
            >
              <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                <Users className="w-10 h-10 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-4xl text-white mb-4">300M Affected</h3>
                <p className="text-2xl text-white/80 leading-relaxed">
                  3rd leading cause of death globally
                </p>
              </div>
            </motion.div>
          </div>

          {/* Spread Awareness */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="border-2 border-white/40 rounded-3xl p-10 text-center space-y-6"
          >
            <h3 className="text-5xl text-white">Spread Awareness</h3>
            <div className="w-48 h-px bg-white/30 mx-auto" />
              <p className="text-3xl text-white/90 leading-relaxed">
              Early detection helps you and your family understand COPD risk earlier
              </p>
            
            {/* Social Action Buttons */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="py-8 border-2 border-white/30 hover:border-white/50 rounded-2xl text-white transition-all"
              >
                <div className="flex items-center justify-center gap-4">
                  <MessageCircle className="w-10 h-10" />
                  <span className="text-2xl">Message a Friend</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="py-8 border-2 border-white/30 hover:border-white/50 rounded-2xl text-white transition-all"
              >
                <div className="flex items-center justify-center gap-4">
                  <Share2 className="w-10 h-10" />
                  <span className="text-2xl">Share on Social</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.button
          onClick={() => navigate('/spirometer/results')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-4xl py-10 border-2 border-white/40 hover:border-white/60 rounded-full text-white transition-all"
        >
          <span className="text-4xl tracking-wide">View Results</span>
        </motion.button>
      </div>
    </div>
  );
}
