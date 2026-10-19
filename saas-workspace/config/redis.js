const Redis = require('ioredis')

let redis = null;

try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
    })

    redis.on('connect', () => console.log('Redis connected for Tenent Rate Limiting'));
    redis.on('error', (err) => console.warn('Redis Connection Error (Fallback to memory mode):', err.message));
} catch (error) {
    console.warn('Redis initialization skipped');
}


module.exports = redis