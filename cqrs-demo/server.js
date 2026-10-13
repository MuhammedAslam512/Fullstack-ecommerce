const express = require('express');

// Import Busses
const commandBus = require('./bus/CommandBus');
const queryBus = require('./bus/QueryBus');

// Import Commands & Handlers
const CreateOrderCommand = require('./commands/CreateOrderCommand');
const CreateOrderHandler = require('./commands/CreateOrderHandler');

// Import Queries & Handlers
const GetOrderAnalyticsQuery = require('./queries/GetOrderAnalyticsQuery');
const GetOrderAnalyticsHandler = require('./queries/GetOrderAnalyticsHandler');

const app = express();
app.use(express.json());

// ── REGISTER HANDLERS ON BUSES ─────────────────────────────
commandBus.register(CreateOrderCommand, new CreateOrderHandler());
queryBus.register(GetOrderAnalyticsQuery, new GetOrderAnalyticsHandler());

// ── 1. WRITE ENDPOINT (Command) ──────────────────────────────
app.post('/api/cqrs/orders', async (req, res) => {
  try {
    const command = new CreateOrderCommand(req.body);
    const result = await commandBus.dispatch(command);

    res.status(201).json({
      success: true,
      message: '⚡ Command Executed via Write Path!',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── 2. READ ENDPOINT (Query) ────────────────────────────────
app.get('/api/cqrs/analytics', async (req, res) => {
  try {
    const query = new GetOrderAnalyticsQuery(req.query);
    const result = await queryBus.execute(query);

    res.status(200).json({
      success: true,
      message: '⚡ Query Executed via Ultra-Fast Read Path!',
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`⚡ CQRS Express Server running on http://localhost:${PORT}`);
});