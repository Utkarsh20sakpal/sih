const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google OAuth
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values but unique non-null values
  },
  avatar: {
    type: String,
    default: ''
  },
  userType: {
    type: String,
    enum: ['user', 'supervisor', 'collector'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // User-specific fields
  monthlyPoints: {
    type: Number,
    default: 0
  },
  monthlyAccuracy: {
    type: Number,
    default: 0
  },
  totalWasteAmount: {
    type: Number,
    default: 0
  },
  segregationEfficiency: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  },
  
  // Supervisor-specific fields
  assignedCollectors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Collector-specific fields
  assignedBins: [{
    binId: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    fillLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  currentRoute: [{
    binId: String,
    order: Number,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }],
  
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Reset monthly stats
userSchema.methods.resetMonthlyStats = function() {
  this.monthlyPoints = 0;
  this.monthlyAccuracy = 0;
  this.lastResetDate = new Date();
  return this.save();
};

// Update waste segregation stats
userSchema.methods.updateWasteStats = function(accuracy, wasteAmount) {
  this.monthlyAccuracy = ((this.monthlyAccuracy * this.totalWasteAmount) + (accuracy * wasteAmount)) / (this.totalWasteAmount + wasteAmount);
  this.totalWasteAmount += wasteAmount;
  this.segregationEfficiency = this.monthlyAccuracy;
  this.monthlyPoints += Math.round(accuracy * wasteAmount * 0.1); // Points based on accuracy and amount
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
