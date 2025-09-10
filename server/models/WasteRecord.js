const mongoose = require('mongoose');

const wasteRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  binId: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'electronic'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liters', 'pieces'],
    default: 'kg'
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // IoT sensor data (dummy data for now)
  sensorData: {
    weight: Number,
    volume: Number,
    temperature: Number,
    humidity: Number,
    // Real IoT integration would include:
    // - RFID tag data
    // - Camera analysis results
    // - Weight sensor readings
    // - Volume sensor readings
    // - Temperature/humidity sensors
    // - GPS coordinates
    // - Timestamp from device
  },
  // Collection data (for collectors)
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collectionDate: Date,
  collectionStatus: {
    type: String,
    enum: ['pending', 'collected', 'missed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
wasteRecordSchema.index({ userId: 1, timestamp: -1 });
wasteRecordSchema.index({ binId: 1, timestamp: -1 });
wasteRecordSchema.index({ wasteType: 1, timestamp: -1 });

module.exports = mongoose.model('WasteRecord', wasteRecordSchema);
