const { Sequelize } = require('sequelize');
const { isDatabaseConfigValid, getMissingVars, getEnv } = require('./env');

let sequelize = null;

// Only create Sequelize instance if database configuration is valid
if (isDatabaseConfigValid()) {
  // Support both DB_PASSWORD and DB_PASS for backward compatibility
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS;
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    dbPassword,
    {
      host: process.env.DB_HOST,
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
  console.log('✅ Database configuration loaded');
} else {
  const missing = getMissingVars().filter(v => v.startsWith('DB_'));
  console.error('❌ Database connection skipped due to invalid configuration');
  console.error('   Missing database variables:', missing.join(', '));
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

