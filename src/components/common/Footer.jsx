import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { useTheme } from '../../theme/ThemeProvider';
import { ArrowUpRight, Lock } from 'lucide-react';

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="w-full bg-[#07090E] border-t border-white/10 text-slate-400 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <Logo size="md" />
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {theme.tagline || 'The direct line to Learn With Sami.'} Proprietary private creator messaging workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
          <Link to="/faq" className="hover:text-white transition">FAQ</Link>
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <a
            href="https://learnwithsami.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-1"
          >
            LearnWithSami.com <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
        <p>{theme.footer_text || '© 2026 Learn With Sami. All rights reserved.'}</p>
        <div className="flex items-center gap-1.5 text-emerald-400/80">
          <Lock className="w-3 h-3" /> Zero WhatsApp Exposure • 100% Private Workspace
        </div>
      </div>
    </footer>
  );
}
