import React, { useState } from 'react';
import { Search, MessageSquare, Shield, Clock, CheckCheck, User } from 'lucide-react';

export function ConversationList({ conversations, activeConvId, onSelectConversation, currentRole }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    const title = currentRole === 'user' ? (c.recipient_name || 'Sami') : (c.user_full_name || c.user_username);
    const body = c.last_message_body || '';
    return title.toLowerCase().includes(search.toLowerCase()) || body.toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0B0F17] border-r border-white/10">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0284C7]"
          />
        </div>
      </div>

      {/* Conversations Scroll Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
            <p>No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConvId;
            const displayName = currentRole === 'user' ? (conv.recipient_name || 'Sami') : (conv.user_full_name || conv.user_username || 'User');
            const unread = conv.unread_count || 0;

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-4 flex items-start gap-3 transition-colors relative ${
                  isActive
                    ? 'bg-[#111827] border-l-4 border-l-[#0284C7]'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Avatar Badge */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F17] rounded-full" title="Online" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                      {displayName}
                      {currentRole === 'user' && (
                        <span className="text-[10px] bg-[#0284C7]/20 text-[#0284C7] font-bold px-1.5 py-0.5 rounded">
                          Official
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatDate(conv.last_message_time || conv.updated_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate">
                    {conv.last_message_body || 'Start conversation...'}
                  </p>
                </div>

                {/* Unread Counter Badge */}
                {unread > 0 && (
                  <span className="shrink-0 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-full px-2 py-0.5 shadow-sm">
                    {unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
