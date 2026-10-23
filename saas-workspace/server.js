const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { handleStripeWebhook } = require('./controllers/webhookController')
const {tenantRateLimiter} = require('./middleware/rateLimiter')
const {resolveTenantDomain} = require('./middleware/domainTenant')
const Document = require('./models/Document');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server wrapping Express

// Attach Socket.io to HTTP Server with CORS allowed
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

connectDB();

app.use(cors());

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

app.use(resolveTenantDomain)

app.use(tenantRateLimiter);

// REST Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'))
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/audit-logs', require('./routes/authRoutes'));

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Donglify SaaS Workspace API running on Port 5005',
    resolvedTenant: req.workspace
      ? { id: req.workspace._id, name: req.workspace.name, slug: req.workspace.slug, customDomain: req.workspace.customDomain }
      : 'No tenant resolved from Host header.',
  });
});

const { protect } = require('./middleware/auth');
const { requirePlan } = require('./middleware/subscription');

app.get('/api/analytics/pro', protect, requirePlan('PRO'), (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Access Granted: You are viewing Pro Analytics for your workspace',
      activeUsers: 128,
      storageUsedGB: 4.2,
    }
  })
})
// --- REAL-TIME COLLABORATION ENGINE (SOCKET.IO) ---
const activeUsers = {}; // Tracks socketId -> { username, docId }

io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

  // 1. User joins document room
  socket.on('join-document', ({ docId, username }) => {
    socket.join(docId);
    activeUsers[socket.id] = { username, docId };
    console.log(`👤 ${username} (${socket.id}) joined Document Room: ${docId}`);

    // Notify other users in the same room
    socket.to(docId).emit('user-joined', {
      username,
      socketId: socket.id,
      timestamp: new Date(),
    });
  });

  // 2. Real-Time Document Synchronization (Broadcast changes)
  socket.on('send-changes', async ({ docId, content, updatedBy }) => {
    // Broadcast text changes to everyone in the room EXCEPT the sender
    socket.to(docId).emit('receive-changes', { content, updatedBy });

    // Optional: Auto-save to MongoDB (In Production: Use Debounce pattern)
    try {
      await Document.findByIdAndUpdate(docId, {
        content,
        lastUpdatedBy: updatedBy,
      });
    } catch (err) {
      console.error('Failed to auto-save document state:', err.message);
    }
  });

  // 3. Ephemeral Cursor Presence Tracking
  socket.on('cursor-move', ({ docId, username, position }) => {
    // Broadcast cursor position (e.g. { line: 2, column: 15 }) to room
    socket.to(docId).emit('cursor-update', {
      socketId: socket.id,
      username,
      position,
    });
  });

  // 4. Handle Disconnection
  socket.on('disconnect', () => {
    const user = activeUsers[socket.id];
    if (user) {
      console.log(`❌ User ${user.username} left document ${user.docId}`);
      socket.to(user.docId).emit('user-left', {
        socketId: socket.id,
        username: user.username,
      });
      delete activeUsers[socket.id];
    }
  });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
  console.log(`🚀 SaaS Collaborative Server running on http://localhost:${PORT}`);
});