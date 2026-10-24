import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB } from '../db.js';
import { enqueueTask, getJobStatus, getQueueStats, TASK_TYPES } from '../taskQueue.js';
import { getSystemHealth, captureException, getRecentErrors } from '../observability.js';

test('Comprehensive Task Queue & Observability Tests', async (t) => {
  if (process.env.DATABASE_URL) {
    try {
      await connectDB(process.env.DATABASE_URL);
    } catch {
      // Allow testing without live DB
    }
  }

  await t.test('Angle 1: Enqueues and executes background task with progress tracking', async () => {
    let executionDone = false;

    const { jobId, status } = enqueueTask(
      TASK_TYPES.PDF_IMPORT,
      { filename: 'test_menu.pdf' },
      'tenant_test_queue',
      async (payload, updateProgress) => {
        updateProgress(25);
        await new Promise(r => setTimeout(r, 50));
        updateProgress(75);
        await new Promise(r => setTimeout(r, 50));
        executionDone = true;
        return { extractedDishes: 45, confidence: 0.98 };
      }
    );

    assert.ok(jobId.startsWith('job_'));
    assert.equal(status, 'QUEUED');

    // Wait for job completion
    let attempts = 0;
    let job = null;
    while (attempts < 20) {
      await new Promise(r => setTimeout(r, 50));
      job = getJobStatus(jobId);
      if (job && job.status === 'COMPLETED') break;
      attempts++;
    }

    assert.ok(executionDone, 'Handler must have executed');
    assert.equal(job.status, 'COMPLETED');
    assert.equal(job.progress, 100);
    assert.equal(job.result.extractedDishes, 45);
    assert.ok(job.completedAt);
  });

  await t.test('Angle 2: Gracefully handles worker task failures without halting queue', async () => {
    const { jobId } = enqueueTask(
      TASK_TYPES.AI_SYNTHESIS,
      { prompt: 'bad input' },
      'tenant_test_queue',
      async () => {
        throw new Error('AI Model token limit exceeded');
      }
    );

    let attempts = 0;
    let job = null;
    while (attempts < 20) {
      await new Promise(r => setTimeout(r, 50));
      job = getJobStatus(jobId);
      if (job && job.status === 'FAILED') break;
      attempts++;
    }

    assert.equal(job.status, 'FAILED');
    assert.equal(job.error, 'AI Model token limit exceeded');

    // Queue worker must still be operational
    const stats = getQueueStats();
    assert.ok(stats.total >= 1);
  });

  await t.test('Angle 3: Tenant Scoping blocks foreign tenant from reading job status', async () => {
    const { jobId } = enqueueTask(
      TASK_TYPES.BULK_MENU_IMPORT,
      { data: 123 },
      'tenant_secret_restaurant',
      async () => ({ ok: true })
    );

    // Reading with correct tenant succeeds
    const validCheck = getJobStatus(jobId, 'tenant_secret_restaurant');
    assert.ok(validCheck, 'Owning tenant must be able to read job status');

    // Reading with different tenant is blocked (returns null)
    const foreignCheck = getJobStatus(jobId, 'tenant_other_hacker');
    assert.equal(foreignCheck, null, 'Foreign tenant must receive null (blocked)');
  });

  await t.test('Angle 4: System Health Telemetry returns comprehensive metrics', async () => {
    const health = await getSystemHealth();

    assert.ok(['OK', 'DEGRADED'].includes(health.status));
    assert.ok(health.uptimeSeconds >= 0);
    assert.equal(health.service, 'menusqr-api');
    assert.ok(health.system.cpus >= 1);
    assert.ok(health.process.heapUsedMb > 0);
    assert.ok(health.database.status);
    assert.ok('latencyMs' in health.database);
    assert.ok('configured' in health.redis);
    assert.ok('total' in health.taskQueue);
    assert.ok('errorRate' in health.metrics);
  });

  await t.test('Angle 5: Structured Exception Capture and Bounded Error Log', async () => {
    const errId = captureException(new Error('Test mock crash event'), {
      route: '/api/app/test',
      tenantId: 'tenant_mock_123',
    });

    assert.ok(errId.startsWith('err_'));

    const recent = getRecentErrors();
    const found = recent.find(e => e.id === errId);
    assert.ok(found, 'Captured error must be present in recent error log');
    assert.equal(found.message, 'Test mock crash event');
    assert.equal(found.context.tenantId, 'tenant_mock_123');
  });
});
