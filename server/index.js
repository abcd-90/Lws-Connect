const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configRoutes = require('./routes/configRoutes');
const cmsRoutes = require('./routes/cmsRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory for media attachments
const uploadStaticDir = (process.env.VERCEL || process.env.NODE_ENV === 'production')
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadStaticDir));

// Serve static frontend build files in production
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API Routes (mounted under both /api/... and root /... for Vercel rewrite resilience)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/chat', chatRoutes);
app.use('/chat', chatRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/config', configRoutes);
app.use('/config', configRoutes);

app.use('/api/cms', cmsRoutes);
app.use('/cms', cmsRoutes);

// Socket.io Real-time Setup (Safe initialization)
let io = null;
try {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const activeSockets = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error: Token required'));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    activeSockets.set(userId, socket.id);

    socket.join(`user_${userId}`);
    if (socket.user.role === 'super_admin' || socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('typing_start', ({ conversationId, userName }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing_start', { conversationId, userId, userName });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing_stop', { conversationId, userId });
    });

    socket.on('send_message', (messageData) => {
      const { conversation_id } = messageData;
      io.to(`conv_${conversation_id}`).emit('new_message', messageData);
      if (socket.user.role === 'user') {
        io.to('admin_room').emit('admin_inbox_update', {
          type: 'NEW_USER_MESSAGE',
          conversationId: conversation_id,
          message: messageData
        });
      }
    });

    socket.on('theme_published', (publishedConfig) => {
      io.emit('theme_updated', publishedConfig);
    });

    socket.on('disconnect', () => {
      activeSockets.delete(userId);
    });
  });
} catch (err) {
  console.warn('Socket.io server initialization warning:', err.message);
}

// Client-side routing fallback (SPA fallback to index.html for non-API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/chat/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('LWS Direct Server Running in Development Mode. Frontend accessible via Vite dev server.');
    }
  });
});

// Global Express error handler to prevent Vercel FUNCTION_INVOCATION_FAILED crash
app.use((err, req, res, next) => {
  console.error('[EXPRESS ROUTE ERROR]:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    error: err.message || 'Internal server error processing request.'
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 LWS Direct Server running on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = { app, server };
