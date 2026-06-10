import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CalendarDays, Clock3, CheckCircle2 } from 'lucide-react';
import { backgroundImage, logoImage } from '../lib/assets';

const slots = [
  { date: 'Tue 2 Apr', time: '09:00' },
  { date: 'Tue 2 Apr', time: '14:30' },
  { date: 'Thu 4 Apr', time: '11:15' },
  { date: 'Fri 5 Apr', time: '08:45' },
];

export function ScheduleAppointment() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);

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
          <h1 className="text-7xl tracking-tight text-white">Schedule Your Next Appointment</h1>
        </motion.div>

        <div className="flex w-full max-w-6xl flex-1 items-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="grid flex-1 grid-cols-2 gap-6"
          >
            {slots.map((slot) => {
              const active = selectedSlot.date === slot.date && selectedSlot.time === slot.time;
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-[2rem] border p-8 text-left text-white transition ${
                    active ? 'border-white/60 bg-white/16' : 'border-white/20 bg-white/8 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <CalendarDays className="h-8 w-8 text-white/70" />
                    <p className="text-3xl">{slot.date}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <Clock3 className="h-8 w-8 text-white/70" />
                    <p className="text-4xl">{slot.time}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-[32rem] rounded-[2rem] border border-white/20 bg-white/8 p-10 text-white backdrop-blur-sm"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-white/45">Selected Follow-Up</p>
            <h2 className="mt-4 text-5xl tracking-tight">{selectedSlot.date}</h2>
            <p className="mt-3 text-4xl text-white/80">{selectedSlot.time}</p>
            <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/8 p-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                <p className="text-2xl">Doctors can review your report before this follow-up.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          onClick={() => navigate('/spirometer/education')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl rounded-full border-2 border-white/40 py-10 text-white transition-all hover:border-white/60"
        >
          <span className="text-4xl tracking-wide">Confirm Appointment</span>
        </motion.button>
      </div>
    </div>
  );
}
