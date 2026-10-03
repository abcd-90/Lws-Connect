import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { apiFetch } from '../utils/api';
import { Shield, User, Filter, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

export function AdminInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadConversations = async () => {
    try {
      const data = await apiFetch('/chat/conversations');
      const list = data.conversations || [];
      setConversations(list);
      if (list.length > 0) {
        setActiveConvId(prev => prev || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const filteredConversations = conversations.filter(c => {
    if (filterStatus === 'unread') return c.unread_count > 0;
    if (filterStatus === 'archived') return c.status === 'archived';
    return true;
  });

  const activeConvObj = conversations.find(c => c.id === activeConvId);

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user from messaging?')) return;
    try {
      await apiFetch(`/admin/users/${userId}/block`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Blocked from admin inbox' })
      });
      alert('User blocked successfully.');
      loadConversations();
    } catch (err) {
      alert(`Block failed: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0809] text-white font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Filter Bar */}
        <div className="h-14 bg-[#140D0F] border-b border-red-500/20 px-6 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" /> Sami's Creator Inbox
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${filterStatus === 'all' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${filterStatus === 'unread' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Main Inbox View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 h-full">
            <ConversationList
              conversations={filteredConversations}
              activeConvId={activeConvId}
              onSelectConversation={(id) => setActiveConvId(id)}
              currentRole="admin"
            />
          </div>

          {/* Active ChatRoom View */}
          <div className="flex-1 h-full flex">
            <div className="flex-1 h-full">
              {activeConvId ? (
                <ChatRoom
                  conversationId={activeConvId}
                  currentRole="admin"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Select a user conversation from the left to read & reply
                </div>
              )}
            </div>

            {/* User Metadata Inspector Sidebar */}
            {activeConvObj && (
              <div className="w-72 bg-[#140D0F] border-l border-red-500/20 p-4 space-y-6 hidden lg:block overflow-y-auto">
                <div className="text-center space-y-2 pb-4 border-b border-red-500/20">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-xl font-bold text-white shadow-md">
                    {(activeConvObj.user_full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-sm text-white">{activeConvObj.user_full_name || 'User'}</h4>
                  <p className="text-xs text-red-400 font-mono">@{activeConvObj.user_username}</p>
                  <p className="text-[11px] text-slate-300 font-mono font-bold">{activeConvObj.user_email}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">User Info</h5>
                  <div className="flex justify-between py-1.5 border-b border-red-500/10">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-bold ${activeConvObj.user_status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {activeConvObj.user_status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => handleBlockUser(activeConvObj.user_id)}
                    className="w-full py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
