import os from 'os';
import { isRedisConfigured } from './redisClient.js';
import { pool } from './db.js';
import { getQueueStats } from './taskQueue.js';

/**
 * System Observability, Telemetry & Crash Reporting Service
 * Provides production health diagnostics, resource monitoring, and structured error tracking.
 */

const MAX_ERROR_LOG_SIZE = 50;
const errorLog = [];
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

/**
 * Track an incoming request for metrics
 */
export function recordRequest(status) {
  requestCount++;
  if (status >= 400) {
    errorCount++;
  }
}

/**
 * Capture an exception with structured context
 */
export function captureException(err, context = {}) {
  const errorRecord = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    message: err?.message || String(err),
    stack: err?.stack || null,
    context,
    timestamp: new Date().toISOString(),
  };

  errorLog.unshift(errorRecord);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop();
  }

  console.error(`[observability] [${errorRecord.id}] ${errorRecord.message}`, {
    context,
    stack: err?.stack?.split('\n').slice(0, 3).join(' | '),
  });

  return errorRecord.id;
}

/**
 * Get recent system errors for diagnostics
 */
export function getRecentErrors() {
  return errorLog.slice(0, 20);
}

/**
 * Comprehensive System Health & Telemetry Report
 */
export async function getSystemHealth() {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.round((Date.now() - startTime) / 1000);

  // DB Health Check
  let dbStatus = pool ? 'HEALTHY' : 'NOT_CONNECTED';
  let dbLatencyMs = 0;
  if (pool) {
    try {
      const t0 = Date.now();
      await pool.query('SELECT 1');
      dbLatencyMs = Date.now() - t0;
      dbStatus = 'HEALTHY';
    } catch (err) {
      dbStatus = 'DEGRADED';
      captureException(err, { component: 'db_health_check' });
    }
  }

  return {
    status: dbStatus === 'HEALTHY' ? 'OK' : (dbStatus === 'NOT_CONNECTED' ? 'INITIALIZING' : 'DEGRADED'),
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    service: 'menusqr-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / (1024 * 1024)),
      totalMemoryMb: Math.round(os.totalmem() / (1024 * 1024)),
    },
    process: {
      pid: process.pid,
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      rssMb: Math.round(mem.rss / (1024 * 1024)),
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      totalCount: pool?.totalCount || 0,
      idleCount: pool?.idleCount || 0,
      waitingCount: pool?.waitingCount || 0,
    },
    redis: {
      configured: isRedisConfigured(),
      provider: isRedisConfigured() ? 'Upstash Serverless' : 'Disabled (Direct DB)',
    },
    taskQueue: getQueueStats(),
    metrics: {
      totalRequests: requestCount,
      totalErrors: errorCount,
      errorRate: requestCount > 0 ? `${((errorCount / requestCount) * 100).toFixed(2)}%` : '0.00%',
    },
  };
}
