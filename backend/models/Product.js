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



// DATABASE INDEXES (QUERY OPTIMIZATION)

// 1. Text Index for Full-Text Search (Fast name & brand keyword searching!)
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

// 2. Compound Index for Category Filtering + Price Sorting (ESR Rule)
// Used in: GET /api/products?category=123&sort=-price
productSchema.index({ category: 1, price: -1 });

// 3. Compound Index for Price Range Queries + Date Sorting
// Used in: GET /api/products?minPrice=1000&maxPrice=5000
productSchema.index({ price: 1, createdAt: -1 });

// 4. Index on Active Products
productSchema.index({ isActive: 1 });


module.exports = mongoose.model('Product', productSchema);
