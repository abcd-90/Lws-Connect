import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B0809] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>

        <div className="bg-[#140D0F] border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed shadow-md">
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
