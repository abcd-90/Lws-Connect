import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { Users, Search, Ban, CheckCircle, Shield, RefreshCw } from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white">User Directory</h1>
            <p className="text-xs text-slate-400">Manage registered community members & account statuses</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="bg-[#111827] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0284C7]"
              />
            </div>
            <button
              onClick={loadUsers}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17] text-slate-400 font-semibold uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Conversations</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{u.full_name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'super_admin' || u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{u.conversation_count || 0}</td>
                  <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {u.role !== 'super_admin' && (
                      <button
                        onClick={() => toggleBlock(u.id, u.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    )}
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
