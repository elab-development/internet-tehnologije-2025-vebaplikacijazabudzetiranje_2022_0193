import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerConfig } from './config';

/**
 * Generate OpenAPI specification
 */
export function generateSwaggerSpec() {
  return swaggerJsdoc(swaggerConfig);
}

/**
 * Get Swagger spec as JSON
 */
export function getSwaggerSpec() {
  const spec = generateSwaggerSpec();
  return JSON.stringify(spec, null, 2);
}
