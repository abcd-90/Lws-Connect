import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Lock, ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5" /> Privacy First Platform
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: October 2026</p>
        </div>

        <div className="glass-card p-8 space-y-6 text-xs text-slate-300 leading-relaxed border border-white/10">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Protection of Phone Numbers</h3>
            <p>
              LWS Direct was built specifically so that Learn With Sami community members can communicate with Sami without requiring Sami's personal WhatsApp number or exposing personal member numbers to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. Data Storage & Encryption</h3>
            <p>
              All messages, profile information, and attachment metadata are stored securely inside our database. Passwords are encrypted using salted bcrypt hashing.
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
