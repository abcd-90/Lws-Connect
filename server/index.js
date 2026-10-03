const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static frontend build files in production
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/cms', cmsRoutes);

// Socket.io Real-time Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active socket connections by userId
const activeSockets = new Map(); // userId -> socketId

// Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  activeSockets.set(userId, socket.id);

  console.log(`[Socket.io] User connected: ${userId} (${socket.user.role})`);

  // User joins their personal user room & admin room if applicable
  socket.join(`user_${userId}`);
  if (socket.user.role === 'super_admin' || socket.user.role === 'admin') {
    socket.join('admin_room');
  }

  // Join Conversation Room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
    console.log(`[Socket.io] User ${userId} joined room conv_${conversationId}`);
  });

  // Leave Conversation Room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv_${conversationId}`);
  });

  // Typing Start
  socket.on('typing_start', ({ conversationId, userName }) => {
    socket.to(`conv_${conversationId}`).emit('user_typing_start', {
      conversationId,
      userId,
      userName
    });
  });

  // Typing Stop
  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('user_typing_stop', {
      conversationId,
      userId
    });
  });

  // New Message Broadcast
  socket.on('send_message', (messageData) => {
    const { conversation_id } = messageData;
    // Broadcast to room
    io.to(`conv_${conversation_id}`).emit('new_message', messageData);
    // Broadcast notification to admin room if sent by regular user
    if (socket.user.role === 'user') {
      io.to('admin_room').emit('admin_inbox_update', {
        type: 'NEW_USER_MESSAGE',
        conversationId: conversation_id,
        message: messageData
      });
    }
  });

  // Theme Published Real-time Event
  socket.on('theme_published', (publishedConfig) => {
    io.emit('theme_updated', publishedConfig);
  });

  socket.on('disconnect', () => {
    activeSockets.delete(userId);
    console.log(`[Socket.io] User disconnected: ${userId}`);
  });
});

// Client-side routing fallback (SPA fallback to index.html for non-API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('LWS Direct Server Running in Development Mode. Frontend accessible via Vite dev server.');
    }
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
