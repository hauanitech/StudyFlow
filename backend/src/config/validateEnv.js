/**
 * Environment validation script
 * Validates required environment variables before server starts
 */

import env from './env.js';

const requiredVariables = [
  { name: 'MONGODB_URI', value: env.MONGODB_URI, description: 'MongoDB connection string' },
];

const secretVariables = [
  { name: 'JWT_ACCESS_SECRET', value: env.JWT_ACCESS_SECRET, description: 'JWT access token secret' },
  { name: 'JWT_REFRESH_SECRET', value: env.JWT_REFRESH_SECRET, description: 'JWT refresh token secret' },
  { name: 'CSRF_SECRET', value: env.CSRF_SECRET, description: 'CSRF token secret' },
];

const productionRequired = [
  { name: 'CORS_ORIGIN', value: env.CORS_ORIGIN, description: 'Allowed CORS origins' },
];

export function validateEnvironment() {
  const errors = [];

  // Check required variables
  for (const variable of requiredVariables) {
    if (!variable.value) {
      errors.push(`❌ ${variable.name} is required - ${variable.description}`);
    }
  }

  // Check secret variables - required in production, warned in development
  for (const variable of secretVariables) {
    if (!variable.value) {
      if (env.isProd) {
        errors.push(`❌ ${variable.name} is required in production - ${variable.description}`);
      } else {
        console.warn(`⚠️  ${variable.name} not set - using insecure default for development only`);
      }
    }
  }

  // Check production-only required variables
  if (env.isProd) {
    for (const variable of productionRequired) {
      if (!variable.value) {
        errors.push(`❌ ${variable.name} is required in production - ${variable.description}`);
      }
    }
  }

  // Warnings for development
  if (!env.isProd) {
    if (!process.env.CORS_ORIGIN) {
      console.warn('⚠️  CORS_ORIGIN not set, using default: http://localhost:5173');
    }
  }

  // If errors found, display them and exit
  if (errors.length > 0) {
    console.error('\n🚨 Environment Validation Failed:\n');
    errors.forEach(error => console.error(error));
    console.error('\n💡 Please check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

export default validateEnvironment;
