import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

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
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (email, pass) => {
    setEmailOrUsername(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 selection:bg-amber-600 selection:text-white">
      <div className="max-w-md w-full bg-[#141923] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to LWS Direct</h2>
          <p className="text-xs text-slate-400">Access your private creator conversation space</p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="p-4 bg-[#0B0E14] border border-amber-500/30 rounded-xl space-y-3">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Quick Demo Login Fill
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@lwsconnect.com', 'LwsSecureAdmin#2026!')}
              className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-left transition cursor-pointer"
            >
              <span className="font-bold block text-xs flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Sami (Admin)
              </span>
              <span className="text-[10px] text-slate-400 block truncate mt-1">admin@lwsconnect.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('student@learnwithsami.com', 'StudentPass123!')}
              className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-left transition cursor-pointer"
            >
              <span className="font-bold block text-xs flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Tariq (Student)
              </span>
              <span className="text-[10px] text-slate-400 block truncate mt-1">student@learnwithsami.com</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email or Username</label>
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. student@learnwithsami.com"
              className="lws-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="lws-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="lws-btn-amber w-full flex items-center justify-center gap-2"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
