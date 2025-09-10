const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    zone: {
      type: String,
      required: true
    }
  },
  wasteType: {
    type: String,
    enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic', 'mixed'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liters'],
    default: 'kg'
  },
  currentFillLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentWeight: {
    type: Number,
    default: 0
  },
  // IoT sensor data (dummy data for now)
  sensorData: {
    weight: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 0
    },
    temperature: {
      type: Number,
      default: 25
    },
    humidity: {
      type: Number,
      default: 50
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    // Real IoT integration would include:
    // - Ultrasonic sensors for fill level
    // - Weight sensors for load measurement
    // - Temperature/humidity sensors
    // - GPS module for location tracking
    // - WiFi/LoRa module for data transmission
    // - Battery level monitoring
    // - Device health status
  },
  // Collection management
  assignedCollector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastCollected: {
    type: Date,
    default: null
  },
  collectionFrequency: {
    type: Number,
    default: 7 // days
  },
  nextCollectionDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + this.collectionFrequency * 24 * 60 * 60 * 1000);
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'full', 'damaged', 'offline'],
    default: 'active'
  },
  // Maintenance records
  maintenanceHistory: [{
    date: Date,
    type: String,
    description: String,
    performedBy: String
  }],
  // Alerts and notifications
  alerts: [{
    type: {
      type: String,
      enum: ['full', 'maintenance', 'offline', 'damaged']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Virtual for fill percentage
binSchema.virtual('fillPercentage').get(function() {
  return (this.currentWeight / this.capacity) * 100;
});

// Method to update fill level from IoT data
binSchema.methods.updateFillLevel = function(sensorData) {
  // Real IoT integration would process actual sensor data
  // For now, we'll use dummy data with realistic patterns
  
  this.sensorData = {
    ...this.sensorData,
    ...sensorData,
    lastUpdated: new Date()
  };
  
  // Calculate fill level based on weight and capacity
  this.currentFillLevel = Math.min((this.sensorData.weight / this.capacity) * 100, 100);
  this.currentWeight = this.sensorData.weight;
  
  // Generate alerts if needed
  if (this.currentFillLevel >= 90) {
    this.alerts.push({
      type: 'full',
      message: `Bin ${this.binId} is ${Math.round(this.currentFillLevel)}% full`
    });
  }
  
  return this.save();
};

// Method to mark as collected
binSchema.methods.markCollected = function(collectorId) {
  this.currentFillLevel = 0;
  this.currentWeight = 0;
  this.lastCollected = new Date();
  this.nextCollectionDate = new Date(Date.now() + this.collectionFrequency * 24 * 60 * 60 * 1000);
  
  // Clear full alerts
  this.alerts = this.alerts.filter(alert => alert.type !== 'full' || alert.resolved);
  
  return this.save();
};

module.exports = mongoose.model('Bin', binSchema);
