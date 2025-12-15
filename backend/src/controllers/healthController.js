const { sequelize } = require('../config/database');

const getHealth = async (req, res) => {
  const healthData = {
    serverStatus: 'running',
    database: {
      connected: false,
      error: null
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PORT: process.env.PORT || 3000,
      envCheck: {
        DB_HOST: process.env.DB_HOST || 'missing',
        DB_USER: process.env.DB_USER || 'missing',
        DB_NAME: process.env.DB_NAME || 'missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing'
      },
      envReceived: {
        DB_HOST: !!(process.env.DB_HOST && process.env.DB_HOST.trim() !== ''),
        DB_USER: !!(process.env.DB_USER && process.env.DB_USER.trim() !== ''),
        DB_PORT: !!(process.env.DB_PORT && process.env.DB_PORT.trim() !== ''),
        DB_NAME: !!(process.env.DB_NAME && process.env.DB_NAME.trim() !== ''),
        DB_PASSWORD: !!((process.env.DB_PASSWORD || process.env.DB_PASS) && (process.env.DB_PASSWORD || process.env.DB_PASS).trim() !== ''),
        JWT_SECRET: !!(process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== '')
      }
    }
  };

  // Test database connection only if sequelize instance exists
  if (sequelize) {
    try {
      await sequelize.authenticate();
      healthData.database.connected = true;
    } catch (error) {
      healthData.database.connected = false;
      healthData.database.error = error.message;
    }
  } else {
    healthData.database.connected = false;
    healthData.database.error = 'Database configuration invalid or missing';
  }

  res.json(healthData);
};

module.exports = {
  getHealth
};

