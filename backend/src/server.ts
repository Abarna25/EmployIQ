import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

// Prevent unhandled errors (like Redis AggregateError) from crashing the server
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  console.error(reason);
});

const app = createApp();

const PORT = env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`🚀 EmployIQ Backend Server listening on http://${HOST}:${PORT}`);
  logger.info(`📚 Swagger Documentation available at http://${HOST}:${PORT}/api-docs`);
});
