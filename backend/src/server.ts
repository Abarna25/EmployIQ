import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 EmployIQ Backend Server listening on port ${PORT}`);
  logger.info(`📚 Swagger Documentation available at http://localhost:${PORT}/api-docs`);
});
