import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Lock, ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0809] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 w-full">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/30">
            <Lock className="w-3.5 h-3.5" /> Privacy First Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-mono">Effective Date: October 2026</p>
        </div>

        <div className="bg-[#140D0F] border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed shadow-md">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Protection of Phone Numbers</h3>
            <p>
              LWS Direct was built specifically so that Learn With Sami community members can communicate with Sami without requiring Sami's personal WhatsApp number or exposing personal member numbers to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. Data Storage & Security</h3>
            <p>
              All messages, profile information, and attachment metadata are stored securely inside our persistent database. Passwords are encrypted using salted bcrypt hashing.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">3. Zero Data Sale</h3>
            <p>
              We do not sell, rent, or commercialize your personal information or messaging data to advertisers or third-party data brokers.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
