// ============================================================================
// CRITICAL: Load environment variables FIRST before ANY other imports
// ============================================================================
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Try to load .env from multiple possible locations (Hostinger compatibility)
let envPath = null;
const possiblePaths = [
  path.resolve(__dirname, '../.env'),           // backend/.env (most common)
  path.resolve(__dirname, '../../.env'),         // Project root (fallback)
  path.resolve(process.cwd(), '.env'),          // Current working directory
  path.join(process.cwd(), 'backend', '.env')   // Backend subdirectory
];

// Find and load .env file
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    envPath = possiblePath;
    const result = require('dotenv').config({ path: possiblePath, override: true });
    if (result.error) {
      console.error(`❌ Error loading .env from ${possiblePath}:`, result.error.message);
    } else {
      console.log(`✅ Loaded .env from: ${possiblePath}`);
      break;
    }
  }
}

// If no .env file found, try default location
if (!envPath) {
  const result = require('dotenv').config({ override: true });
  if (result.error && result.error.code !== 'ENOENT') {
    console.warn('⚠️  Error loading .env:', result.error.message);
  } else if (result.parsed) {
    console.log('✅ Loaded .env from default location (current directory)');
  } else {
    console.warn('⚠️  No .env file found. Searched paths:', possiblePaths.join(', '));
    console.warn('   Using system environment variables only.');
  }
}

// Log environment variable status for debugging
console.log('[ENV DEBUG] Environment variables status:');
console.log(`  DB_HOST: ${process.env.DB_HOST ? 'SET (' + process.env.DB_HOST.substring(0, 3) + '***)' : 'MISSING'}`);
console.log(`  DB_USER: ${process.env.DB_USER ? 'SET (' + process.env.DB_USER.substring(0, 3) + '***)' : 'MISSING'}`);
console.log(`  DB_NAME: ${process.env.DB_NAME ? 'SET (' + process.env.DB_NAME + ')' : 'MISSING'}`);
console.log(`  DB_PASSWORD: ${(process.env.DB_PASSWORD || process.env.DB_PASS) ? 'SET' : 'MISSING'}`);
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);

// Now load and validate environment variables
require('./config/env');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { testConnection, isDatabaseConfigValid } = require('./config/database');
const { validation } = require('./config/env');
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
const healthRoutes = require('./routes/healthRoutes');

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
app.use('/api', healthRoutes);

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

