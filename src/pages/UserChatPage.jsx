import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { apiFetch } from '../utils/api';
import { Logo } from '../components/common/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, User, Settings, Shield, Bell, CheckCircle } from 'lucide-react';

export function UserChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      // Ensure conversation exists
      await apiFetch('/chat/conversations/ensure', { method: 'POST' });
      const data = await apiFetch('/chat/conversations');
      const convList = data.conversations || [];
      setConversations(convList);
      if (convList.length > 0 && !activeConvId) {
        setActiveConvId(convList[0].id);
      }
    } catch (err) {
      console.error('Error ensuring conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="h-screen w-screen bg-[#090D16] flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Application Header */}
      <header className="h-14 bg-[#0B0F17] border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0284C7]/20 text-[#0284C7] uppercase tracking-wider">
            Private Community Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'super_admin' || user?.role === 'admin' ? (
            <button
              onClick={() => navigate('/lws-portal-secure-x99')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Panel
            </button>
          ) : null}

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">{user?.full_name}</span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split Layout: Sidebar + Active ChatRoom */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Inbox Sidebar */}
        <div className={`w-full md:w-80 h-full ${activeConvId ? 'hidden md:block' : 'block'}`}>
          <ConversationList
            conversations={conversations}
            activeConvId={activeConvId}
            onSelectConversation={(id) => setActiveConvId(id)}
            currentRole="user"
          />
        </div>

        {/* Right Active Chat Room */}
        <div className={`flex-1 h-full ${!activeConvId ? 'hidden md:block' : 'block'}`}>
          {activeConvId ? (
            <ChatRoom
              conversationId={activeConvId}
              onBack={() => setActiveConvId(null)}
              currentRole="user"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
