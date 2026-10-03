// ─────────────────────────────────────────────────────────────
// DOUBLE SUBMIT COOKIE ANTI-CSRF PROTECTION
// ─────────────────────────────────────────────────────────────
const { doubleCsrf } = require('csrf-csrf');

const {
  generateToken, // Generates Anti-CSRF Token for client
  doubleCsrfProtection // Middleware to validate incoming x-csrf-token header
} = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET || 'super_secret_csrf_key_123',
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-ps.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64, // Token length
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // GET requests don't modify data, so they are exempt
  getTokenFromRequest: (req) => {
    // Extract CSRF token from incoming request headers
    return req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  }
});

// Custom wrapper to ignore CSRF on Webhooks (Stripe needs raw payloads)
const csrfProtection = (req, res, next) => {
  // Exclude Stripe Webhook & Development testing from CSRF
  if (req.originalUrl === '/api/payments/webhook' || process.env.NODE_ENV === 'development') {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
};

module.exports = {
  generateToken,
  csrfProtection
};