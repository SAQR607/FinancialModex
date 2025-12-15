const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (email, password, fullName) => {
  console.log('[AUTH SERVICE] Register called with:', { email, fullName, passwordLength: password?.length });
  
  try {
    console.log('[AUTH SERVICE] Checking for existing user...');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('[AUTH SERVICE] User already exists:', email);
      throw new Error('Email already registered');
    }

    console.log('[AUTH SERVICE] Creating new user...');
    const user = await User.create({
      email,
      password,
      full_name: fullName,
      role: 'TEAM_MEMBER'
    });
    console.log('[AUTH SERVICE] User created successfully:', user.id);

    const token = generateToken(user.id);
    console.log('[AUTH SERVICE] Token generated for user:', user.id);
    return { user: user.toJSON(), token };
  } catch (error) {
    console.error('[AUTH SERVICE] Error in register:', {
      name: error.name,
      message: error.message,
      original: error.original
    });
    throw error;
  }
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);
  return { user: user.toJSON(), token };
};

module.exports = { register, login, generateToken };

