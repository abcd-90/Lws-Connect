import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { ShieldAlert, CheckCircle, Flag, RefreshCw } from 'lucide-react';

export function AdminModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/reports');
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await apiFetch(`/admin/reports/${id}/resolve`, { method: 'POST' });
      loadReports();
    } catch (err) {
      alert(`Failed to resolve report: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">Moderation Reports</h1>
            <p className="text-xs text-slate-400">Review user feedback and reported conversation issues</p>
          </div>
          <button onClick={loadReports} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Reporter</th>
                <th className="p-4">Category</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No open reports found. Platform is clear.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-white">{r.reporter_name}</td>
                    <td className="p-4">
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{r.details || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'open' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {r.status === 'open' && (
                        <button
                          onClick={() => handleResolve(r.id)}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
