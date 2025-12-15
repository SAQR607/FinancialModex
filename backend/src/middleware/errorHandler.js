const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER] Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    original: err.original
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Email already registered' });
  }

  if (err.name === 'SequelizeDatabaseError') {
    console.error('[ERROR HANDLER] Database error:', err.original);
    return res.status(500).json({ 
      error: 'Database error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.errors?.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Invalid reference' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

