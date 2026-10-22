const { logger } = require('../logger');

class JobQueue {
  constructor() {
    this.queue = [];
    this.handlers = new Map();
    this.deadLetterQueue = [];
    this.isProcessing = false;
  }

  registerHandler(name, handler) {
    this.handlers.set(name, handler);
  }

  async add(name, data, options = {}) {
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      backoffMs: options.backoffMs || 500,
      createdAt: new Date(),
      status: 'QUEUED'
    };

    this.queue.push(job);
    logger.info({ jobId: job.id, jobName: job.name }, 'Job added to asynchronous processing queue');

    this.processNext();
    return job.id;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (!job) {
      this.isProcessing = false;
      return;
    }

    const handler = this.handlers.get(job.name);
    if (!handler) {
      logger.error({ jobId: job.id, jobName: job.name }, 'No registered handler for job type');
      job.status = 'FAILED';
      this.deadLetterQueue.push(job);
      this.isProcessing = false;
      this.processNext();
      return;
    }

    job.status = 'PROCESSING';
    job.attempts += 1;

    try {
      await handler(job.data);
      job.status = 'COMPLETED';
      logger.info({ jobId: job.id, jobName: job.name }, 'Job processed successfully');
    } catch (err) {
      job.lastError = err.message;
      logger.warn(
        { jobId: job.id, jobName: job.name, attempt: job.attempts, max: job.maxAttempts, error: err.message },
        'Job processing attempt failed'
      );

      if (job.attempts < job.maxAttempts) {
        const delay = job.backoffMs * Math.pow(2, job.attempts - 1);
        setTimeout(() => {
          job.status = 'QUEUED';
          this.queue.push(job);
          this.processNext();
        }, delay);
      } else {
        job.status = 'FAILED';
        this.deadLetterQueue.push(job);
        logger.error({ jobId: job.id, jobName: job.name }, 'Job exceeded max retry attempts. Moved to Dead Letter Queue (DLQ)');
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  getStats() {
    return {
      queued: this.queue.length,
      deadLetterQueue: this.deadLetterQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

const jobQueue = new JobQueue();

// Register Default System Background Jobs
jobQueue.registerHandler('send_appointment_confirmation', async (data) => {
  logger.info(data, 'Processing async appointment confirmation email');
});

jobQueue.registerHandler('send_prescription_notification', async (data) => {
  logger.info(data, 'Processing async prescription notification dispatch');
});

jobQueue.registerHandler('audit_log_archive', async (data) => {
  logger.info(data, 'Archiving audit log record to cold storage');
});

module.exports = {
  jobQueue,
  JobQueue
};
