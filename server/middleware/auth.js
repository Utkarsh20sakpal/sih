const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { mockData, findById } = require('../data/mockData');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

      // Try to fetch user from MongoDB if the id looks like an ObjectId, otherwise fall back to mock data
      const looksLikeObjectId = typeof decoded.id === 'string' && /^[a-f\d]{24}$/i.test(decoded.id);

      if (looksLikeObjectId) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      // If not found in DB or not an ObjectId, try mock data
      if (!req.user) {
        const mockUser = findById(mockData.users, decoded.id);
        if (mockUser) {
          // Align shape with Mongoose doc selection
          const { password, ...safeUser } = mockUser;
          // Ensure both _id and id are available like a Mongoose document
          req.user = { ...safeUser, id: safeUser._id };
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (req.user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.userType} is not authorized to access this resource`
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = {
  protect,
  authorize,
  generateToken
};
