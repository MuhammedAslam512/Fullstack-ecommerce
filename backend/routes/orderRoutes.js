// const express = require('express');
// const router = express.Router();
// const {
//   createOrder,
//   getMyOrders,
//   getOrder,
//   getAllOrders,
//   updateOrderStatus,
//   getSalesAnalytics
// } = require('../controllers/orderController');
// const { protect, authorize } = require('../middleware/auth');

// router.use(protect);

// router.post('/', createOrder);
// router.get('/my', getMyOrders);
// router.get('/:id', getOrder);

// // Admin routes
// router.get('/', authorize('admin'), getAllOrders);
// router.put('/:id/status', authorize('admin'), updateOrderStatus);
// router.get('/analytics', protect, authorize('admin'), getSalesAnalytics);
// module.exports = router;


const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getSalesAnalytics
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);

// ✅ ADMIN ANALYTICS MUST BE ABOVE /:id
router.get('/analytics', protect, authorize('admin'), getSalesAnalytics);

// Admin all orders
router.get('/', protect, authorize('admin'), getAllOrders);

// Single order + status
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;