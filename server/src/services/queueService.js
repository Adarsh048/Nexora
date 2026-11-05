import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

let redisConnection = null;
let isRedisAvailable = false;
let emailSyncQueue = null;
let emailWorker = null;

// In-memory fallback queue for when Redis is unavailable
const inMemoryTasks = [];
let inMemoryWorkerActive = false;
const registeredProcessors = new Map();

export async function initQueues() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const probe = new IORedis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: () => null // don't reconnect continuously if absent
    });

    probe.on('error', (err) => {
      // Quietly ignore connection error when Redis server isn't running
    });

    await probe.connect();
    await probe.ping();
    isRedisAvailable = true;
    redisConnection = probe;
    console.log('[Queue] Redis connected successfully. BullMQ active.');

    emailSyncQueue = new Queue('email-sync-queue', { connection: redisConnection });

    emailWorker = new Worker('email-sync-queue', async (job) => {
      const processor = registeredProcessors.get(job.name);
      if (processor) {
        return await processor(job.data);
      }
    }, { connection: redisConnection });

    emailWorker.on('failed', (job, err) => {
      console.error(`[BullMQ] Job ${job?.id} failed:`, err.message);
    });

  } catch (err) {
    isRedisAvailable = false;
    console.log('[Queue] Redis not detected on ' + redisUrl + '. Using high-performance in-memory background worker engine.');
    startInMemoryWorker();
  }
}

function startInMemoryWorker() {
  if (inMemoryWorkerActive) return;
  inMemoryWorkerActive = true;

  setInterval(async () => {
    if (inMemoryTasks.length > 0) {
      const task = inMemoryTasks.shift();
      try {
        const processor = registeredProcessors.get(task.name);
        if (processor) {
          await processor(task.data);
        }
      } catch (err) {
        console.error(`[InMemoryWorker] Task failed:`, err.message);
      }
    }
  }, 1000);
}

export function registerJobProcessor(jobName, processorFn) {
  registeredProcessors.set(jobName, processorFn);
}

export async function addJob(jobName, data, options = {}) {
  if (isRedisAvailable && emailSyncQueue) {
    return await emailSyncQueue.add(jobName, data, options);
  } else {
    // In-memory queuing
    inMemoryTasks.push({ name: jobName, data, createdAt: new Date() });
    return { id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, name: jobName };
  }
}

export function getQueueStatus() {
  return {
    engine: isRedisAvailable ? 'BullMQ (Redis)' : 'In-Memory Async Engine',
    redisAvailable: isRedisAvailable,
    pendingInMemoryTasks: inMemoryTasks.length
  };
}
