import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { emailService } from './email.service';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

let connection: IORedis | null = null;
let emailQueue: Queue | null = null;
let auditQueue: Queue | null = null;

if (process.env.REDIS_URL) {
  connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

  connection.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
  });

  // --- Queues ---
  emailQueue = new Queue('emailQueue', { connection });
  auditQueue = new Queue('auditQueue', { connection });

  // --- Workers ---
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

  emailWorker.on('error', (err) => {
    logger.error(`Email worker error: ${err.message}`);
  });

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

  auditWorker.on('error', (err) => {
    logger.error(`Audit worker error: ${err.message}`);
  });
} else {
  logger.warn('REDIS_URL is not set. BullMQ Queues and Workers are DISABLED.');
}

export { emailQueue, auditQueue };

// --- Expose Push Functions ---

export class QueueService {
  /**
   * Pushes an email job to the queue.
   */
  static async enqueueEmail(to: string, subject: string, body: string) {
    if (emailQueue) {
      await emailQueue.add('sendEmail', { to, subject, body });
    } else {
      logger.warn(`Redis disabled. Skipping email to ${to}`);
    }
  }

  /**
   * Pushes an audit log to the queue.
   */
  static async enqueueAudit(userId: string | null, action: string, entity: string, level: 'info' | 'warn' | 'error' = 'info', details?: string) {
    if (auditQueue) {
      await auditQueue.add('writeAudit', { userId, action, entity, level, details });
    } else {
      logger.warn(`Redis disabled. Skipping audit log: ${action}`);
    }
  }
}
