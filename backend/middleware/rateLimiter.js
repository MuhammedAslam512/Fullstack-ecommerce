// ─────────────────────────────────────────────────────────────
// CUSTOM REDIS SLIDING WINDOW RATE LIMITER
// ─────────────────────────────────────────────────────────────
const { createClient } = require('redis');

let redisClient;

const initRedisClient = async () => {
  if (!process.env.REDIS_URL) return;
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', () => {});
    await redisClient.connect();
  } catch (err) {}
};

initRedisClient();

/**
 * Redis Sliding Window Log Rate Limiter
 * @param {Object} options - { windowSizeInSeconds, maxRequests, keyPrefix }
 */
const customRateLimiter = ({
  windowSizeInSeconds = 60,
  maxRequests = 10,
  keyPrefix = 'rl'
}) => {
  return async (req, res, next) => {
    // Fallback if Redis is offline
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    try {
      // Identifier: Use authenticated User ID if logged in, otherwise use Client IP
      const identifier = req.user ? `user:${req.user.id}` : `ip:${req.ip || req.connection.remoteAddress}`;
      const redisKey = `ratelimit:${keyPrefix}:${identifier}`;

      const now = Date.now();
      const windowStart = now - windowSizeInSeconds * 1000;

      // 1. Remove timestamps older than the sliding window start
      await redisClient.zRemRangeByScore(redisKey, 0, windowStart);

      // 2. Count total requests in current sliding window
      const currentRequestCount = await redisClient.zCard(redisKey);

      // Set standard Rate Limit Headers
      const remainingRequests = Math.max(0, maxRequests - currentRequestCount - 1);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remainingRequests);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowSizeInSeconds * 1000) / 1000));

      // 3. Block if request limit exceeded
      if (currentRequestCount >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: `Too many requests! Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSizeInSeconds} seconds.`,
          retryAfterSeconds: windowSizeInSeconds
        });
      }

      // 4. Add current timestamp to Redis Sorted Set
      await redisClient.zAdd(redisKey, { score: now, value: `${now}:${Math.random()}` });

      // Set TTL on key so Redis auto-cleans empty sets
      await redisClient.expire(redisKey, windowSizeInSeconds);

      next();
    } catch (err) {
      // Fail open (don't block legitimate users if Redis errors out)
      next();
    }
  };
};

module.exports = customRateLimiter; 