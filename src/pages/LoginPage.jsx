import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await login(emailOrUsername, password);
      if (res.user.role === 'super_admin' || res.user.role === 'admin') {
        navigate('/lws-portal-secure-x99');
      } else {
        navigate('/app/messages');
      }
    } catch (err) {
      setError(err.message || 'Invalid email/username or password');
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to LWS Direct</h2>
          <p className="text-xs text-slate-300">Access your private creator conversation space</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 font-sans">
            <label className="block text-xs font-semibold text-slate-300">Email or Username</label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. user@gmail.com"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-red-500/20 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-400 hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
