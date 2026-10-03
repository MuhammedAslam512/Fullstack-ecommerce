// SERVER-SENT EVENTS (SSE) CONTROLLER & MANAGER
// ------------------------------------------------------
const logger = require('../config/logger');

// Store active SSE client response objects
let clients = [];

/**
 * SSE Stream Endpoint
 * GET /api/notifications/stream
 */
const sseStreamHandler = (req, res) => {
  // 1. Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 2. Send initial connection event
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  logger.info(`⚡ SSE Client Connected: ${clientId} (Total Active Streams: ${clients.length})`);

  // Send initial handshake message to browser
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, message: 'SSE Stream Active!' })}\n\n`);

  // 3. Keep-Alive Heartbeat every 20 seconds (Prevents proxies from closing connection)
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  // 4. Handle client disconnection
  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter(client => client.id !== clientId);
    logger.info(`❌ SSE Client Disconnected: ${clientId} (Remaining Streams: ${clients.length})`);
  });
};

/**
 * Broadcast an event to ALL connected SSE clients
 * @param {string} eventName - Custom event name (e.g. 'order_update', 'live_stock')
 * @param {Object} data - Payload object
 */
const broadcastSSEEvent = (eventName, data) => {
  if (clients.length === 0) return;

  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  clients.forEach(client => {
    client.res.write(payload);
  });

  logger.info(`📢 SSE Broadcast [${eventName}] to ${clients.length} clients`);
};

module.exports = {
  sseStreamHandler,
  broadcastSSEEvent
};