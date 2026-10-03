import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { History, Shield, RefreshCw } from 'lucide-react';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/audit-logs');
      setLogs(data.audit_logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">Security Audit Trail</h1>
            <p className="text-xs text-slate-400">Auditable history of administrative operations, logins & moderation actions</p>
          </div>
          <button
            onClick={loadLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Target</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 font-bold text-[#0284C7]">{log.action}</td>
                  <td className="p-4 text-white font-medium">{log.actor_name || log.actor_id}</td>
                  <td className="p-4 text-slate-400">{log.target_type} ({log.target_id || 'N/A'})</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{log.ip_address}</td>
                  <td className="p-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
