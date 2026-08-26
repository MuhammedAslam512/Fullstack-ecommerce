// ─────────────────────────────────────────
// LOGGER MIDDLEWARE
// Runs on every single request
// ─────────────────────────────────────────

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  // When response finishes, log the time taken
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`
    );
  });

  next(); // ← VERY IMPORTANT! Move to next step
};

module.exports = logger;