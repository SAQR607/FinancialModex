const { Sequelize } = require('sequelize');
const { isDatabaseConfigValid, getMissingVars, getEnv } = require('./env');

let sequelize = null;

// Log environment variables received (masked for security)
console.log('\n[DB CONFIG] Environment variables received:');
console.log(`  DB_HOST received: ${process.env.DB_HOST && process.env.DB_HOST.trim() !== '' ? 'YES' : 'NO'}`);
console.log(`  DB_USER received: ${process.env.DB_USER && process.env.DB_USER.trim() !== '' ? 'YES' : 'NO'}`);
console.log(`  DB_PORT received: ${process.env.DB_PORT && process.env.DB_PORT.trim() !== '' ? 'YES' : 'NO'}`);
console.log(`  DB_NAME received: ${process.env.DB_NAME && process.env.DB_NAME.trim() !== '' ? 'YES' : 'NO'}`);
console.log(`  DB_PASSWORD received: ${(process.env.DB_PASSWORD || process.env.DB_PASS) && (process.env.DB_PASSWORD || process.env.DB_PASS).trim() !== '' ? 'YES' : 'NO'}`);

// Validate that DB_HOST is not empty and not a localhost fallback
const dbHost = process.env.DB_HOST;
if (!dbHost || dbHost.trim() === '') {
  console.error('❌ CRITICAL: DB_HOST is missing or empty. Cannot connect to database.');
  console.error('   The backend will NOT fall back to localhost, 127.0.0.1, or ::1');
  console.error('   Please set DB_HOST in your .env file or environment variables.');
} else if (dbHost === 'localhost' || dbHost === '127.0.0.1' || dbHost === '::1') {
  console.warn(`⚠️  WARNING: DB_HOST is set to ${dbHost}. This may not work on Hostinger.`);
  console.warn('   Ensure this is intentional and matches your Hostinger database host.');
}

// Only create Sequelize instance if database configuration is valid
if (isDatabaseConfigValid()) {
  // Support both DB_PASSWORD and DB_PASS for backward compatibility
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS;
  
  // Validate all credentials are non-empty before creating Sequelize instance
  if (!dbHost || dbHost.trim() === '') {
    throw new Error('DB_HOST is required and cannot be empty. Please set DB_HOST in your .env file.');
  }
  if (!process.env.DB_USER || process.env.DB_USER.trim() === '') {
    throw new Error('DB_USER is required and cannot be empty. Please set DB_USER in your .env file.');
  }
  if (!process.env.DB_NAME || process.env.DB_NAME.trim() === '') {
    throw new Error('DB_NAME is required and cannot be empty. Please set DB_NAME in your .env file.');
  }
  if (!dbPassword || dbPassword.trim() === '') {
    throw new Error('DB_PASSWORD is required and cannot be empty. Please set DB_PASSWORD in your .env file.');
  }
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    dbPassword,
    {
      host: dbHost, // Use validated dbHost, never fallback to localhost
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('✅ Database configuration loaded successfully');
} else {
  const missing = getMissingVars().filter(v => v.startsWith('DB_'));
  console.error('❌ Database connection skipped due to invalid configuration');
  console.error('   Missing database variables:', missing.join(', '));
  console.error('   The backend will NOT attempt to connect with empty credentials.');
}

// Test connection
const testConnection = async () => {
  // Don't attempt connection if Sequelize instance wasn't created
  if (!sequelize) {
    console.error('⚠️  Cannot test database connection: configuration invalid');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Check if users table exists
    try {
      const [results] = await sequelize.query("SHOW TABLES LIKE 'users'");
      if (results.length === 0) {
        console.error('❌ Users table does not exist. Please run the schema.sql file.');
      } else {
        console.log('✅ Users table exists.');
      }
    } catch (tableError) {
      console.error('❌ Error checking users table:', tableError.message);
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Database config:', {
      host: process.env.DB_HOST || '(empty)',
      database: process.env.DB_NAME || '(empty)',
      user: process.env.DB_USER || '(empty)',
      port: process.env.DB_PORT || 3306
    });
    // Don't exit in production, let the app handle it gracefully
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, testConnection, isDatabaseConfigValid };

