const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Bin = require('../models/Bin');
const WasteRecord = require('../models/WasteRecord');
const Feedback = require('../models/Feedback');
const Warning = require('../models/Warning');

const router = express.Router();

// @desc    Get supervisor dashboard
// @route   GET /api/supervisor/dashboard
// @access  Private (Supervisor)
router.get('/dashboard', protect, authorize('supervisor'), async (req, res) => {
  try {
    let collectors, bins, recentRecords;
    try {
      // Get all collectors
      collectors = await User.find({ 
        userType: 'collector',
        isActive: true 
      }).select('name email assignedBins lastLogin');
      // Get all bins
      bins = await Bin.find({ status: 'active' });
      // Get recent waste records
      recentRecords = await WasteRecord.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'name userType');
    } catch (dbError) {
      const { mockData } = require('../data/mockData');
      collectors = mockData.users.filter(u => u.userType === 'collector');
      bins = mockData.bins;
      recentRecords = mockData.wasteRecords
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    }

    // Calculate statistics
    const totalBins = bins.length;
    const fullBins = bins.filter(bin => bin.currentFillLevel >= 90).length;
    const offlineBins = bins.filter(bin => bin.status === 'offline').length;
    const totalCollectors = collectors.length;
    const activeCollectors = collectors.filter(collector => 
      new Date() - new Date(collector.lastLogin) < 24 * 60 * 60 * 1000
    ).length;

    // Get collection efficiency
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCollections = await WasteRecord.find({
      collectionDate: { $gte: today },
      collectionStatus: 'collected'
    });

    const collectionEfficiency = bins.length > 0 
      ? (todayCollections.length / bins.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalBins,
          fullBins,
          offlineBins,
          totalCollectors,
          activeCollectors,
          collectionEfficiency: Math.round(collectionEfficiency * 100) / 100
        },
        collectors,
        bins: bins.map(bin => ({
          binId: bin.binId,
          wasteType: bin.wasteType,
          fillLevel: bin.currentFillLevel,
          status: bin.status,
          location: bin.location,
          lastUpdated: bin.sensorData.lastUpdated,
          assignedCollector: bin.assignedCollector
        })),
        recentRecords
      }
    });
  } catch (error) {
    console.error('Get supervisor dashboard error:', error);
    // Last resort mock
    try {
      const { mockData } = require('../data/mockData');
      const collectors = mockData.users.filter(u => u.userType === 'collector');
      const bins = mockData.bins;
      const recentRecords = mockData.wasteRecords
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      const totalBins = bins.length;
      const fullBins = bins.filter(bin => bin.currentFillLevel >= 90).length;
      const offlineBins = bins.filter(bin => bin.status === 'offline').length;
      const totalCollectors = collectors.length;
      const activeCollectors = collectors.length;
      const collectionEfficiency = totalBins > 0 ? (fullBins / totalBins) * 100 : 0;
      return res.json({
        success: true,
        data: {
          overview: { totalBins, fullBins, offlineBins, totalCollectors, activeCollectors, collectionEfficiency },
          collectors,
          bins,
          recentRecords
        }
      });
    } catch (fallbackError) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// @desc    Get all collectors
// @route   GET /api/supervisor/collectors
// @access  Private (Supervisor)
router.get('/collectors', protect, authorize('supervisor'), async (req, res) => {
  try {
    const collectors = await User.find({ 
      userType: 'collector',
      isActive: true 
    }).select('name email assignedBins lastLogin createdAt');

    res.json({
      success: true,
      data: collectors
    });
  } catch (error) {
    console.error('Get collectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Assign bins to collector
// @route   PUT /api/supervisor/assign-bins
// @access  Private (Supervisor)
router.put('/assign-bins', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { collectorId, binIds } = req.body;

    const collector = await User.findById(collectorId);
    if (!collector || collector.userType !== 'collector') {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // Update collector's assigned bins
    collector.assignedBins = binIds.map(binId => ({
      binId,
      location: { latitude: 0, longitude: 0, address: '' }, // Will be updated from bin data
      fillLevel: 0,
      lastUpdated: new Date()
    }));

    await collector.save();

    // Update bins with assigned collector
    await Bin.updateMany(
      { binId: { $in: binIds } },
      { assignedCollector: collectorId }
    );

    res.json({
      success: true,
      message: 'Bins assigned successfully'
    });
  } catch (error) {
    console.error('Assign bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Send instruction to collector
// @route   POST /api/supervisor/send-instruction
// @access  Private (Supervisor)
router.post('/send-instruction', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { collectorId, instruction, priority = 'medium' } = req.body;

    const collector = await User.findById(collectorId);
    if (!collector || collector.userType !== 'collector') {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // In a real application, this would send a push notification or email
    // For now, we'll just log it
    console.log(`Instruction sent to ${collector.name}: ${instruction}`);

    res.json({
      success: true,
      message: 'Instruction sent successfully'
    });
  } catch (error) {
    console.error('Send instruction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Issue memo/warning
// @route   POST /api/supervisor/issue-memo
// @access  Private (Supervisor)
router.post('/issue-memo', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { collectorId, memoType, description, severity = 'medium' } = req.body;

    const collector = await User.findById(collectorId);
    if (!collector || collector.userType !== 'collector') {
      return res.status(404).json({
        success: false,
        message: 'Collector not found'
      });
    }

    // In a real application, this would create a memo record and notify the collector
    console.log(`Memo issued to ${collector.name}: ${memoType} - ${description}`);

    res.json({
      success: true,
      message: 'Memo issued successfully'
    });
  } catch (error) {
    console.error('Issue memo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a warning for a collector
// @route   POST /api/supervisor/warnings
// @access  Private (Supervisor)
router.post('/warnings', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { collectorId, importance = 'medium', title = '', message } = req.body;

    if (!collectorId || !message) {
      return res.status(400).json({ success: false, message: 'collectorId and message are required' });
    }

    const collector = await User.findById(collectorId);
    if (!collector || collector.userType !== 'collector') {
      return res.status(404).json({ success: false, message: 'Collector not found' });
    }

    const warning = await Warning.create({
      collectorId,
      supervisorId: req.user.id,
      importance,
      title,
      message
    });

    res.status(201).json({ success: true, data: warning, message: 'Warning issued successfully' });
  } catch (error) {
    console.error('Create warning error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    List warnings (optionally filter by collector)
// @route   GET /api/supervisor/warnings
// @access  Private (Supervisor)
router.get('/warnings', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { collectorId, status, importance } = req.query;
    const filter = {};
    if (collectorId) filter.collectorId = collectorId;
    if (status) filter.status = status;
    if (importance) filter.importance = importance;

    const warnings = await Warning.find(filter)
      .sort({ createdAt: -1 })
      .populate('collectorId', 'name email')
      .populate('supervisorId', 'name email');

    res.json({ success: true, data: warnings });
  } catch (error) {
    console.error('List warnings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get bin status
// @route   GET /api/supervisor/bins
// @access  Private (Supervisor)
router.get('/bins', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { status, wasteType, fillLevel } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (wasteType) filter.wasteType = wasteType;
    if (fillLevel) {
      const level = parseInt(fillLevel);
      if (level === 1) filter.currentFillLevel = { $lt: 25 };
      else if (level === 2) filter.currentFillLevel = { $gte: 25, $lt: 50 };
      else if (level === 3) filter.currentFillLevel = { $gte: 50, $lt: 75 };
      else if (level === 4) filter.currentFillLevel = { $gte: 75, $lt: 90 };
      else if (level === 5) filter.currentFillLevel = { $gte: 90 };
    }

    const bins = await Bin.find(filter)
      .populate('assignedCollector', 'name email')
      .sort({ currentFillLevel: -1 });

    res.json({
      success: true,
      data: bins
    });
  } catch (error) {
    console.error('Get bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update bin status
// @route   PUT /api/supervisor/bins/:binId/status
// @access  Private (Supervisor)
router.put('/bins/:binId/status', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { binId } = req.params;
    const { status, description } = req.body;

    const bin = await Bin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    bin.status = status;
    
    if (description) {
      bin.maintenanceHistory.push({
        date: new Date(),
        type: 'status_change',
        description,
        performedBy: req.user.name
      });
    }

    await bin.save();

    res.json({
      success: true,
      message: 'Bin status updated successfully'
    });
  } catch (error) {
    console.error('Update bin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all feedback
// @route   GET /api/supervisor/feedback
// @access  Private (Supervisor)
router.get('/feedback', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email userType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Respond to feedback
// @route   PUT /api/supervisor/feedback/:feedbackId/respond
// @access  Private (Supervisor)
router.put('/feedback/:feedbackId/respond', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message, status } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Append new reply; keep legacy single response updated with latest
    feedback.responses = feedback.responses || [];
    const newReply = {
      message,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };
    feedback.responses.push(newReply);
    feedback.response = newReply; // update legacy field for backward compatibility

    // Optionally update status if provided
    if (status) {
      feedback.status = status;
    }

    await feedback.save();

    res.json({
      success: true,
      message: 'Reply recorded successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Generate collection report
// @route   GET /api/supervisor/reports/collection
// @access  Private (Supervisor)
router.get('/reports/collection', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { startDate, endDate, collectorId } = req.query;
    
    const filter = { collectionStatus: 'collected' };
    if (startDate) filter.collectionDate = { $gte: new Date(startDate) };
    if (endDate) {
      filter.collectionDate = { 
        ...filter.collectionDate,
        $lte: new Date(endDate)
      };
    }
    if (collectorId) filter.collectedBy = collectorId;

    const collections = await WasteRecord.find(filter)
      .populate('collectedBy', 'name')
      .populate('userId', 'name')
      .sort({ collectionDate: -1 });

    // Calculate statistics
    const totalCollections = collections.length;
    const totalWaste = collections.reduce((sum, record) => sum + record.amount, 0);
    const avgAccuracy = collections.length > 0 
      ? collections.reduce((sum, record) => sum + record.accuracy, 0) / collections.length 
      : 0;

    // Group by waste type
    const wasteTypeStats = collections.reduce((acc, record) => {
      if (!acc[record.wasteType]) {
        acc[record.wasteType] = { count: 0, amount: 0 };
      }
      acc[record.wasteType].count++;
      acc[record.wasteType].amount += record.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalCollections,
          totalWaste,
          avgAccuracy: Math.round(avgAccuracy * 100) / 100
        },
        wasteTypeStats,
        collections
      }
    });
  } catch (error) {
    console.error('Generate collection report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
