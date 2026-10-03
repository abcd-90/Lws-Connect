import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
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
    <div className="w-full bg-[#140D0F] border-t border-red-500/20 p-3 sm:p-4 transition-all">
      {/* Attachment Preview Chip */}
      {attachment && (
        <div className="mb-3 p-2 bg-[#0B0809] border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-slate-200 animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            {attachment.file_type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="truncate font-medium">{attachment.file_name}</span>
            <span className="text-[10px] text-slate-400">({(attachment.file_size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 text-xs text-red-400 bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-slate-400 hover:text-white cursor-pointer">
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
          className="p-2.5 rounded-xl bg-[#0B0809] border border-red-500/20 hover:bg-white/5 text-slate-300 hover:text-white disabled:opacity-50 transition shrink-0 cursor-pointer"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Paperclip className="w-5 h-5" />}
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
            className="w-full bg-[#0B0809] border border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none outline-none max-h-32 transition"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !attachment) || uploading || disabled}
          className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer ${
            (text.trim() || attachment) && !uploading && !disabled
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              : 'bg-[#0B0809] text-slate-600 cursor-not-allowed border border-red-500/10'
          }`}
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
