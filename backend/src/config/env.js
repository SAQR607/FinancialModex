/**
 * Environment Variable Loader and Validator
 * NOTE: dotenv.config() should be called BEFORE this module is required
 * This module only validates and provides utilities for environment variables
 */

// Define required environment variables
const REQUIRED_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

// Define optional environment variables with defaults
const OPTIONAL_VARS = {
  'NODE_ENV': 'development',
  'PORT': '3000',
  'DB_PORT': '3306', // MySQL default port
  'JWT_EXPIRES_IN': '7d',
  'EMAIL_HOST': '',
  'EMAIL_PORT': '',
  'EMAIL_USER': '',
  'EMAIL_PASSWORD': '',
  'FRONTEND_URL': '',
  'SOCKET_CORS_ORIGIN': '',
  'UPLOAD_DIR': './uploads',
  'MAX_FILE_SIZE': '10485760', // 10MB in bytes
  'DEBUG': 'false'
};

// Note: dotenv.config() is called in app.js BEFORE this module is loaded
// This module only validates and provides utilities

/**
 * Validate required environment variables
 * @returns {Object} { valid: boolean, missing: string[] }
 */
const validateEnv = () => {
  const missing = [];
  
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Get validation result
 */
const validation = validateEnv();

/**
 * Log missing variables with clear warnings
 */
if (!validation.valid) {
  console.error('\n❌ WARNING: Missing required environment variables:');
  validation.missing.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n⚠️  Application may not function correctly without these variables.');
  console.error('⚠️  The backend will NOT fall back to localhost, 127.0.0.1, or ::1.');
  console.error('⚠️  Please set all required variables in your .env file or environment variables.\n');
}

/**
 * Check if database configuration is valid
 * Supports both DB_PASSWORD and DB_PASS for backward compatibility
 * @returns {boolean}
 */
const isDatabaseConfigValid = () => {
  const dbVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const hasPassword = (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') ||
                      (process.env.DB_PASS && process.env.DB_PASS.trim() !== '');
  
  return dbVars.every(varName => {
    const value = process.env[varName];
    return value && value.trim() !== '';
  }) && hasPassword;
};

/**
 * Get all missing environment variables (including optional ones that might be needed)
 * @returns {string[]}
 */
const getMissingVars = () => {
  return validation.missing;
};

/**
 * Get environment variable value with optional default
 * @param {string} varName 
 * @param {string} defaultValue 
 * @returns {string}
 */
const getEnv = (varName, defaultValue = '') => {
  return process.env[varName] || defaultValue;
};

module.exports = {
  REQUIRED_VARS,
  OPTIONAL_VARS,
  validation,
  isDatabaseConfigValid,
  getMissingVars,
  getEnv,
  validateEnv
};

