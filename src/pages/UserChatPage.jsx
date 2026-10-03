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
      const ensureRes = await apiFetch('/chat/conversations/ensure', { method: 'POST' });
      const data = await apiFetch('/chat/conversations');
      const convList = data.conversations || [];
      setConversations(convList);

      // Auto-open active conversation on screen
      const activeId = ensureRes?.conversation_id || (convList.length > 0 ? convList[0].id : null);
      if (activeId) {
        setActiveConvId(activeId);
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
    <div className="h-screen w-screen bg-[#0B0809] flex flex-col overflow-hidden text-white font-sans">
      {/* Top Application Header */}
      <header className="h-14 bg-[#140D0F] border-b border-red-500/20 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-wider">
            Private Community Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'super_admin' || user?.role === 'admin' ? (
            <button
              onClick={() => navigate('/lws-portal-secure-x99')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Panel
            </button>
          ) : null}

          <div className="flex items-center gap-2 px-3 py-1 bg-[#0B0809] border border-red-500/20 rounded-lg text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-white">{user?.full_name || user?.username}</span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
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
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              Loading conversation room...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
