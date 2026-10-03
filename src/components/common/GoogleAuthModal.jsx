import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export function GoogleAuthModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Preset Google Accounts for 1-Click Selection
  const accounts = [
    {
      id: 'acc1',
      name: 'Sheikh Sami',
      email: 'sheikhsami3082@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      badge: 'Google Account'
    },
    {
      id: 'acc2',
      name: 'Community Member',
      email: 'member.lws@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      badge: 'Google Account'
    }
  ];

  const handleAccountSelect = async (account) => {
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle({
        full_name: account.name,
        email: account.email
      });
      onClose();
      navigate('/app/messages');
    } catch (err) {
      setError(err.message || 'Google account sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError('Please provide a Google email address.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle({
        full_name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim().toLowerCase()
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#140D0F] border border-red-500/30 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mx-auto shadow-md border border-slate-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <h3 className="text-lg font-bold text-white tracking-tight">Choose Google Account</h3>
          <p className="text-xs text-slate-300">Select an account to sign up & continue to LWS Direct</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Selection List */}
        {!showCustomInput ? (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                disabled={submitting}
                onClick={() => handleAccountSelect(acc)}
                className="w-full p-3.5 bg-[#0B0809] hover:bg-[#1A1215] border border-red-500/20 hover:border-red-500/50 rounded-xl flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover border border-red-500/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition">{acc.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold opacity-80 group-hover:opacity-100">
                  <span>Select & Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}

            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 px-3 bg-[#0B0809] hover:bg-slate-900 border border-slate-700/50 rounded-xl text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>+ Use another Google Email address</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Google Email</label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Name (Optional)</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In with Google'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-red-500/20 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            🔒 1-Click Google OAuth Authorization • Direct 1-on-1 Access
          </p>
        </div>
      </div>
    </div>
  );
}
