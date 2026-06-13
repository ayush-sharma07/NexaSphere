function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function getClientIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwardedFor) return forwardedFor;

  const realIp = String(req.headers['x-real-ip'] || '').trim();
  if (realIp) return realIp;

  return String(req.ip || req.socket?.remoteAddress || 'unknown').trim() || 'unknown';
}

function createRateLimiter({ windowMs, max, message, keyPrefix }) {
  const hits = new Map();

  function cleanup(now) {
    for (const [key, entry] of hits.entries()) {
      if (entry.expiresAt <= now) {
        hits.delete(key);
      }
    }
  }

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    cleanup(now);

    const bucketKey = `${keyPrefix}:${getClientIp(req)}`;
    let bucket = hits.get(bucketKey);

    if (!bucket || bucket.expiresAt <= now) {
      bucket = {
        count: 0,
        expiresAt: now + windowMs,
      };
      hits.set(bucketKey, bucket);
    }

    bucket.count += 1;

    const resetAfterSeconds = Math.max(Math.ceil((bucket.expiresAt - now) / 1000), 1);
    const remaining = Math.max(max - bucket.count, 0);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.expiresAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(resetAfterSeconds));
      return res.status(429).json({
        error: message,
        retryAfter: resetAfterSeconds,
      });
    }

    return next();
  };
}

export { createRateLimiter, getClientIp, parsePositiveInteger };