const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load and validate environment variables FIRST
// This must be imported before any other config files
require('./config/env');

const { testConnection, sequelize, isDatabaseConfigValid } = require('./config/database');
const { validation, getMissingVars } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const packageJson = require('../package.json');

// Routes
const authRoutes = require('./routes/authRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const qualificationRoutes = require('./routes/qualificationRoutes');
const judgeRoutes = require('./routes/judgeRoutes');
const fileRoutes = require('./routes/fileRoutes');
const messageRoutes = require('./routes/messageRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Socket handlers
const setupChatSocket = require('./sockets/chatSocket');
const setupWebRTC = require('./webrtc/signaling');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://dimgrey-ape-204475.hostingersite.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('[CORS] Blocked origin:', origin);
      callback(null, true); // Allow all for now, can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for request body
if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.path.includes('/register')) {
      console.log('[MIDDLEWARE] Request body received:', {
        hasBody: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        contentType: req.headers['content-type']
      });
    }
    next();
  });
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Ensure directories exist
const uploadsPath = path.join(__dirname, '../uploads');
const publicPath = path.join(__dirname, '../public');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Health check
app.get('/api/health', async (req, res) => {
  const missingVars = getMissingVars();
  const healthData = {
    serverStatus: 'running',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    database: {
      connected: false,
      error: null,
      configValid: isDatabaseConfigValid()
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      DB_HOST: process.env.DB_HOST ? (process.env.DB_HOST.length > 3 ? `${process.env.DB_HOST.substring(0, 3)}***` : '***') : 'not set',
      DB_USER: process.env.DB_USER ? (process.env.DB_USER.length > 3 ? `${process.env.DB_USER.substring(0, 3)}***` : '***') : 'not set',
      DB_NAME: process.env.DB_NAME || 'not set',
      PORT: process.env.PORT || 3000
    },
    emailService: 'hidden for security',
    jwtStatus: process.env.JWT_SECRET ? 'available' : 'missing',
    missingEnvironmentVariables: missingVars.length > 0 ? missingVars : null
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
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/qualification', qualificationRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/debug', debugRoutes);

// Serve static files (for uploads and frontend build)
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use(errorHandler);

// Initialize Socket.IO
setupChatSocket(io);
setupWebRTC(io);

// Database connection test (only if config is valid)
if (isDatabaseConfigValid()) {
  testConnection();
} else {
  console.error('⚠️  Database connection test skipped due to invalid configuration');
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 App Version: ${packageJson.version}`);
  
  if (!validation.valid) {
    console.warn('⚠️  Server started with missing environment variables. Some features may not work.');
  }
});

module.exports = app;

