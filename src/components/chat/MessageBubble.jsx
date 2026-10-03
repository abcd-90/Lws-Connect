import React, { useState } from 'react';
import { Check, CheckCheck, Clock, Download, FileText, Image as ImageIcon, Copy, Flag, CheckCircle2 } from 'lucide-react';

export function MessageBubble({ message, currentUserId, onReport }) {
  const [copied, setCopied] = useState(false);
  const isMe = message.sender_id === currentUserId;
  const isSystem = message.message_type === 'system';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs px-4 py-2 rounded-full max-w-md text-center shadow-sm flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{message.body}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative flex flex-col my-2 max-w-[82%] sm:max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      {/* Sender Header Name if not me */}
      {!isMe && (
        <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1 flex items-center gap-1.5">
          {message.sender_name || 'Sami'}
          {message.sender_role === 'super_admin' || message.sender_role === 'admin' ? (
            <span className="bg-[#0284C7]/20 text-[#0284C7] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Creator
            </span>
          ) : null}
        </span>
      )}

      {/* Main Bubble Card */}
      <div className={`relative px-4 py-3 rounded-2xl shadow-md text-sm leading-relaxed transition-all ${
        isMe
          ? 'bg-gradient-to-br from-[#0284C7] to-sky-700 text-white rounded-tr-xs'
          : 'bg-[#111827] border border-white/10 text-slate-100 rounded-tl-xs hover:border-white/20'
      }`}>
        {/* Body Text */}
        <p className="whitespace-pre-wrap break-words font-normal">{message.body}</p>

        {/* Attachment Card if attached */}
        {message.file_path && (
          <div className="mt-3 pt-2 border-t border-white/10">
            {message.file_type && message.file_type.startsWith('image/') ? (
              <a href={message.file_path} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg group/img">
                <img
                  src={message.file_path}
                  alt={message.file_name || 'Attachment image'}
                  className="max-h-60 w-auto object-cover rounded-lg group-hover/img:scale-105 transition-transform"
                />
              </a>
            ) : (
              <a
                href={message.file_path}
                download={message.file_name}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 hover:bg-black/40 transition text-xs border border-white/10"
              >
                <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">{message.file_name || 'Download Attachment'}</p>
                  <p className="text-[10px] text-slate-400">{(message.file_size / 1024).toFixed(1)} KB</p>
                </div>
                <Download className="w-4 h-4 text-slate-300" />
              </a>
            )}
          </div>
        )}

        {/* Footer timestamp & status icon */}
        <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${isMe ? 'text-sky-100/70' : 'text-slate-400'}`}>
          <span>{formatTime(message.created_at)}</span>
          {isMe && (
            <span>
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-300" title="Read by Sami" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-200" title="Delivered" />
              ) : (
                <Check className="w-3.5 h-3.5 opacity-70" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Floating Bar on Hover */}
      <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#0F172A] border border-slate-700/70 rounded-lg p-1 shadow-lg z-10 ${
        isMe ? '-left-16' : '-right-16'
      }`}>
        <button
          onClick={handleCopy}
          title="Copy text"
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        {!isMe && onReport && (
          <button
            onClick={() => onReport(message.id)}
            title="Report message"
            className="p-1 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400 transition"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
