import { Redis } from '@upstash/redis';

let redis = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[redis] Upstash Redis cache client initialized successfully.');
  } catch (err) {
    console.warn('[redis] Failed to initialize Upstash Redis:', err.message);
    redis = null;
  }
} else {
  console.log('[redis] UPSTASH_REDIS_REST_URL/TOKEN not fully provided. Running in DB-direct fallback mode.');
}

/**
 * Check if Redis client is ready to use
 */
export function isRedisConfigured() {
  return Boolean(redis);
}

/**
 * Get cached menu payload for a given tenant slug
 * Returns null on miss or error (failsafe fallback to Postgres)
 */
export async function getCachedMenu(slug) {
  if (!redis || !slug) return null;
  try {
    const key = `menu:${slug.toLowerCase().trim()}`;
    const data = await redis.get(key);
    return data;
  } catch (err) {
    console.warn(`[redis] Error fetching menu cache for "${slug}":`, err.message);
    return null;
  }
}

/**
 * Cache menu payload for a given tenant slug
 * Default TTL: 24 hours (86400 seconds)
 */
export async function setCachedMenu(slug, data, ttlSeconds = 86400) {
  if (!redis || !slug || !data) return;
  try {
    const key = `menu:${slug.toLowerCase().trim()}`;
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[redis] Error setting menu cache for "${slug}":`, err.message);
  }
}

/**
 * Invalidate cached menu for a given tenant slug (e.g. after owner updates items or appearance)
 */
export async function invalidateMenuCache(slug) {
  if (!redis || !slug) return;
  try {
    const key = `menu:${slug.toLowerCase().trim()}`;
    await redis.del(key);
    console.log(`[redis] Invalidated menu cache for "${slug}".`);
  } catch (err) {
    console.warn(`[redis] Error invalidating menu cache for "${slug}":`, err.message);
  }
}

export default redis;
