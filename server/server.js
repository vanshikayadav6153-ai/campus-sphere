const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // Fallback to root .env if present

// ============================================================================
// 🔒 Startup Environment Validation (Fail Fast)
// ============================================================================
const requiredEnvVars = [
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'CLIENT_URL',
  'ALLOWED_DOMAIN',
];

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);
if (!mongoUri) {
  missingEnv.unshift('MONGO_URI');
}

if (missingEnv.length > 0) {
  console.error('\n❌ ==============================================================');
  console.error('❌ FATAL: Missing Required Environment Variables at Server Startup:');
  missingEnv.forEach((v) => console.error(`   - ${v}`));
  console.error('❌ Please define these in server/.env or your deployment dashboard.');
  console.error('❌ ==============================================================\n');
  process.exit(1);
}

// Normalize MONGO_URI
if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
  process.env.MONGO_URI = process.env.MONGODB_URI;
}

const connectDB = require('./config/db');
const setupPassport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// Set trust proxy for Render / Reverse Proxy deployment
app.set('trust proxy', 1);

// Connect to Database
connectDB().then(() => {
  const { migrateSignupBonuses } = require('./utils/ledgerHelper');
  migrateSignupBonuses();
});

// Initialize Passport Google OAuth Strategy
setupPassport();

// Security and Utility Middleware
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting for all API routes (200 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// CORS Configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// GET /api/health -> Production Health Check (No DB call)
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Public & Personal Engagement Stats Routes
app.use('/api/stats', require('./routes/statsRoutes'));

// Marketplace Items Routes
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/marketplace', require('./routes/itemRoutes'));

// Skills, Requests, Ledger & Safe Zones Routes
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/safezones', require('./routes/safeZoneRoutes'));
app.use('/api/safe-zones', require('./routes/safeZoneRoutes'));

// Serve compiled client frontend if present (supports unified local port 5000 and Render deployments)
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// 404 Handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// SPA Fallback for client-side routing (serves index.html for non-API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({
    success: false,
    message: `Page not found: ${req.originalUrl}. Please build the client or use client dev server on port 5173.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Listen on process.env.PORT
app.listen(PORT, () => {
  console.log(`🚀 CampusSphere Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`🔒 Domain gate configured for: @${process.env.ALLOWED_DOMAIN}`);
  console.log(`🌐 Allowed Client Origin: ${CLIENT_URL}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
