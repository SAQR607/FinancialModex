const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { sequelize } = require('../config/database');
const { getLogs } = require('../utils/logger');

// Debug route for registration status (no authentication required)
router.get('/registration-status', async (req, res) => {
  try {
    const debugInfo = {
      adminUserExists: false,
      userCount: 0,
      validationRunning: true, // express-validator is always running
      emailUniquenessConstraint: false,
      lastLogEvents: []
    };

    // Check if admin user exists
    try {
      const adminUser = await User.findOne({ where: { role: 'ADMIN' } });
      debugInfo.adminUserExists = !!adminUser;
    } catch (error) {
      debugInfo.adminUserExists = 'error';
      debugInfo.adminError = error.message;
    }

    // Count users
    try {
      debugInfo.userCount = await User.count();
    } catch (error) {
      debugInfo.userCount = 'error';
      debugInfo.userCountError = error.message;
    }

    // Check if email uniqueness constraint exists
    try {
      const [results] = await sequelize.query(`
        SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%email%'
      `);
      debugInfo.emailUniquenessConstraint = results.length > 0;
      if (results.length > 0) {
        debugInfo.emailConstraintName = results[0].CONSTRAINT_NAME;
      }
    } catch (error) {
      debugInfo.emailUniquenessConstraint = 'error';
      debugInfo.constraintError = error.message;
    }

    // Get last 20 log events
    try {
      debugInfo.lastLogEvents = getLogs(20);
    } catch (error) {
      debugInfo.lastLogEvents = [];
      debugInfo.logError = error.message;
    }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to gather debug information',
      message: error.message
    });
  }
});

module.exports = router;

