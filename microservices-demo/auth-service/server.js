const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;

// Redis Publisher (With Upstash Cloud or Local support)
const redisPublisher = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisPublisher.on('error', () => {}); // Mute connection error spam

// Connect Redis in background without blocking server
redisPublisher.connect()
  .then(() => console.log('⚡ Auth Service Redis Publisher Connected'))
  .catch(() => console.log('Redis offline (Auth Service running in standalone mode)'));

const users = [
  { id: '1', name: 'John Doe', email: 'john@gmail.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@gmail.com' }
];

// ── GET USER BY ID (Used by Order Service via Inter-Service REST) ──
app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// ── REGISTER USER ──
app.post('/register', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email required!' });
  }

  const newUser = { id: String(users.length + 1), name, email };
  users.push(newUser);

  // Publish Redis Event safely (non-blocking)
  if (redisPublisher.isOpen) {
    redisPublisher.publish('USER_EVENTS', JSON.stringify({
      event: 'USER_CREATED',
      data: newUser
    })).catch(() => {});
  }

  res.status(201).json({
    success: true,
    message: 'User registered in Auth Microservice!',
    user: newUser
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Microservice running on http://localhost:${PORT}`);
});