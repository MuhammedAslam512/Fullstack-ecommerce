// ─────────────────────────────────────────
// ERROR HANDLER MIDDLEWARE
// Runs when something goes wrong
// ─────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
    // Only show error stack in development
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
};

module.exports = errorHandler;