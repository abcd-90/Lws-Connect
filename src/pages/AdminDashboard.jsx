import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { 
  Users, 
  MessageSquare, 
  Inbox, 
  AlertTriangle, 
  TrendingUp, 
  Palette, 
  Shield, 
  RefreshCw,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anRes, convRes] = await Promise.all([
        apiFetch('/admin/analytics'),
        apiFetch('/chat/conversations')
      ]);
      setAnalytics(anRes);
      setConversations(convRes.conversations || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = analytics?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalConversations: 0,
    unreadMessages: 0,
    totalMessages: 0,
    openReports: 0
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Real-time community communication overview & moderation controls</p>
          </div>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-2 border-l-4 border-l-[#0284C7]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total Users</span>
              <Users className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.totalUsers}</div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {metrics.activeUsers} Active Community Members
            </p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Conversations</span>
              <Inbox className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.totalConversations}</div>
            <p className="text-[11px] text-slate-400">Active 1-on-1 Creator Rooms</p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Unread Messages</span>
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.unreadMessages}</div>
            <p className="text-[11px] text-amber-300 font-medium">Needing Response</p>
          </div>

          <div className="glass-card p-5 space-y-2 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total Messages</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.totalMessages}</div>
            <p className="text-[11px] text-slate-400">Exchanged Platform Wide</p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inbox Preview List */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#0284C7]" /> Recent Community Inbox
              </h3>
              <button
                onClick={() => navigate('/lws-portal-secure-x99/conversations')}
                className="text-xs text-[#0284C7] hover:underline font-semibold flex items-center gap-1"
              >
                View Inbox <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate('/lws-portal-secure-x99/conversations')}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/20 cursor-pointer flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {(conv.user_full_name || conv.user_username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{conv.user_full_name || conv.user_username}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {conv.last_message_body || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {conv.unread_count} Unread
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Design Studio Card Banner */}
          <div className="glass-card p-6 space-y-4 bg-gradient-to-br from-slate-900 via-[#111827] to-sky-950/40 border border-sky-500/20">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Admin Design Studio</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Customize colors, fonts, logo, geometry, and homepage CMS text live without modifying code. Live preview, save drafts, publish, and version rollback supported.
              </p>
            </div>
            <button
              onClick={() => navigate('/lws-portal-secure-x99/design-studio')}
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              Open Design Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
