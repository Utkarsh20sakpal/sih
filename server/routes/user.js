const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const WasteRecord = require('../models/WasteRecord');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private (User)
router.get('/dashboard', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get current month's waste records
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRecords = await WasteRecord.find({
      userId: req.user.id,
      timestamp: { $gte: currentMonth }
    });

    // Calculate monthly stats
    const totalWaste = monthlyRecords.reduce((sum, record) => sum + record.amount, 0);
    const avgAccuracy = monthlyRecords.length > 0 
      ? monthlyRecords.reduce((sum, record) => sum + record.accuracy, 0) / monthlyRecords.length 
      : 0;
    const totalPoints = monthlyRecords.reduce((sum, record) => sum + record.points, 0);

    // Get recent records (last 5)
    const recentRecords = await WasteRecord.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('collectedBy', 'name');

    res.json({
      success: true,
      data: {
        monthlyStats: {
          totalWaste,
          avgAccuracy: Math.round(avgAccuracy * 100) / 100,
          totalPoints,
          recordCount: monthlyRecords.length
        },
        userStats: {
          monthlyPoints: user.monthlyPoints,
          monthlyAccuracy: user.monthlyAccuracy,
          totalWasteAmount: user.totalWasteAmount,
          segregationEfficiency: user.segregationEfficiency
        },
        recentRecords
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get waste history
// @route   GET /api/user/history
// @access  Private (User)
router.get('/history', protect, authorize('user'), async (req, res) => {
  try {
    const { page = 1, limit = 10, wasteType, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { userId: req.user.id };
    
    if (wasteType) filter.wasteType = wasteType;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const records = await WasteRecord.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('collectedBy', 'name');

    const total = await WasteRecord.countDocuments(filter);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/user/leaderboard
// @access  Private (User)
router.get('/leaderboard', protect, authorize('user'), async (req, res) => {
  try {
    const { type = 'waste' } = req.query; // 'waste' or 'efficiency'
    
    let sortField = 'totalWasteAmount';
    if (type === 'efficiency') {
      sortField = 'segregationEfficiency';
    }

    const leaderboard = await User.find({ 
      userType: 'user',
      isActive: true 
    })
    .select('name avatar totalWasteAmount segregationEfficiency monthlyPoints')
    .sort({ [sortField]: -1 })
    .limit(50);

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      avatar: user.avatar,
      totalWasteAmount: user.totalWasteAmount,
      segregationEfficiency: user.segregationEfficiency,
      monthlyPoints: user.monthlyPoints
    }));

    // Get current user's rank
    const currentUserRank = leaderboard.findIndex(user => user._id.toString() === req.user.id) + 1;

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        currentUserRank: currentUserRank || null,
        type
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Submit feedback
// @route   POST /api/user/feedback
// @access  Private (User)
router.post('/feedback', protect, authorize('user'), async (req, res) => {
  try {
    const { category, subject, message, rating } = req.body;

    const feedback = await Feedback.create({
      userId: req.user.id,
      category,
      subject,
      message,
      rating
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's feedback history
// @route   GET /api/user/feedback
// @access  Private (User)
router.get('/feedback', protect, authorize('user'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Simulate waste segregation (for testing with dummy data)
// @route   POST /api/user/segregate
// @access  Private (User)
router.post('/segregate', protect, authorize('user'), async (req, res) => {
  try {
    const { binId, wasteType, amount, unit = 'kg' } = req.body;

    // Simulate IoT sensor data (dummy data)
    const sensorData = {
      weight: parseFloat((amount + (Math.random() - 0.5) * 0.1).toFixed(2)), // Add some noise and ensure it's a valid number
      volume: parseFloat((amount * 0.8 + (Math.random() - 0.5) * 0.05).toFixed(2)),
      temperature: parseFloat((25 + (Math.random() - 0.5) * 10).toFixed(1)),
      humidity: parseFloat((50 + (Math.random() - 0.5) * 20).toFixed(1)),
      // Real IoT integration would include:
      // - RFID tag reading
      // - Camera-based waste type detection
      // - Weight sensor calibration
      // - GPS coordinates from device
      // - Device timestamp
    };

    // Simulate accuracy based on waste type (dummy logic)
    const accuracyRanges = {
      organic: [85, 95],
      plastic: [80, 90],
      paper: [90, 98],
      metal: [95, 99],
      glass: [88, 95],
      electronic: [75, 85]
    };
    
    const [min, max] = accuracyRanges[wasteType] || [80, 90];
    const accuracy = min + Math.random() * (max - min);
    
    // Calculate points based on accuracy and amount
    const points = Math.round(accuracy * amount * 0.1);

    // Create waste record
    const wasteRecord = await WasteRecord.create({
      userId: req.user.id,
      binId,
      wasteType,
      amount,
      unit,
      accuracy,
      points,
      sensorData,
      location: {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Delhi coordinates with some variation
        longitude: 77.2090 + (Math.random() - 0.5) * 0.1
      }
    });

    // Update user stats
    const user = await User.findById(req.user.id);
    await user.updateWasteStats(accuracy, amount);

    res.status(201).json({
      success: true,
      message: 'Waste segregation recorded successfully',
      data: {
        record: wasteRecord,
        accuracy,
        points
      }
    });
  } catch (error) {
    console.error('Waste segregation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reset monthly stats (for testing)
// @route   POST /api/user/reset-stats
// @access  Private (User)
router.post('/reset-stats', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await user.resetMonthlyStats();

    res.json({
      success: true,
      message: 'Monthly stats reset successfully'
    });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
