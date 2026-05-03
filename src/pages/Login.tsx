import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Terminal, Lock, ShieldAlert, ChevronRight, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(0); // 0: Email, 1: Password, 2: Accessing
  const [error, setError] = useState<string | null>(null);
  const [isAccessing, setIsAccessing] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0 && email) setStep(1);
    else if (step === 1 && password) handleLogin();
  };

  const handleLogin = async () => {
    setError(null);
    setIsAccessing(true);
    try {
      await login(email, password);
      // Success sequence
      setStep(2);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'ACCESS DENIED');
      setIsAccessing(false);
      setStep(0);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono overflow-hidden">
      {/* Background Stargate Ring (Faded) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] border-4 border-dashed border-cyan-500 rounded-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {step < 2 ? (
          <div className="bg-slate-900/50 border border-cyan-900/50 p-8 backdrop-blur-xl rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-3 mb-8 text-cyan-500">
              <Terminal size={24} />
              <h1 className="text-xl font-bold tracking-[0.3em] uppercase">Gateway Login</h1>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              <div className="relative min-h-[80px]">
                <AnimatePresence mode="wait">
                  {step === 0 ? (
                    <motion.div
                      key="email"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <label className="block text-[10px] text-cyan-500/50 uppercase mb-2 tracking-widest">Identify User</label>
                      <div className="relative group">
                        <ChevronRight className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-500/30 group-focus-within:text-cyan-400 transition-colors" size={16} />
                        <input
                          autoFocus
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-cyan-900/50 py-2 pl-6 focus:outline-none focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-900 transition-all"
                          placeholder="USER_EMAIL"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="password"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <label className="block text-[10px] text-cyan-500/50 uppercase mb-2 tracking-widest">Verify Authorization</label>
                      <div className="relative group">
                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-500/30 group-focus-within:text-cyan-400 transition-colors" size={16} />
                        <input
                          autoFocus
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent border-b border-cyan-900/50 py-2 pl-6 focus:outline-none focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-900 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded border border-red-500/20"
                >
                  <ShieldAlert size={14} />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isAccessing}
                className="w-full py-3 bg-cyan-950/30 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/20 transition-all uppercase text-xs font-bold tracking-[0.2em] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isAccessing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <span>Execute Access</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 8],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2.5, times: [0, 0.4, 1], ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border-4 border-cyan-400 shadow-[0_0_100px_rgba(6,182,212,0.8)] flex items-center justify-center bg-cyan-400/20 backdrop-blur-3xl"
            >
              <div className="w-full h-full rounded-full animate-pulse bg-white/20" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
              className="mt-8 text-cyan-400 tracking-[1em] uppercase font-bold text-center"
            >
              Access Granted
            </motion.p>
          </div>
        )}

        <div className="mt-8 flex justify-between text-[8px] text-cyan-900 uppercase tracking-widest">
          <span>Sys: Propoj_v2.0</span>
          <span>Status: Secure_Protocol_v4</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
