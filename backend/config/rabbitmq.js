// ─────────────────────────────────────────────────────────────
// RABBITMQ CONNECTION & PRODUCER (AMQP PROTOCOL)
// ─────────────────────────────────────────────────────────────
const amqp = require('amqplib');
const logger = require('../config/logger');

let channel;
let connection;

const EXCHANGE_NAME = 'order_events_exchange';

/**
 * Connect to RabbitMQ Cluster
 */
const connectRabbitMQ = async () => {
  if (!process.env.RABBITMQ_URL || process.env.RABBITMQ_URL === 'amqps://username:password@lemon.rmq.cloudamqp.com/vhost') {
    logger.warn('RabbitMQ URL not configured. Running in standalone mode.');
    return;
  }

  try {
    // 1. Connect to RabbitMQ Broker via AMQP Protocol
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // 2. Declare a Direct Exchange for Order Events
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    logger.info(' RabbitMQ Connected & Exchange Asserted Successfully!');
  } catch (error) {
    logger.error(`RabbitMQ Connection Error: ${error.message}`);
  }
};

/**
 * Publish an event to RabbitMQ Exchange
 * @param {string} routingKey - e.g. 'order.created', 'order.shipped'
 * @param {Object} data - Payload
 */
const publishOrderEvent = async (routingKey, data) => {
  if (!channel) {
    logger.warn('RabbitMQ channel not ready. Event skipped.');
    return;
  }

  try {
    const messageBuffer = Buffer.from(JSON.stringify(data));

    // Publish message to Exchange with routing key
    channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true // Save message to disk so it survives server crashes!
    });

    logger.info(`📥 RabbitMQ Published Event [${routingKey}] for Order #${data.orderId}`);
  } catch (error) {
    logger.error(`Failed to publish RabbitMQ event: ${error.message}`);
  }
};

module.exports = {
  connectRabbitMQ,
  publishOrderEvent,
  EXCHANGE_NAME
};