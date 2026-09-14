const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('redis');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5002;
const AUTH_SERVICE_URL = 'http://localhost:5001';

// Redis Subscriber
const redisSubscriber = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisSubscriber.on('error', () => {});

redisSubscriber.connect().then(async () => {
  console.log('⚡ Order Service Redis Subscriber Connected');
  await redisSubscriber.subscribe('USER_EVENTS', (message) => {
    const payload = JSON.parse(message);
    console.log(`🔔 [EVENT RECEIVED from Auth Service]: ${payload.event}`, payload.data);
  });
}).catch(() => console.log('Redis offline (Order Service running in standalone mode)'));

const orders = [];

// ── CREATE ORDER (Calls Auth Service via Inter-Service REST) ──
app.post('/orders', async (req, res) => {
  const { userId, item, amount } = req.body;

  try {
    // Inter-Service REST HTTP Call to Auth Service on Port 5001!
    const authRes = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}`);
    const user = authRes.data.user;

    const newOrder = {
      orderId: `ORD_${orders.length + 101}`,
      item,
      amount,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order created via Inter-Service Communication!',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to communicate with Auth Service: ' + (error.response?.data?.message || error.message)
    });
  }
});

app.listen(PORT, () => {
  console.log(`🛒 Order Microservice running on http://localhost:${PORT}`);
});