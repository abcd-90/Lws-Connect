import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ShieldCheck, MessageSquare, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold font-display text-white">How LWS Direct Works</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover how our proprietary creator-to-community communication platform keeps conversations private, organized, and secure without exposing Sami's personal WhatsApp number.
          </p>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center font-extrabold text-xl text-[#0284C7] shrink-0">
              01
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Account Registration & Private Key</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When you create an account on LWS Direct, a dedicated 1-on-1 messaging workspace is automatically generated for you. Your email address and contact details are stored securely and never shared publicly.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-xl text-emerald-400 shrink-0">
              02
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Sending Your Message & Code Attachments</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Compose messages using our rich text editor. If you are asking about a project, tutorial, or code repo, attach screenshots, PDFs, or archive files directly into your message stream.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-extrabold text-xl text-purple-400 shrink-0">
              03
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Real-Time Delivery & Creator Response</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sami receives instant real-time notifications in his protected admin workspace. When Sami replies, your dashboard updates live via WebSockets without needing to refresh the page.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => navigate('/register')}
            className="btn-dynamic px-8 py-4 bg-[#0284C7] hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-sky-900/30 inline-flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" /> Start Your Conversation Now
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
