const redis = require('../config/redis');

// Max 100 requests per minute per workspace
const LIMIT_WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

exports.tenantRateLimiter = async (req, res, next) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];

        // If no workspace header or Redis is offline, pass through safely
        if (!workspaceId || !redis || redis.status !== 'ready') {
            return next();
        }

        const key = `ratelimit:workspace:${workspaceId}`;
        const currentRequests = await redis.incr(key);

        if (currentRequests === 1) {
            await redis.expire(key, LIMIT_WINDOW_SECONDS);
        }

        res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - currentRequests));

        if (currentRequests > MAX_REQUESTS_PER_WINDOW) {
            return res.status(429).json({
                message: 'Too many requests from this workspace. Please slow down.',
                retryAfterSeconds: await redis.ttl(key),
            });
        }

        next();
    } catch (error) {
        console.error('Tenant Rate Limiter Error:', error.message);
        next(); // Pass through on error
    }
};