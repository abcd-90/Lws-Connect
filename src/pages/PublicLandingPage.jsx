import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ChevronDown,
  Paperclip,
  Send,
  FileCode,
  FileText
} from 'lucide-react';

export function PublicLandingPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

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

  const categories = [
    { num: '01', title: 'Code & Architecture Reviews', desc: 'Get direct feedback on your web applications, database schema designs, or repository code snippets.' },
    { num: '02', title: 'Tutorial & Course Questions', desc: 'Ask specific questions about Learn With Sami video lectures, project builds, or code repositories.' },
    { num: '03', title: 'Engineering Career Guidance', desc: 'Discuss software engineering career paths, tech stacks, and industry recommendations.' },
    { num: '04', title: 'Community Ideas & Feedback', desc: 'Share ideas for upcoming tutorials, course content, or community features.' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0809] text-[#FFFFFF] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Background Red Glow Elements */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private Creator Channel</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {theme.hero_headline || 'Your direct line to Learn With Sami.'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {theme.hero_subheadline || 'Skip cluttered social DMs and public forums. LWS Direct provides a secure 1-on-1 workspace to ask questions, review code, and connect directly with Sami — without publicly exposing personal numbers.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => navigate(user ? '/app/messages' : '/register')}
                className="px-6 py-4 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{theme.hero_cta_text || 'Start a Conversation'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-6 border-t border-red-500/20 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-red-500/10 text-red-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span>Zero Phone Exposure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-red-500/10 text-red-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Direct Creator Replies</span>
              </div>
            </div>
          </div>

          {/* Right Live Product Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="bg-[#140D0F] border border-red-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden shadow-glow-red">
              {/* Window Bar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 ml-2">LWS Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-medium text-red-400">Live Channel</span>
                </div>
              </div>

              {/* Chat Stream Header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0809] border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="Sami"
                      className="w-10 h-10 rounded-full object-cover border border-red-500 shadow-md"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B0809] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Sami (Learn With Sami)
                      <ShieldCheck className="w-4 h-4 text-red-500" />
                    </h4>
                    <p className="text-[11px] text-red-400 font-medium">Online • Creator</p>
                  </div>
                </div>
                <span className="text-[10px] bg-red-950/60 text-red-300 px-2.5 py-1 rounded-md font-mono border border-red-500/30">1-on-1 Channel</span>
              </div>

              {/* Chat Stream Messages */}
              <div className="space-y-4 py-1">
                {/* User Message */}
                <div className="ml-auto max-w-[92%] bg-red-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md space-y-2">
                  <p className="text-xs leading-relaxed font-medium">
                    Assalamu Alaikum Sami! Quick question regarding setting up WebSocket real-time events with SQLite database persistence in WAL mode.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-red-400/30 text-[11px] text-red-100 font-mono">
                    <span className="flex items-center gap-1.5 bg-red-700/50 px-2 py-0.5 rounded">
                      <FileText className="w-3.5 h-3.5" /> server.js (2.4 KB)
                    </span>
                    <span>10:42 AM</span>
                  </div>
                </div>

                {/* Sami Response */}
                <div className="mr-auto max-w-[92%] bg-[#0B0809] border border-red-500/20 text-slate-100 p-4 rounded-2xl rounded-tl-none shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400">Sami (Learn With Sami)</span>
                    <span className="text-[10px] text-slate-500 font-mono">10:44 AM</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    Wa Alaikum Assalam Tariq! SQLite in WAL mode handles concurrent socket events effortlessly. Send over your schema snippet inside this thread and I will review it right away!
                  </p>
                </div>
              </div>

              {/* Interactive Input Preview */}
              <div className="pt-2 flex items-center gap-2">
                <div className="flex-1 bg-[#0B0809] border border-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>Type message to Sami...</span>
                  <Paperclip className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300 transition" />
                </div>
                <div className="p-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-white shrink-0 cursor-pointer transition shadow-md">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Narrative Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#140D0F]/80 border-y border-red-500/20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Built For Meaningful Access</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-normal leading-normal">
              A private workspace designed specifically for community communication.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Public social channels and group chats create noise. LWS Direct keeps your questions organized in an exclusive 1-on-1 channel directly connected to Sami's workflow.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0B0809] border border-red-500/20 flex items-start gap-4 hover:border-red-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Zero Personal Phone Number Exposure</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Neither Sami's personal WhatsApp nor your phone number is ever revealed. All interactions stay contained inside your secure dashboard.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0809] border border-red-500/20 flex items-start gap-4 hover:border-red-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Persistent Conversation Context</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your past questions, attachments, and answers remain saved in your persistent thread for future reference.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0809] border border-red-500/20 flex items-start gap-4 hover:border-red-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Direct Screenshot & Code Sharing</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload design drafts, error logs, and repository zip files directly into the message stream for technical feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Step Journey (How It Works) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Simple 4-Step Process</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-normal leading-normal">How Communication Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Register Account', desc: 'Create your account using 1-Click Google or email.' },
            { num: '02', title: 'Open Workspace', desc: 'Your private 1-on-1 room with Sami opens automatically.' },
            { num: '03', title: 'Send Questions', desc: 'Type your message and attach relevant code or screenshots.' },
            { num: '04', title: 'Receive Reply', desc: 'Sami reviews and replies directly inside your thread.' }
          ].map((step, i) => (
            <div key={i} className="p-6 bg-[#140D0F] border border-red-500/20 hover:border-red-500/50 rounded-2xl space-y-3 transition-all shadow-md">
              <span className="text-2xl font-extrabold text-red-500 font-mono">{step.num}</span>
              <h3 className="text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Can Discuss (Editorial Categories) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#140D0F]/60 border-t border-red-500/20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Topics & Content</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-normal leading-normal">What You Can Discuss</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((c) => (
              <div key={c.num} className="p-6 bg-[#0B0809] border border-red-500/20 hover:border-red-500/40 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <span className="text-xs font-mono font-bold text-red-500">{c.num}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">Clarifications</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-normal leading-normal">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="bg-[#140D0F] border border-red-500/20 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-xs sm:text-sm text-white focus:outline-none hover:text-red-400 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-500' : ''}`} />
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
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-red-500/20 bg-gradient-to-b from-[#140D0F] to-[#0B0809] relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-normal">
            Whenever you're ready, start the conversation.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your private messaging room is ready. Ask questions, share feedback, and connect directly with Sami.
          </p>
          <div>
            <button
              onClick={() => navigate(user ? '/app/messages' : '/register')}
              className="px-7 py-3.5 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 inline-flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start a Conversation</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
