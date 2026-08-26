const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper: Update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: avgRating.toFixed(1),
    numReviews: reviews.length
  });
};

// GET product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE review
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment
    });

    await updateProductRating(productId);

    res.status(201).json({ success: true, message: 'Review added!', data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already reviewed this product' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ success: true, message: 'Review deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};