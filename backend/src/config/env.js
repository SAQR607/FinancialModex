const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Environment Variable Loader with Path Detection
 * Handles Hostinger and other production environments where .env path may vary
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

// Try to load .env from multiple possible locations
let envPath = null;
const possiblePaths = [
  path.resolve(__dirname, '../../.env'),        // Backend root (most common)
  path.resolve(__dirname, '../../../.env'),    // Project root (fallback)
  path.resolve(process.cwd(), '.env'),         // Current working directory
  path.join(process.cwd(), 'backend', '.env') // Backend subdirectory
];

// Find the first existing .env file
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    envPath = possiblePath;
    break;
  }
}

// Load .env if found
if (envPath) {
  require('dotenv').config({ path: envPath });
  console.log(`✅ Loaded .env from: ${envPath}`);
} else {
  // Try default dotenv behavior (current directory)
  const result = require('dotenv').config();
  if (result.error) {
    console.warn('⚠️  No .env file found. Using system environment variables only.');
    console.warn('   Searched paths:', possiblePaths.join(', '));
  } else if (result.parsed) {
    console.log('✅ Loaded .env from default location (current directory)');
  }
}

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
 * Log missing variables
 */
if (!validation.valid) {
  console.error('❌ Missing required environment variables:');
  validation.missing.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n⚠️  Application may not function correctly without these variables.');
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
  envPath,
  REQUIRED_VARS,
  OPTIONAL_VARS,
  validation,
  isDatabaseConfigValid,
  getMissingVars,
  getEnv,
  validateEnv
};

