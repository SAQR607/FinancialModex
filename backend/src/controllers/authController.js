const { register, login } = require('../services/authService');
const { validationResult } = require('express-validator');

const registerUser = async (req, res, next) => {
  try {
    console.log('[REGISTER] Incoming request:', {
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'origin': req.headers.origin
      }
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[REGISTER] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name } = req.body;
    console.log('[REGISTER] Extracted fields:', { email, full_name, passwordLength: password?.length });

    if (!email || !password || !full_name) {
      console.log('[REGISTER] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: email, password, full_name' });
    }

    console.log('[REGISTER] Calling register service...');
    const result = await register(email, password, full_name);
    console.log('[REGISTER] Registration successful for:', email);
    res.status(201).json(result);
  } catch (error) {
    console.error('[REGISTER] Error occurred:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

module.exports = { registerUser, loginUser, getCurrentUser };

