import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { apiFetch } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, Flag, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export function ChatRoom({ conversationId, onBack, currentRole }) {
  const { user } = useAuth();
  const { socket, joinConversation, leaveConversation, typingUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('other');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/chat/conversations/${conversationId}/messages`);
      setConversation(data.conversation);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    if (conversationId) {
      joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket real-time message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.conversation_id === conversationId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  const handleSendMessage = async ({ body, attachment }) => {
    try {
      const data = await apiFetch(`/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, attachment })
      });

      // Optimistically add message
      setMessages(prev => [...prev, data.message]);

      // Emit socket event
      if (socket) {
        socket.emit('send_message', data.message);
      }
    } catch (err) {
      alert(`Error sending message: ${err.message}`);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/chat/report', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: conversationId,
          category: reportCategory,
          details: reportDetails
        })
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
      }, 1500);
    } catch (err) {
      alert(`Report failed: ${err.message}`);
    }
  };

  const isTyping = typingUsers[conversationId] && Object.keys(typingUsers[conversationId]).length > 0;
  const recipientTitle = currentRole === 'user' ? 'Sami (Learn With Sami)' : (conversation ? `User: ${conversation.user_full_name || conversation.user_username}` : 'User');

  return (
    <div className="w-full h-full flex flex-col bg-[#0B0809] relative overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-[#140D0F] border-b border-red-500/20 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-slate-300 md:hidden cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src="/logo.png"
              alt="Sami Avatar"
              className="w-10 h-10 rounded-full object-cover border border-red-500 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#140D0F] rounded-full" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              {recipientTitle}
              <ShieldCheck className="w-4 h-4 text-red-500" title="Verified Channel" />
            </h3>
            <p className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Online • Private Direct Line
            </p>
          </div>
        </div>

        {/* Header Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition flex items-center gap-1.5 cursor-pointer"
            title="Report conversation issue"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          <button
            onClick={fetchMessages}
            title="Refresh messages"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message History Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
            Loading secure conversation...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 mr-2" /> {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShieldCheck className="w-12 h-12 text-red-500 mb-3 opacity-90" />
            <h4 className="text-base font-bold text-white">Your direct conversation starts here</h4>
            <p className="text-xs max-w-sm mt-1 text-slate-300">
              Messages are transmitted directly inside this platform. Your phone number is never exposed.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={user?.id}
            />
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-red-400 italic bg-red-950/40 px-3 py-1.5 rounded-full w-fit border border-red-500/30 animate-fade-in">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Someone is typing a response...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <MessageComposer
        conversationId={conversationId}
        onSendMessage={handleSendMessage}
        disabled={loading}
      />

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140D0F] border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" /> Report Issue or Feedback
            </h3>

            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-400 space-y-2">
                <CheckCircle className="w-10 h-10 mx-auto" />
                <p className="font-semibold text-sm">Report submitted successfully. Thank you.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="spam">Spam / Unsolicited</option>
                    <option value="harassment">Abuse or Harassment</option>
                    <option value="technical">Technical Issue</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Details</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide additional context for moderation team..."
                    className="w-full bg-[#0B0809] border border-red-500/20 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
