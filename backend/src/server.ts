import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const PORT = env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`🚀 EmployIQ Backend Server listening on http://${HOST}:${PORT}`);
  logger.info(`📚 Swagger Documentation available at http://${HOST}:${PORT}/api-docs`);
});
