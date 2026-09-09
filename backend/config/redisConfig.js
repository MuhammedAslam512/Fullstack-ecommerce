// ─────────────────────────────────────────────────────────────
// SHARED REDIS CONNECTION FOR BULLMQ QUEUES & WORKERS
// ─────────────────────────────────────────────────────────────
const parseRedisUrl = (urlStr) => {
  if (!urlStr) {
    return { host: '127.0.0.1', port: 6379 };
  }

  try {
    const url = new URL(urlStr);
    return {
      host: url.hostname,
      port: Number(url.port) || 6379,
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined
    };
  } catch (err) {
    console.error('Redis URL parse error, falling back to localhost:', err.message);
    return { host: '127.0.0.1', port: 6379 };
  }
};

const redisConnection = parseRedisUrl(process.env.REDIS_URL);

module.exports = redisConnection;