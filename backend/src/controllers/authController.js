const { register, login } = require('../services/authService');
const { validationResult } = require('express-validator');
const { log } = require('../utils/logger');

const registerUser = async (req, res, next) => {
  try {
    // Log incoming body keys (NOT values)
    const bodyKeys = req.body ? Object.keys(req.body) : [];
    log('info', 'Registration request received', { bodyKeys });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array();
      log('warn', 'Registration validation errors', { validationErrors });
      return res.status(400).json({ errors: validationErrors });
    }

    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      log('warn', 'Registration missing required fields', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasFullName: !!full_name 
      });
      return res.status(400).json({ error: 'Missing required fields: email, password, full_name' });
    }

    log('info', 'Calling register service', { email, hasPassword: !!password, hasFullName: !!full_name });
    const result = await register(email, password, full_name);
    log('info', 'Registration successful', { email, userId: result.user?.id });
    res.status(201).json(result);
  } catch (error) {
    // Log DB insert errors or other errors
    const isDbError = error.name && (
      error.name === 'SequelizeUniqueConstraintError' ||
      error.name === 'SequelizeDatabaseError' ||
      error.name === 'SequelizeValidationError'
    );
    
    log('error', 'Registration error occurred', {
      errorName: error.name,
      errorMessage: error.message,
      isDbError,
      ...(isDbError && { originalError: error.original?.message })
    });
    
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    // Log incoming request
    log('info', 'Login request received', { 
      email: req.body?.email,
      hasPassword: !!req.body?.password 
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array();
      log('warn', 'Login validation errors', { validationErrors });
      return res.status(400).json({ errors: validationErrors });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      log('warn', 'Login missing required fields', { 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ error: 'Missing required fields: email, password' });
    }

    log('info', 'Calling login service', { email });
    const result = await login(email, password);
    log('info', 'Login successful', { email, userId: result.user?.id });
    res.json(result);
  } catch (error) {
    // Log login errors
    log('error', 'Login error occurred', {
      errorName: error.name,
      errorMessage: error.message,
      email: req.body?.email
    });
    
    // Return appropriate status code
    const statusCode = error.message === 'Invalid credentials' ? 401 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

module.exports = { registerUser, loginUser, getCurrentUser };

