const { createClient } = require('redis');

let redisClient;
let isConnected = false; // Guard flag to log only ONCE

const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return new Error('Redis connection failed');
          }
          return 1000;
        }
      }
    });

    redisClient.on('error', () => {}); 

    // Log connection ONCE
    redisClient.on('connect', () => {
      if (!isConnected) {
        console.log('⚡ Upstash Cloud Redis Connected');
        isConnected = true;
      }
    });

    await redisClient.connect();
  } catch (err) {
    console.log('Redis unavailable (falling back to direct DB queries)');
  }
};

initRedis();

const cacheMiddleware = (durationInSeconds = 60) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    const key = `express_cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200) {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

const clearCache = async (keyPattern) => {
  if (redisClient && redisClient.isOpen) {
    try {
      const keys = await redisClient.keys(`express_cache:${keyPattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🧹 Redis Cache Cleared: ${keyPattern}`);
      }
    } catch (err) {}
  }
};

module.exports = { cacheMiddleware, clearCache };