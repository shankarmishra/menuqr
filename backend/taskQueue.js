import { randomUUID } from 'node:crypto';
import { broadcastOrderEvent } from './orderStream.js';

/**
 * Resilient Asynchronous Task Queue Worker
 * Manages background execution of heavy tasks (e.g. PDF Parsing, AI generation, bulk data imports)
 * without blocking the HTTP request-response thread.
 */

// In-memory job state store (Map<jobId, JobRecord>)
const jobs = new Map();
const queue = [];
let isWorkerRunning = false;

const MAX_COMPLETED_HISTORY = 100;

export const TASK_TYPES = {
  PDF_IMPORT: 'PDF_IMPORT',
  AI_SYNTHESIS: 'AI_SYNTHESIS',
  IMAGE_OPTIMIZE: 'IMAGE_OPTIMIZE',
  BULK_MENU_IMPORT: 'BULK_MENU_IMPORT',
};

/**
 * Enqueue a heavy background task
 * @param {string} type - One of TASK_TYPES
 * @param {object} payload - Job payload
 * @param {string} tenantId - Tenant ID
 * @param {function} handler - Async function(payload, updateProgress) => result
 * @returns {object} Job summary with jobId
 */
export function enqueueTask(type, payload, tenantId, handler) {
  const jobId = `job_${Date.now()}_${randomUUID().slice(0, 8)}`;
  
  const job = {
    id: jobId,
    type,
    tenantId,
    payload,
    handler,
    status: 'QUEUED',
    progress: 0,
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  };

  jobs.set(jobId, job);
  queue.push(jobId);

  // Trigger worker loop
  processNextJob();

  return {
    jobId,
    status: 'QUEUED',
    createdAt: job.createdAt,
  };
}

/**
 * Get job status and progress
 * @param {string} jobId 
 * @param {string} [tenantId] - Optional tenant validation
 */
export function getJobStatus(jobId, tenantId) {
  const job = jobs.get(jobId);
  if (!job) return null;
  if (tenantId && job.tenantId !== tenantId) return null;

  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  };
}

/**
 * Worker loop: pulls next job from queue and executes safely
 */
async function processNextJob() {
  if (isWorkerRunning || queue.length === 0) return;
  isWorkerRunning = true;

  const jobId = queue.shift();
  const job = jobs.get(jobId);

  if (!job) {
    isWorkerRunning = false;
    return processNextJob();
  }

  job.status = 'PROCESSING';
  job.startedAt = new Date().toISOString();

  const updateProgress = (pct) => {
    job.progress = Math.min(100, Math.max(0, Math.round(pct)));
    try {
      broadcastOrderEvent(job.tenantId, 'job_progress', {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
      });
    } catch {
      // Ignore broadcast errors
    }
  };

  try {
    const result = await job.handler(job.payload, updateProgress);
    job.status = 'COMPLETED';
    job.progress = 100;
    job.result = result;
    job.completedAt = new Date().toISOString();

    try {
      broadcastOrderEvent(job.tenantId, 'job_completed', {
        jobId: job.id,
        status: 'COMPLETED',
        result,
      });
    } catch {
      // Ignore broadcast errors
    }
  } catch (err) {
    job.status = 'FAILED';
    job.error = err.message || 'Job execution failed.';
    job.completedAt = new Date().toISOString();

    try {
      broadcastOrderEvent(job.tenantId, 'job_failed', {
        jobId: job.id,
        status: 'FAILED',
        error: job.error,
      });
    } catch {
      // Ignore broadcast errors
    }
  } finally {
    isWorkerRunning = false;
    cleanupOldJobs();
    // Process next queued job
    setImmediate(processNextJob);
  }
}

/**
 * Memory management: Keep completed jobs bounded
 */
function cleanupOldJobs() {
  if (jobs.size > MAX_COMPLETED_HISTORY * 2) {
    const completed = Array.from(jobs.values()).filter(j => ['COMPLETED', 'FAILED'].includes(j.status));
    completed.sort((a, b) => new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime());
    const toRemove = completed.slice(0, completed.length - MAX_COMPLETED_HISTORY);
    for (const j of toRemove) {
      jobs.delete(j.id);
    }
  }
}

export function getQueueStats() {
  let queued = 0;
  let processing = 0;
  let completed = 0;
  let failed = 0;

  for (const job of jobs.values()) {
    if (job.status === 'QUEUED') queued++;
    else if (job.status === 'PROCESSING') processing++;
    else if (job.status === 'COMPLETED') completed++;
    else if (job.status === 'FAILED') failed++;
  }

  return {
    total: jobs.size,
    queued,
    processing,
    completed,
    failed,
    isWorkerRunning,
  };
}
