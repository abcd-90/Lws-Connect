import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeProvider';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const { setTheme, applyThemeToDOM } = useTheme();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // convId -> { userId: userName }

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io('/', {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('[Socket.io] Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('theme_updated', (updatedConfig) => {
      if (updatedConfig) {
        setTheme(updatedConfig);
        applyThemeToDOM(updatedConfig);
      }
    });

    newSocket.on('user_typing_start', ({ conversationId, userId, userName }) => {
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: { ...(prev[conversationId] || {}), [userId]: userName }
      }));
    });

    newSocket.on('user_typing_stop', ({ conversationId, userId }) => {
      setTypingUsers(prev => {
        const copy = { ...(prev[conversationId] || {}) };
        delete copy[userId];
        return { ...prev, [conversationId]: copy };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  const joinConversation = (convId) => {
    if (socket) socket.emit('join_conversation', convId);
  };

  const leaveConversation = (convId) => {
    if (socket) socket.emit('leave_conversation', convId);
  };

  const sendTypingStart = (convId, userName) => {
    if (socket) socket.emit('typing_start', { conversationId: convId, userName });
  };

  const sendTypingStop = (convId) => {
    if (socket) socket.emit('typing_stop', { conversationId: convId });
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinConversation,
      leaveConversation,
      sendTypingStart,
      sendTypingStop,
      typingUsers
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
