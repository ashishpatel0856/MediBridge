const { app } = require('./app');
const { config } = require('./config/env');
const { logger } = require('./infrastructure/logger');
const { db } = require('./infrastructure/database/connection');

async function bootstrap() {
  const isDbConnected = await db.ping();

  if (!isDbConnected) {
    logger.warn('PostgreSQL database is currently unreachable. Ensure DATABASE_URL is configured and PostgreSQL is running.');
  } else {
    logger.info('Successfully established connection to PostgreSQL database');
  }

  const server = app.listen(config.port, () => {
    logger.info(`Amrutam Telemedicine Backend running at http://localhost:${config.port}${config.apiPrefix}`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed, stopping database connections');
      try {
        await db.close();
        process.exit(0);
      } catch (err) {
        logger.error({ error: err.message }, 'Error during graceful database shutdown');
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Shutdown timeout reached. Force exiting.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ error: err.message }, 'Bootstrap failure');
  process.exit(1);
});
