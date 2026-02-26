import { Options } from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration
 */
export const swaggerConfig: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SplitBill API',
      version: '1.0.0',
      description: 'REST API documentation for SplitBill - Expense Sharing Application',
      contact: {
        name: 'SplitBill Support',
        email: 'support@splitbill.com',
        url: 'https://splitbill.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://splitbill.vercel.app',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints',
      },
      {
        name: 'Groups',
        description: 'Group management endpoints',
      },
      {
        name: 'Expenses',
        description: 'Expense tracking and management endpoints',
      },
      {
        name: 'Admin',
        description: 'Admin-only endpoints',
      },
      {
        name: 'Utility',
        description: 'Utility endpoints (health check, CSRF)',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'Session cookie from NextAuth.js',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token for state-changing operations',
        },
      },
      schemas: {
        // Will be defined in schemas.ts
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Forbidden - Insufficient permissions',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Validation failed',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Too many requests, please try again later.',
                  },
                  retryAfter: {
                    type: 'number',
                    example: 900,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/lib/swagger/schemas.ts',
  ],
};
