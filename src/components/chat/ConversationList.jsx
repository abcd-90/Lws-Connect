import React, { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';

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
    <div className="w-full h-full flex flex-col bg-[#140D0F] border-r border-red-500/20">
      {/* Search Header */}
      <div className="p-4 border-b border-red-500/20">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Conversations Scroll Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-red-500/10">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-500/40" />
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
                className={`w-full text-left p-4 flex items-start gap-3 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'bg-[#0B0809] border-l-4 border-l-red-500'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Avatar Badge */}
                <div className="relative shrink-0">
                  {currentRole === 'user' ? (
                    <img
                      src="/logo.png"
                      alt="Sami"
                      className="w-10 h-10 rounded-full object-cover border border-red-500 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center font-bold text-sm text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#140D0F] rounded-full" title="Online" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      {displayName}
                      {currentRole === 'user' && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 font-extrabold px-1.5 py-0.5 rounded border border-red-500/30">
                          Official
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDate(conv.last_message_time || conv.updated_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 truncate">
                    {conv.last_message_body || 'Start conversation...'}
                  </p>
                </div>

                {/* Unread Counter Badge */}
                {unread > 0 && (
                  <span className="shrink-0 bg-red-600 text-white font-extrabold text-[10px] rounded-full px-2 py-0.5 shadow-sm">
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
