const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: String,       // Snapshot at order time
        price: Number,
        quantity: Number
      }
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      default: 'cod'
    },
    paymentIntent: {
      id: String,
      status: String,
      amount: Number
    },

    paidAt: Date,

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// DATABASE INDEXES


// 1. Compound Index for User Order History (My Orders Page)
// Used in: Order.find({ user: req.user.id }).sort('-createdAt')
orderSchema.index({ user: 1, createdAt: -1 });

// 2. Compound Index for Admin Analytics & Status Queries
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

