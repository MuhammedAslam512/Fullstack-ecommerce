// ----------------------------------------------------------
// CQRS IN-MEMORY DATABASE (SEPARATE WRITE & READ STORES)
//  ---------------------------------------------------------

// 1. Write Store (Normalized data for commands)
const writeDatabase = {
  orders: []
};

// 2. Read Store (Pre-aggregated projections optimized for queries)
const readDatabase = {
  orderSummaries: [],
  analytics: {
    totalRevenue: 0,
    totalOrders: 0
  }
};

// Projection Engine: Syncs Write changes into Optimized Read Models
const projectOrderCreated = (order) => {
  // Update Read Summary
  readDatabase.orderSummaries.push({
    id: order.id,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    status: order.status
  });

  // Update Pre-computed Analytics
  readDatabase.analytics.totalOrders += 1;
  readDatabase.analytics.totalRevenue += order.totalAmount;
};

module.exports = {
  writeDatabase,
  readDatabase,
  projectOrderCreated
};