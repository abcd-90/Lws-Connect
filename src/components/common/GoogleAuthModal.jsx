import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export function GoogleAuthModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your name and valid Google email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await loginWithGoogle({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase()
      });
      onClose();
      navigate('/app/messages');
    } catch (err) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#140D0F] border border-red-500/30 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-glow-red relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto shadow-md border border-slate-200">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Sign in with Google</h3>
          <p className="text-xs text-slate-300">Enter your name & email to connect directly with Learn With Sami</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Your Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sheikh Sami"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Google Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sheikhsami3082@gmail.com"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Connecting...' : `Continue with Google (${fullName || '1-Click'})`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 font-medium">
          🔒 Secure 1-on-1 account authorization • Fast 1-Click access
        </p>
      </div>
    </div>
  );
}
