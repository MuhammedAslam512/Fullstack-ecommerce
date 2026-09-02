const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// CREATE PAYMENT INTENT
// POST /api/payments/create-payment-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID required!'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found!'
      });
    }

    // Owner check
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized!'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid!'
      });
    }

    // Stripe amount is in cents/paise
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    order.paymentIntent = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: order.totalAmount
    };
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: order.totalAmount,
      orderId: order._id
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CONFIRM PAYMENT
// POST /api/payments/confirm
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID required!'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`
      });
    }

    const order = await Order.findOneAndUpdate(
      { 'paymentIntent.id': paymentIntentId },
      {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paidAt: new Date(),
        'paymentIntent.status': 'succeeded'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found!'
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ Payment successful!',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};