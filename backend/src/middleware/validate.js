import { ZodError } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Creates a validation middleware for request data
 * @param {Object} schemas - Object with body, query, params schemas
 * @returns {Function} Express middleware
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new AppError(400, 'Validation failed', details));
      }
      next(error);
    }
  };
}

/**
 * Validates only the request body
 * @param {import('zod').ZodSchema} schema
 */
export function validateBody(schema) {
  return validate({ body: schema });
}

/**
 * Validates only query parameters
 * @param {import('zod').ZodSchema} schema
 */
export function validateQuery(schema) {
  return validate({ query: schema });
}

/**
 * Validates only route parameters
 * @param {import('zod').ZodSchema} schema
 */
export function validateParams(schema) {
  return validate({ params: schema });
}

export default validate;
