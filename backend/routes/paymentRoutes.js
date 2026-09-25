const express = require('express');
const router = express.Router();

const {
  createPaymentIntent,
  confirmPayment
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');
const customRateLimiter = require('../middleware/rateLimiter')

const paymentLimiter = customRateLimiter({
  windowSizeInSeconds: 60,
  maxRequests: 5,
  keyPrefix: 'payments'
});



router.post('/create-payment-intent', protect, paymentLimiter , createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;