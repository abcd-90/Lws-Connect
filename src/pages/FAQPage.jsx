import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { apiFetch } from '../utils/api';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

export function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await apiFetch('/cms/faqs');
        setFaqs(res.faqs || []);
      } catch (err) {
        // silent
      }
    }
    loadFaqs();
  }, []);

  const filtered = faqs.filter(f =>
    f.question.toLowerCase().includes(query.toLowerCase()) ||
    f.answer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 w-full">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold font-display text-white">Frequently Asked Questions</h1>
          <p className="text-sm text-slate-300">Answers to common questions about LWS Direct</p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        <div className="space-y-4 pt-4">
          {filtered.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between font-semibold text-sm text-white focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
