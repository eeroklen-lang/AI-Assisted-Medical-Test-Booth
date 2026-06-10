import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { backgroundImage, logoImage } from '../lib/assets';
import { useApp } from '../context/AppContext';

export function Logout() {
  const navigate = useNavigate();
  const { setToken, setUser, setPatient, setTestPayload, setSessionResult } = useApp();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(null);
      setUser(null);
      setPatient(null);
      setTestPayload(null);
      setSessionResult(null);
      navigate('/id-scan');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [navigate, setPatient, setSessionResult, setTestPayload, setToken, setUser]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-slate-950/45" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex w-[min(90vw,42rem)] flex-col items-center rounded-[2.5rem] border border-white/20 bg-slate-950/40 px-8 py-16 text-center text-white shadow-2xl backdrop-blur-xl"
      >
        <img src={logoImage} alt="Oivio" className="mb-8 h-16 w-fit" />
        <h1 className="text-5xl tracking-tight">Session Complete</h1>
        <p className="mt-4 max-w-lg text-xl text-white/70">
          Resetting the booth and returning to patient identification.
        </p>
      </motion.div>
    </div>
  );
}
