const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Import database connection
const connectDB = require('./config/database');

// Import passport configuration
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const supervisorRoutes = require('./routes/supervisor');
const collectorRoutes = require('./routes/collector');
const supportRoutes = require('./routes/support');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Trust proxy (needed when behind reverse proxies/CDNs)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development, health checks, static files and CORS preflight
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') return true;
    if (req.method === 'OPTIONS') return true; // CORS preflight
    if (req.path === '/api/health' || req.path === '/api/faq') return true; // health/docs
    if (req.path.startsWith('/static/') || req.path.endsWith('.js') || req.path.endsWith('.css')) return true; // static
    return false;
  }
});
app.use('/api/', limiter);

// CORS configuration with explicit preflight handling
const allowedOrigins = (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
  .map(o => o.trim())
  .filter(Boolean);
// Ensure common local dev ports are allowed when no CLIENT_URL is provided
if (!allowedOrigins.length) {
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://localhost:3002');
  allowedOrigins.push('http://localhost:3003');
}

const corsOptions = {
  origin: (origin, callback) => {
    // In development, allow all origins to avoid local proxy/origin issues
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      return callback(null, true);
    }
    if (!origin) return callback(null, true); // allow non-browser clients
    // Explicitly allow common localhost variants
    const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
    if (localhostRegex.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Routes - must be registered before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/collector', collectorRoutes);
app.use('/api/support', supportRoutes);

// Debug routes to verify auth routes are registered
app.get('/api/auth/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working' });
});

// Debug route to test callback path
app.get('/api/auth/google/callback/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Callback route is accessible',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'not set'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// IoT data simulation endpoint (for testing)
app.post('/api/iot/simulate', (req, res) => {
  try {
    // This endpoint simulates IoT data from waste bins
    // In a real application, this would receive data from actual IoT devices
    
    const { binId, wasteType } = req.body;
    
    // Generate realistic dummy sensor data
    const sensorData = {
      weight: Math.random() * 50 + 10, // 10-60 kg
      volume: Math.random() * 30 + 5,  // 5-35 liters
      temperature: 20 + Math.random() * 15, // 20-35°C
      humidity: 40 + Math.random() * 30,    // 40-70%
      batteryLevel: 80 + Math.random() * 20, // 80-100%
      signalStrength: 70 + Math.random() * 30, // 70-100%
      lastUpdated: new Date(),
      // Real IoT integration would include:
      // - Ultrasonic sensor readings for fill level
      // - Weight sensor data with calibration
      // - Temperature/humidity sensor readings
      // - GPS coordinates from device
      // - Device health status
      // - Battery level monitoring
      // - Network connectivity status
    };
    
    // Calculate fill level based on weight and capacity
    const capacity = 50; // kg (typical bin capacity)
    const fillLevel = Math.min((sensorData.weight / capacity) * 100, 100);
    
    res.json({
      success: true,
      message: 'IoT data simulated successfully',
      data: {
        binId,
        wasteType,
        fillLevel: Math.round(fillLevel * 100) / 100,
        sensorData
      }
    });
  } catch (error) {
    console.error('IoT simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Customer care FAQ endpoint
app.get('/api/faq', (req, res) => {
  const faqData = [
    {
      id: 1,
      category: 'General',
      question: 'How does the waste segregation system work?',
      answer: 'Our IoT-enabled waste bins automatically detect and segregate different types of waste using advanced sensors and AI technology. Users simply deposit waste, and the system handles the rest.'
    },
    {
      id: 2,
      category: 'General',
      question: 'What types of waste can be segregated?',
      answer: 'Our system can segregate organic waste, plastic, paper, metal, glass, and electronic waste. Each bin is specifically designed for one waste type.'
    },
    {
      id: 3,
      category: 'User Account',
      question: 'How do I earn points?',
      answer: 'You earn points based on the accuracy of your waste segregation and the amount of waste deposited. Points are calculated monthly and reset each month.'
    },
    {
      id: 4,
      category: 'User Account',
      question: 'Can I change my user type?',
      answer: 'User types (User, Supervisor, Collector) are assigned by administrators. Contact support if you need to change your role.'
    },
    {
      id: 5,
      category: 'Technical',
      question: 'What if the bin is not working?',
      answer: 'If a bin appears offline or malfunctioning, please report it through the feedback system. Our technical team will address the issue promptly.'
    },
    {
      id: 6,
      category: 'Technical',
      question: 'How accurate is the waste detection?',
      answer: 'Our AI-powered detection system achieves 85-95% accuracy depending on the waste type. The system continuously learns and improves over time.'
    },
    {
      id: 7,
      category: 'Collection',
      question: 'How often are bins collected?',
      answer: 'Collection frequency depends on bin fill level and location. High-traffic areas are collected more frequently, typically every 1-3 days.'
    },
    {
      id: 8,
      category: 'Collection',
      question: 'Can I track my waste collection?',
      answer: 'Yes, you can view your waste segregation history and track when your waste was collected through your dashboard.'
    },
    {
      id: 9,
      category: 'Privacy',
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal data and waste segregation records.'
    },
    {
      id: 10,
      category: 'Support',
      question: 'How can I contact support?',
      answer: 'You can contact support through the feedback form in your dashboard, or email us at support@wastesegregator.com'
    }
  ];

  res.json({
    success: true,
    data: faqData
  });
});

// Root route - show API info
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, try to serve frontend if built, otherwise show API info
    const frontendPath = path.join(__dirname, '../client/build', 'index.html');
    if (require('fs').existsSync(frontendPath)) {
      return res.sendFile(frontendPath);
    }
    // If frontend not built, show API info
    res.json({
      success: true,
      message: 'PixelBin API Server is running',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        faq: '/api/faq',
        auth: '/api/auth',
        user: '/api/user',
        supervisor: '/api/supervisor',
        collector: '/api/collector',
        support: '/api/support'
      },
      documentation: 'https://github.com/Utkarsh20sakpal/sih'
    });
  } else {
    // In development, redirect to React dev server
    res.redirect('http://localhost:3000');
  }
});

// Error handling middleware (must come before 404 handler)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// Serve static files in production (if frontend is built)
// This must come AFTER all API routes but BEFORE 404 handler
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Serve React app for all non-API routes
    app.get('*', (req, res, next) => {
      // Don't serve React app for API routes - let them fall through to 404
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.resolve(buildPath, 'index.html'));
    });
  }
}

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`NODE_ENV is set to: ${process.env.NODE_ENV || 'NOT SET (defaulting to development)'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API Documentation: http://localhost:${PORT}/api/faq`);
});

module.exports = app;
