const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Description required'],
      maxlength: 1000
    },
    price: {
      type: Number,
      required: [true, 'Price required'],
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    images: [{
      type: String
    }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: {
      type: String,
      trim: true
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);