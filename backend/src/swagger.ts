import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'EmployIQ API Documentation',
    version: '1.0.0',
    description: 'Enterprise API specification for EmployIQ - AI-Driven Adaptive Student Portfolio & Employability Intelligence Platform',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT', 'FACULTY', 'RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN'] },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User authentication login',
        tags: ['Authentication'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with JWT access token' },
        },
      },
    },
    '/students/profile': {
      get: {
        summary: 'Get current student portfolio details',
        tags: ['Student'],
        responses: {
          200: { description: 'Student profile payload' },
        },
      },
    },
    '/analytics/placement': {
      get: {
        summary: 'Get placement readiness metrics',
        tags: ['Analytics'],
        responses: {
          200: { description: 'Placement readiness statistics' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
