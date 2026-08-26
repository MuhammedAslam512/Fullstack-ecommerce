const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET my cart
exports.getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items in stock` 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Check if item already in cart
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
    }

    res.json({ success: true, message: 'Added to cart!', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, message: 'Cart updated!', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();

    res.json({ success: true, message: 'Removed from cart!', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalAmount: 0 }
    );
    res.json({ success: true, message: 'Cart cleared!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

