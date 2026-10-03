import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { MessageSquare, Shield, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Privacy', path: '/privacy' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <Logo size="md" />
        </Link>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-medium tracking-wide transition-colors hover:text-white ${
                  isActive ? 'text-amber-500 font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Single Primary Action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'super_admin' || user.role === 'admin' ? (
                <button
                  onClick={() => navigate('/lws-portal-secure-x99')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Panel
                </button>
              ) : null}

              <button
                onClick={() => navigate('/app/messages')}
                className="btn-dynamic px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> My Workspace
              </button>

              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-400 hover:text-white px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-dynamic px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>{theme.hero_cta_text || 'Start a Conversation'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141923] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-300 hover:text-amber-500"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/app/messages'); }}
                className="w-full py-2.5 text-center text-xs font-semibold bg-amber-600 text-white rounded-lg"
              >
                My Messages
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-xs font-medium text-slate-300 bg-white/5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-amber-600 rounded-lg"
                >
                  {theme.hero_cta_text || 'Start a Conversation'}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
