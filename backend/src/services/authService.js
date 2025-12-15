const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sequelize } = require('../config/database');

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('[AUTH SERVICE] CRITICAL: JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is required but not configured');
  }
  
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
    console.log('[AUTH SERVICE] JWT token generated successfully for userId:', userId);
    return token;
  } catch (error) {
    console.error('[AUTH SERVICE] Error generating JWT token:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

const register = async (email, password, fullName) => {
  console.log('\n[REGISTER] ========================================');
  console.log('[REGISTER] Starting registration process');
  console.log('[REGISTER] Email:', email);
  console.log('[REGISTER] Full Name:', fullName);
  console.log('[REGISTER] Password length:', password?.length || 0);
  
  // Validate database connection
  if (!sequelize) {
    console.error('[REGISTER] CRITICAL: Database connection is not available');
    throw new Error('Database connection is not configured. Please check your environment variables.');
  }
  
  try {
    // Step 1: Check for existing user
    console.log('[REGISTER] Step 1: Checking for existing user with email:', email);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('[REGISTER] FAILED: User already exists with email:', email);
      throw new Error('Email already registered');
    }
    console.log('[REGISTER] Step 1: No existing user found, proceeding...');

    // Step 2: Validate input
    console.log('[REGISTER] Step 2: Validating input data');
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!fullName || !fullName.trim()) {
      throw new Error('Full name is required');
    }
    console.log('[REGISTER] Step 2: Input validation passed');

    // Step 3: Create user (password will be hashed by beforeCreate hook)
    console.log('[REGISTER] Step 3: Creating new user in database...');
    console.log('[REGISTER] SQL Query: INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)');
    console.log('[REGISTER] Parameters: email=' + email + ', full_name=' + fullName + ', role=TEAM_MEMBER, password=[will be hashed]');
    
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: password, // Will be hashed by beforeCreate hook
      full_name: fullName.trim(),
      role: 'TEAM_MEMBER'
    });
    
    console.log('[REGISTER] Step 3: User created successfully');
    console.log('[REGISTER] User ID:', user.id);
    console.log('[REGISTER] User email:', user.email);
    console.log('[REGISTER] User role:', user.role);

    // Step 4: Generate JWT token
    console.log('[REGISTER] Step 4: Generating JWT token...');
    const token = generateToken(user.id);
    console.log('[REGISTER] Step 4: JWT token generated successfully');

    // Step 5: Prepare response
    const userJson = user.toJSON();
    console.log('[REGISTER] Step 5: Preparing response (password excluded)');
    console.log('[REGISTER] SUCCESS: Registration completed for user ID:', user.id);
    console.log('[REGISTER] ========================================\n');
    
    return { user: userJson, token };
  } catch (error) {
    console.error('[REGISTER] ERROR: Registration failed');
    console.error('[REGISTER] Error name:', error.name);
    console.error('[REGISTER] Error message:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('[REGISTER] Database constraint violation: Email already exists');
      throw new Error('Email already registered');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('[REGISTER] Database error:', error.original?.message || error.message);
      console.error('[REGISTER] SQL State:', error.original?.sqlState);
      throw new Error('Database error occurred during registration');
    } else if (error.name === 'SequelizeValidationError') {
      console.error('[REGISTER] Validation error:', error.errors?.map(e => e.message).join(', '));
      throw new Error('Validation failed: ' + error.errors?.map(e => e.message).join(', '));
    } else if (error.message) {
      throw error; // Re-throw with original message
    } else {
      console.error('[REGISTER] Unknown error:', error);
      throw new Error('Registration failed due to an unexpected error');
    }
  }
};

const login = async (email, password) => {
  console.log('\n[LOGIN] ========================================');
  console.log('[LOGIN] Starting login process');
  console.log('[LOGIN] Email:', email);
  console.log('[LOGIN] Password provided: YES');
  
  // Validate database connection
  if (!sequelize) {
    console.error('[LOGIN] CRITICAL: Database connection is not available');
    throw new Error('Database connection is not configured. Please check your environment variables.');
  }
  
  try {
    // Step 1: Validate input
    console.log('[LOGIN] Step 1: Validating input data');
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    console.log('[LOGIN] Step 1: Input validation passed');

    // Step 2: Find user by email
    console.log('[LOGIN] Step 2: Searching for user in database...');
    console.log('[LOGIN] SQL Query: SELECT * FROM users WHERE email = ?');
    console.log('[LOGIN] Parameters: email=' + email);
    
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    
    if (!user) {
      console.log('[LOGIN] FAILED: User not found with email:', email);
      throw new Error('Invalid credentials');
    }
    console.log('[LOGIN] Step 2: User found with ID:', user.id);

    // Step 3: Verify password
    console.log('[LOGIN] Step 3: Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('[LOGIN] FAILED: Password verification failed for user ID:', user.id);
      throw new Error('Invalid credentials');
    }
    console.log('[LOGIN] Step 3: Password verified successfully');

    // Step 4: Generate JWT token
    console.log('[LOGIN] Step 4: Generating JWT token...');
    const token = generateToken(user.id);
    console.log('[LOGIN] Step 4: JWT token generated successfully');

    // Step 5: Prepare response
    const userJson = user.toJSON();
    console.log('[LOGIN] Step 5: Preparing response (password excluded)');
    console.log('[LOGIN] SUCCESS: Login completed for user ID:', user.id);
    console.log('[LOGIN] ========================================\n');
    
    return { user: userJson, token };
  } catch (error) {
    console.error('[LOGIN] ERROR: Login failed');
    console.error('[LOGIN] Error name:', error.name);
    console.error('[LOGIN] Error message:', error.message);
    
    if (error.name === 'SequelizeDatabaseError') {
      console.error('[LOGIN] Database error:', error.original?.message || error.message);
      throw new Error('Database error occurred during login');
    } else if (error.message) {
      throw error; // Re-throw with original message
    } else {
      console.error('[LOGIN] Unknown error:', error);
      throw new Error('Login failed due to an unexpected error');
    }
  }
};

module.exports = { register, login, generateToken };

