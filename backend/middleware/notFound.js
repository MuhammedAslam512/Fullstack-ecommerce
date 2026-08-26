// ─────────────────────────────────────────
// 404 MIDDLEWARE
// Runs when no route matches
// ─────────────────────────────────────────

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error); // Pass error to errorHandler
};

module.exports = notFound;