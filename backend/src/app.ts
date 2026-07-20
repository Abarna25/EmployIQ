import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger';
import { env } from './config/env';

export const createApp = (): Express => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger Documentation
  setupSwagger(app);

  // Health check endpoints
  app.get(['/', '/health'], (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date(), service: 'employiq-backend' });
  });

  // API Routes
  app.use('/api/v1', routes);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
