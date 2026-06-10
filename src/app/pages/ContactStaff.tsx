import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { BellRing, TriangleAlert } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';

export function ContactStaff() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-slate-950/45" />

      <div className="relative flex h-full w-full flex-col items-center justify-between px-16 py-20">
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logoImage} alt="Oivio" className="h-20" />
          <div className="h-16 w-px bg-white/30" />
          <h1 className="text-7xl tracking-tight text-white">Please Contact Staff</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex w-full max-w-5xl flex-col items-center rounded-[2.5rem] border border-amber-200/25 bg-slate-950/35 px-16 py-16 text-center text-white backdrop-blur-sm"
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-amber-200/30 bg-amber-300/10">
            <TriangleAlert className="h-14 w-14 text-amber-200" />
          </div>

          <h2 className="mt-8 text-6xl tracking-tight">A staff review is needed before this test</h2>
          <p className="mt-6 max-w-3xl text-3xl leading-relaxed text-white/75">
            One of the pre-test questions may affect whether it is safe to continue with spirometry today.
            Please ask a member of staff to assist you before proceeding.
          </p>

          <div className="mt-12 flex items-center gap-4 rounded-full border border-white/15 bg-white/8 px-8 py-4">
            <BellRing className="h-8 w-8 text-emerald-300" />
            <span className="text-2xl text-white/80">Staff can review your answers and advise the next step.</span>
          </div>
        </motion.div>

        <motion.div
          className="flex w-full max-w-4xl items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full border-2 border-white/40 px-12 py-6 text-3xl text-white transition hover:border-white/70 hover:bg-white/10"
          >
            Back To Home
          </button>
          <button
            type="button"
            onClick={() => navigate('/spirometer/questionnaire')}
            className="rounded-full border-2 border-white/20 px-12 py-6 text-3xl text-white/70 transition hover:border-white/50 hover:text-white"
          >
            Review Questions
          </button>
        </motion.div>
      </div>
    </div>
  );
}
