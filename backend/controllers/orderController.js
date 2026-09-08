const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { getIO } = require('../config/socket')

// CREATE order (from cart)
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount: cart.totalAmount
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    try {
      const io = getIO();
      io.to('admin_room').emit('new_order_placed', {
        message: `🎉 New Order Placed!`,
        totalAmount: order.totalAmount,
        customerName: req.user.name
      });
    } catch (err) {
      console.log('Socket notification notice:', err.message);
    }

    res.status(201).json({ success: true, message: 'Order placed!', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET my orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only owner or admin can view
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Status updated!', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get Sales Analytics & Monthly/Daily Trends (Admin)
// @route   GET /api/orders/analytics
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    // 1. Calculate overall totals
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. MongoDB Aggregation: Group Sales by Date (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort chronologically
    ]);

    // Format output for charts
    const chartData = dailyTrends.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.ordersCount
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalOrders,
        totalRevenue,
        paidOrdersCount: paidOrders.length
      },
      chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


