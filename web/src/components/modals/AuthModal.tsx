import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthModal = ({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  onSubmit
}: AuthModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Gradient header */}
            <div className="gradient-brand px-8 pt-8 pb-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-white/80" />
                  <span className="text-sm font-medium text-white/80 tracking-wide">MapSNS</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white font-[Sora]">
                  {authMode === 'login' ? 'Welcome Back' : 'Join MapSNS'}
                </h2>
                <p className="text-white/70 mt-1 text-sm">
                  {authMode === 'login'
                    ? 'Sign in to explore places around you'
                    : 'Create your account and start sharing'}
                </p>
              </motion.div>
            </div>

            {/* Form area */}
            <div className="px-8 pb-8 -mt-4">
              <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-ring text-sm"
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-ring text-sm"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-ring text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 gradient-brand text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-200 hover:shadow-xl transition-shadow mt-2"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
              <div className="mt-5 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm font-semibold text-slate-400 hover:text-brand-600 transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-brand-600">{authMode === 'login' ? 'Sign Up' : 'Sign In'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
