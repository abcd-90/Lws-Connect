import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !username) return;

    setSubmitting(true);
    setError(null);
    try {
      await register(fullName || username, username, email, 'lws12345');
      navigate('/app/messages');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0809] flex items-center justify-center p-4 selection:bg-red-600 selection:text-white">
      <div className="max-w-md w-full bg-[#140D0F] border border-red-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-glow-red relative">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-300">Join LWS Direct for 1-on-1 direct messaging with Learn With Sami</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 font-sans">
            <label className="block text-xs font-semibold text-slate-300">Your Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@gmail.com"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="space-y-1 font-sans">
            <label className="block text-xs font-semibold text-slate-300">Username / Full Name</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setFullName(e.target.value);
              }}
              placeholder="e.g. Sheikh Sami"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Creating Account & Starting Chat...' : 'Create Account & Start 1-on-1 Chat'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-red-500/20">
          Already registered?{' '}
          <Link to="/login" className="text-red-400 hover:underline font-bold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
