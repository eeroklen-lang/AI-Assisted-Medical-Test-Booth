import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';

export function MouthpieceDisposal() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-slate-950/40" />

      <div className="relative flex h-full w-full flex-col items-center justify-between px-16 py-20">
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="h-16 w-px bg-white/30" />
          <h1 className="text-7xl tracking-tight text-white">Dispose of the Mouthpiece</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex w-full max-w-5xl flex-col items-center rounded-[2.5rem] border border-white/20 bg-white/8 px-16 py-16 text-center text-white backdrop-blur-sm"
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Trash2 className="h-14 w-14 text-white/80" />
          </div>
          <h2 className="mt-8 text-6xl tracking-tight">Please place the used mouthpiece in the bin</h2>
          <p className="mt-6 max-w-3xl text-3xl leading-relaxed text-white/75">
            The mouthpiece is single-use. Once you have disposed of it, continue to schedule your next follow-up.
          </p>
          <div className="mt-10 flex items-center gap-4 rounded-full border border-white/15 bg-white/10 px-8 py-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <span className="text-2xl text-white/80">Do not reuse the mouthpiece.</span>
          </div>
        </motion.div>

        <motion.button
          onClick={() => navigate('/spirometer/schedule')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl rounded-full border-2 border-white/40 py-10 text-white transition-all hover:border-white/60"
        >
          <span className="text-4xl tracking-wide">Continue</span>
        </motion.button>
      </div>
    </div>
  );
}
