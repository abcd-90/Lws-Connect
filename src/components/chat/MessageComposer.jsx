import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Loader2, Smile } from 'lucide-react';
import { uploadFile } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

export function MessageComposer({ conversationId, onSendMessage, disabled = false }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const { sendTypingStart, sendTypingStop } = useSocket();
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Trigger socket typing event
    if (sendTypingStart && conversationId) {
      sendTypingStart(conversationId, 'User');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(conversationId);
      }, 2500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadFile(file);
      setAttachment(uploaded);
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || uploading || disabled) return;

    onSendMessage({
      body: text.trim() || (attachment ? `[Attachment: ${attachment.file_name}]` : ''),
      attachment: attachment
    });

    setText('');
    setAttachment(null);
    if (sendTypingStop && conversationId) sendTypingStop(conversationId);
  };

  return (
    <div className="w-full bg-[#0F172A] border-t border-white/10 p-3 sm:p-4 transition-all">
      {/* Attachment Preview Chip */}
      {attachment && (
        <div className="mb-3 p-2 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-200 animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            {attachment.file_type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="truncate font-medium">{attachment.file_name}</span>
            <span className="text-[10px] text-slate-400">({(attachment.file_size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          title="Attach image or document"
          className="p-2.5 rounded-xl bg-slate-800/70 border border-white/10 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-50 transition shrink-0"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-sky-400" /> : <Paperclip className="w-5 h-5" />}
        </button>

        {/* Main Text Area */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to Sami... (Shift + Enter for newline)"
            rows={1}
            disabled={disabled}
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-32 transition"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !attachment) || uploading || disabled}
          className={`btn-dynamic px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            (text.trim() || attachment) && !uploading && !disabled
              ? 'bg-gradient-to-r from-[#0284C7] to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white shadow-sky-900/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
