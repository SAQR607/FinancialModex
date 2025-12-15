const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    // Validate JWT_SECRET exists before attempting verification
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH MIDDLEWARE] CRITICAL: JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not configured' });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        console.warn('[AUTH MIDDLEWARE] User not found for userId:', decoded.userId);
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Distinguish between different JWT errors
      if (jwtError.name === 'JsonWebTokenError') {
        console.warn('[AUTH MIDDLEWARE] Invalid JWT token');
        return res.status(401).json({ error: 'Invalid token' });
      } else if (jwtError.name === 'TokenExpiredError') {
        console.warn('[AUTH MIDDLEWARE] JWT token expired');
        return res.status(401).json({ error: 'Token expired' });
      } else {
        console.error('[AUTH MIDDLEWARE] JWT verification error:', jwtError.message);
        return res.status(401).json({ error: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Unexpected error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireQualified = (req, res, next) => {
  if (!req.user.is_qualified || !req.user.is_approved) {
    return res.status(403).json({ error: 'User must be qualified and approved' });
  }
  next();
};

module.exports = { authenticate, authorize, requireQualified };

