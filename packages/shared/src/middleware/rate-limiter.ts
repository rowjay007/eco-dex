import { Request, Response, NextFunction } from 'express';
import { Redis } from '@upstash/redis';

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const redis = new Redis({
    url: process.env.REDIS_URL || 'redis://redis:6379',
    token: process.env.REDIS_TOKEN || '',
  });

  const { windowMs, max, keyPrefix = 'rate-limit:' } = options;

  return async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const key = `${keyPrefix}${req.ip}`;
    
    try {
      const [current] = await redis.pipeline()
        .incr(key)
        .expire(key, Math.floor(windowMs / 1000))
        .exec();

      const totalHits = current as number;

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - totalHits));

      if (totalHits > max) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.'
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
}