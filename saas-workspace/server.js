const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: '🏢 B2B Multi-Tenant SaaS Workspace API Active' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

const PORT = 5005;
app.listen(PORT, () => {
  console.log(`🏢 SaaS Workspace API running on http://localhost:${PORT}`);
});