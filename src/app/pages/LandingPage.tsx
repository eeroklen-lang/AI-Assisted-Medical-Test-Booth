import { useNavigate } from 'react-router';
import { Activity, Droplet, Heart, Wind, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { backgroundImage, logoImage } from '../lib/assets';
import { useApp } from '../context/AppContext';

const tests = [
  { id: 'blood-pressure', name: 'Blood Pressure', icon: Heart, path: '/blood-pressure' },
  { id: 'oximeter', name: 'Oximeter', icon: Activity, path: '/oximeter' },
  { id: 'spirometer', name: 'Spirometer', icon: Wind, path: '/spirometer/onboarding' },
  { id: 'hba1c', name: 'HBA1C', icon: Droplet, path: '/hba1c' },
  { id: 'haemoglobin', name: 'Haemoglobin', icon: Zap, path: '/haemoglobin' },
  { id: 'cholesterol', name: 'Cholesterol', icon: Droplet, path: '/cholesterol' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { patient } = useApp();

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      <div className="relative w-full h-full flex flex-col items-center justify-center px-16 py-20">
        {/* Header with Logo */}
        <motion.div 
          className="flex flex-col items-center mb-24"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <img src={logoImage} alt="Oivio" className="h-24 mb-8" />
          <h1 className="text-7xl text-white tracking-tight mb-6">
            Hello {patient?.first_name ?? 'there'}!
          </h1>
          <div className="w-64 h-px bg-white/30" />
          <p className="text-4xl text-white/80 mt-6">What test would you like today?</p>
        </motion.div>

        {/* Test Selection */}
        <div className="w-full max-w-5xl space-y-1">
          {tests.map((test, index) => {
            const Icon = test.icon;
            return (
              <motion.button
                key={test.id}
                onClick={() => navigate(test.path)}
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 + 0.45, duration: 0.65 }}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full flex items-center justify-between px-12 py-8 border-b border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center gap-8">
                  <Icon className="w-12 h-12 text-white/70 group-hover:text-white transition-colors" />
                  <span className="text-4xl text-white tracking-wide">{test.name}</span>
                </div>
                <motion.div
                  className="text-white/40 text-3xl"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  →
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
