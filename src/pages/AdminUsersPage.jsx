import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { Users, Search, MessageSquare, Mail, Copy, Check, Shield, RefreshCw, UserCheck } from 'lucide-react';

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const toggleBlock = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await apiFetch(`/admin/users/${userId}/block`, {
          method: 'POST',
          body: JSON.stringify({ reason: 'Admin panel moderation' })
        });
      } else {
        await apiFetch(`/admin/users/${userId}/unblock`, { method: 'POST' });
      }
      loadUsers();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const handleOpenChat = async (userId) => {
    try {
      const res = await apiFetch(`/admin/conversations/open-user/${userId}`, { method: 'POST' });
      if (res.conversation_id) {
        navigate('/lws-portal-secure-x99/inbox');
      }
    } catch (err) {
      alert(`Could not open chat: ${err.message}`);
    }
  };

  const copyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const regularUsersCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="flex h-screen bg-[#0B0809] text-white font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-red-500/20">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-red-500" />
              Community User Directory
            </h1>
            <p className="text-xs text-slate-300">View all registered members, inspect their email addresses, and initiate direct messages</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or username..."
                className="bg-[#140D0F] border border-red-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-64"
              />
            </div>
            <button
              onClick={loadUsers}
              className="p-2 bg-[#140D0F] border border-red-500/20 hover:bg-white/5 text-slate-300 rounded-xl cursor-pointer transition"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Directory Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#140D0F] border border-red-500/30 rounded-2xl space-y-1 shadow-md">
            <p className="text-xs text-slate-400 font-medium">Total Registered Members</p>
            <p className="text-2xl font-extrabold text-white">{users.length} Users</p>
          </div>

          <div className="p-4 bg-[#140D0F] border border-red-500/30 rounded-2xl space-y-1 shadow-md">
            <p className="text-xs text-slate-400 font-medium">Active Accounts</p>
            <p className="text-2xl font-extrabold text-emerald-400">{activeCount} Active</p>
          </div>

          <div className="p-4 bg-[#140D0F] border border-red-500/30 rounded-2xl space-y-1 shadow-md">
            <p className="text-xs text-slate-400 font-medium">Community Members</p>
            <p className="text-2xl font-extrabold text-red-400">{regularUsersCount} Registered</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#140D0F] border border-red-500/30 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#0B0809] text-red-400 font-bold uppercase text-[11px] border-b border-red-500/20">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Email Address (Mails)</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions / Direct Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  {/* User Profile */}
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={u.role === 'super_admin' || u.role === 'admin' ? '/logo.png' : '/logo.png'}
                      alt={u.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-red-500/40 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{u.full_name}</p>
                      <p className="text-[11px] text-red-400 font-mono">@{u.username}</p>
                    </div>
                  </td>

                  {/* Email Address */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${u.email}`}
                        className="font-bold text-white hover:text-red-400 underline decoration-red-500/40 flex items-center gap-1.5 text-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{u.email}</span>
                      </a>
                      <button
                        onClick={() => copyEmail(u.email, u.id)}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition cursor-pointer"
                        title="Copy Email Address"
                      >
                        {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      u.role === 'super_admin' || u.role === 'admin'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="p-4 text-slate-300 font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenChat(u.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer transition"
                        title="Open Direct Message Thread with User"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Now</span>
                      </button>

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => toggleBlock(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-500/30'
                              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-500/30'
                          }`}
                        >
                          {u.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
