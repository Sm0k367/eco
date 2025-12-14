require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const referralRoutes = require('./routes/referralRoutes');
const donationRoutes = require('./routes/donationRoutes');

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/donations', donationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🚀 Digital Asset Exchange Platform - Backend Server      ║
║   ✅ Server running on port ${PORT}                          ║
║   📍 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   🔗 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}                ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
