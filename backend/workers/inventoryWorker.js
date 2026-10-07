// ------------------------------------------------------------
// RABBITMQ INVENTORY CONSUMER WORKER
// ------------------------------------------------------------
const amqp = require('amqplib');
const Product = require('../models/Product');
const logger = require('../config/logger');

const QUEUE_NAME = 'inventory_deduction_queue';
const EXCHANGE_NAME = 'order_events_exchange';
const ROUTING_KEY = 'order.created';

const startInventoryWorker = async () => {
  if (!process.env.RABBITMQ_URL || process.env.RABBITMQ_URL === 'amqps://username:password@lemon.rmq.cloudamqp.com/vhost') {
    return;
  }

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 1. Assert Exchange and Queue
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 2. Bind Queue to Exchange using Routing Key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    logger.info(`🐇 RabbitMQ Inventory Worker Listening on Queue: [${QUEUE_NAME}]...`);

    // 3. Consume messages from Queue
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const eventData = JSON.parse(msg.content.toString());
          logger.info(`⚙️ [RABBITMQ CONSUMER] Processing Order Event #${eventData.orderId}...`);

          // Deduct product stock in MongoDB
          if (eventData.items && Array.isArray(eventData.items)) {
            for (const item of eventData.items) {
              if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                  $inc: { stock: -item.quantity }
                });
                logger.info(`📉 Deducted ${item.quantity} stock for Product #${item.product}`);
              }
            }
          }

          // Acknowledge message (Tells RabbitMQ to remove message from queue)
          channel.ack(msg);
          logger.info(`✅ [RABBITMQ CONSUMER] Acknowledged Job for Order #${eventData.orderId}`);

        } catch (err) {
          logger.error(`Error processing inventory job: ${err.message}`);
          // Reject message and requue if failed
          channel.nack(msg, false, true);
        }
      }
    });

  } catch (error) {
    logger.error(`RabbitMQ Inventory Worker Error: ${error.message}`);
  }
};

module.exports = startInventoryWorker;