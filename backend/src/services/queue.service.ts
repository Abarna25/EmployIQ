import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { emailService } from './email.service';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

// --- Queues ---
export const emailQueue = new Queue('emailQueue', { connection });
export const auditQueue = new Queue('auditQueue', { connection });

// --- Workers ---

// 1. Email Worker (Sends Async Emails)
const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, subject, body } = job.data;
    logger.info(`Processing email job ${job.id} for ${to}`);
    await emailService.sendMail(to, subject, body);
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} has failed with ${err.message}`);
});

// 2. Audit Log Worker (Writes logs to DB asynchronously)
const auditWorker = new Worker(
  'auditQueue',
  async (job) => {
    const { userId, action, entity, details } = job.data;
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        details,
      },
    });
  },
  { connection }
);

// --- Expose Push Functions ---

export class QueueService {
  /**
   * Pushes an email job to the queue.
   */
  static async enqueueEmail(to: string, subject: string, body: string) {
    await emailQueue.add('sendEmail', { to, subject, body });
  }

  /**
   * Pushes an audit log to the queue.
   */
  static async enqueueAudit(userId: string | null, action: string, entity: string, level: 'info' | 'warn' | 'error' = 'info', details?: string) {
    await auditQueue.add('writeAudit', { userId, action, entity, level, details });
  }
}
