import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { apiFetch } from '../utils/api';
import { ChevronDown, Search } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0B0809] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 w-full">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Knowledge Base</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h1>
          <p className="text-xs sm:text-sm text-slate-300">Answers to common questions about LWS Direct</p>
        </div>

        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-[#140D0F] border border-red-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="space-y-4 pt-4">
          {filtered.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="bg-[#140D0F] border border-red-500/20 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-xs sm:text-sm text-white focus:outline-none hover:text-red-400 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-red-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-red-500/10 pt-3">
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
