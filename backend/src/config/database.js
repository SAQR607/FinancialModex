const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
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

// Test connection
const testConnection = async () => {
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
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      port: process.env.DB_PORT || 3306
    });
    // Don't exit in production, let the app handle it gracefully
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, testConnection };

