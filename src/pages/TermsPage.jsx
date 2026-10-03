import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold font-display text-white">Terms of Service</h1>

        <div className="glass-card p-8 space-y-6 text-xs text-slate-300 leading-relaxed border border-white/10">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Community Conduct</h3>
            <p>
              Users must maintain respectful, professional communication when messaging Sami or moderation administrators. Harassment, spam, or abusive behavior will result in account blocking.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. Acceptable Use & Attachments</h3>
            <p>
              Files uploaded to the platform must be directly related to learning, code review, or technical feedback. Uploading malicious executables or copyrighted content is strictly prohibited.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
