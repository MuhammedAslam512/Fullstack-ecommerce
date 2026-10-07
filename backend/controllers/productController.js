const Product = require('../models/Product');
const { clearCache } = require('../middleware/cache')

// GET all products (public) - with pagination, search, filter
exports.getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { isActive: true };

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { brand: regex }
      ];
    }

    // Sort
    const sort = req.query.sort || '-createdAt';

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created!', data: product });
    clearCache('/api/products')
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated!', data: product });
    clearCache('/api/products')
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPLOAD product images (admin)
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload images' });
    }

    const imagePaths = req.files.map(file => file.path);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imagePaths } } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Images uploaded!', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// FACETED SEARCH & MULTI-STAGE AGGREGATION PIPELINE
// GET /api/products/faceted-search
// -------------------------------------------------------------
exports.getFacetedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // 1. Initial Match Stage (Keyword Search + Active Products)
    let matchStage = { isActive: true };

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      matchStage.$or = [{ name: regex }, { brand: regex }, { description: regex }];
    }

    if (req.query.minPrice || req.query.maxPrice) {
      matchStage.price = {};
      if (req.query.minPrice) matchStage.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) matchStage.price.$lte = parseFloat(req.query.maxPrice);
    }

    // 2. Execute $facet Aggregation Pipeline
    const results = await Product.aggregate([
      // Stage 1: Filter products matching search criteria
      { $match: matchStage },

      // Stage 2: $facet runs parallel sub-pipelines
      {
        $facet: {
          // Sub-pipeline A: Paginated Product Data + Joined Category Info ($lookup)
          products: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'categories',        // Collection name
                localField: 'category',    // Field in Product
                foreignField: '_id',       // Field in Category
                as: 'categoryDetails'      // Output array
              }
            },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } }
          ],

          // Sub-pipeline B: Calculate Total Product Count
          totalCount: [
            { $count: 'count' }
          ],

          // Sub-pipeline C: Calculate Brand Counts for Sidebar Filters
          brandStats: [
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],

          // Sub-pipeline D: Calculate Min, Max, and Average Prices
          priceStats: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' }
              }
            }
          ]
        }
      }
    ]);

    // Format output
    const facetData = results[0];
    const totalProducts = facetData.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: {
        products: facetData.products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts
        },
        facets: {
          brands: facetData.brandStats.map(b => ({ brand: b._id || 'Generic', count: b.count })),
          priceRange: facetData.priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// -------------------------------------------------------------
// INSTANT AUTO-COMPLETE SEARCH WITH RELEVANCE SCORING
// GET /api/products/autocomplete?q=iphone
// -------------------------------------------------------------
exports.getAutoCompleteSuggestions = async (req, res) => {
  try {
    const query = req.query.q || '';

    if (!query || query.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(query.trim(), 'i');

    // Fast Regex Search on Active Products
    const suggestions = await Product.find({
      isActive: true,
      $or: [
        { name: regex },
        { brand: regex },
        { description: regex }
      ]
    })
      .select('name price brand images category') // Fetch only lightweight fields!
      .sort('-createdAt')
      .limit(6); // Return top 6 instant suggestions for dropdown UI

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });

  } catch (error) {
    console.error('Autocomplete Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};