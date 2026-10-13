const { writeDatabase, projectOrderCreated } = require('../db');

class CreateOrderHandler {
  async handle(command) {
    // 1. Business Validation
    if (!command.customerName || command.totalAmount <= 0) {
      throw new Error('Command Validation Failed: Invalid order details.');
    }

    // 2. Create Write Entity
    const newOrder = {
      id: `ORD_${writeDatabase.orders.length + 101}`,
      customerName: command.customerName,
      items: command.items,
      totalAmount: command.totalAmount,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    // 3. Persist in Write Store
    writeDatabase.orders.push(newOrder);

    // 4. Update Read Projection (Asynchronous/Sync Projection)
    projectOrderCreated(newOrder);

    return { orderId: newOrder.id, status: 'CREATED' };
  }
}

module.exports = CreateOrderHandler;