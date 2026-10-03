import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { BarChart3, TrendingUp, Users, MessageSquare, RefreshCw } from 'lucide-react';

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = analytics?.metrics || {};
  const daily = analytics?.dailyActivity || [];

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">Analytics & Insights</h1>
            <p className="text-xs text-slate-400">Database metrics and message exchange trends</p>
          </div>
          <button onClick={loadData} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Daily Activity Chart Visualization */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0284C7]" /> Daily Message Activity (Last 7 Days)
          </h3>

          <div className="pt-4 flex items-end justify-between gap-4 h-48 border-b border-white/10 pb-2">
            {daily.length === 0 ? (
              <p className="text-xs text-slate-500 mx-auto">No activity recorded in this period</p>
            ) : (
              daily.map((item, idx) => {
                const maxCount = Math.max(...daily.map(d => d.count), 1);
                const heightPercent = Math.max((item.count / maxCount) * 100, 15);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-sky-400">{item.count} msgs</span>
                    <div
                      className="w-full max-w-[48px] bg-gradient-to-t from-[#0284C7] to-emerald-500 rounded-t-lg transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
