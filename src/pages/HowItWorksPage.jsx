import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ShieldCheck, MessageSquare, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0809] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 w-full">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Simple & Secure Workflow</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How LWS Direct Works</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
            Discover how our 1-on-1 creator communication platform keeps conversations private, organized, and secure without exposing Sami's personal WhatsApp number.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#140D0F] border border-red-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 hover:border-red-500/50 transition-all shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-extrabold text-xl text-red-500 font-mono shrink-0">
              01
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Create Account & Automatic 1-on-1 Room</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When you sign up using your email and username, a private 1-on-1 messaging workspace with Sami is automatically generated. Your contact details remain protected inside your dashboard.
              </p>
            </div>
          </div>

          <div className="bg-[#140D0F] border border-red-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 hover:border-red-500/50 transition-all shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-extrabold text-xl text-red-500 font-mono shrink-0">
              02
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Send Your Questions & Code Attachments</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Type your questions in the direct chat composer. If you have code snippets, project bugs, or screenshots, attach them directly into your thread.
              </p>
            </div>
          </div>

          <div className="bg-[#140D0F] border border-red-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 hover:border-red-500/50 transition-all shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-extrabold text-xl text-red-500 font-mono shrink-0">
              03
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Direct Creator Reply & Persistent History</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sami reviews your questions directly from the admin panel and sends responses right into your thread. Your chat history remains permanently saved.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" /> Start Your Conversation Now
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
