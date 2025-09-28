const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Bin = require('../models/Bin');
const WasteRecord = require('../models/WasteRecord');
const Warning = require('../models/Warning');

const router = express.Router();

// @desc    Get collector dashboard
// @route   GET /api/collector/dashboard
// @access  Private (Collector)
router.get('/dashboard', protect, authorize('collector'), async (req, res) => {
  try {
    let collector;
    try {
      collector = await User.findById(req.user.id);
    } catch (dbError) {
      const { mockData, findById } = require('../data/mockData');
      collector = findById(mockData.users, req.user.id) || { assignedBins: [] };
    }
    
    // Get assigned bins with current status
    const assignedBinIds = (collector.assignedBins || []).map(bin => bin.binId);
    let bins;
    try {
      bins = await Bin.find({ binId: { $in: assignedBinIds } });
    } catch (dbError) {
      const { mockData } = require('../data/mockData');
      bins = mockData.bins.filter(b => assignedBinIds.includes(b.binId));
    }

    // Update collector's bin data with latest from database
    const updatedAssignedBins = collector.assignedBins.map(assignedBin => {
      const binData = bins.find(bin => bin.binId === assignedBin.binId);
      if (binData) {
        return {
          ...assignedBin.toObject(),
          fillLevel: binData.currentFillLevel,
          status: binData.status,
          location: binData.location,
          lastUpdated: binData.sensorData.lastUpdated
        };
      }
      return assignedBin;
    });

    // Get today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayCollections;
    try {
      todayCollections = await WasteRecord.find({
        collectedBy: req.user.id,
        collectionDate: { $gte: today },
        collectionStatus: 'collected'
      });
    } catch (dbError) {
      const { mockData } = require('../data/mockData');
      todayCollections = mockData.wasteRecords.filter(r => r.collectionStatus === 'collected');
    }

    // Get pending collections
    let pendingCollections;
    try {
      pendingCollections = await WasteRecord.find({
        collectedBy: req.user.id,
        collectionStatus: 'pending'
      }).populate('userId', 'name');
    } catch (dbError) {
      const { mockData } = require('../data/mockData');
      pendingCollections = mockData.wasteRecords.filter(r => r.collectionStatus !== 'collected');
    }

    // Calculate statistics
    const totalAssignedBins = assignedBinIds.length;
    const fullBins = bins.filter(bin => bin.currentFillLevel >= 90).length;
    const offlineBins = bins.filter(bin => bin.status === 'offline').length;
    const todayCollectionCount = todayCollections.length;
    const pendingCollectionCount = pendingCollections.length;

    res.json({
      success: true,
      data: {
        overview: {
          totalAssignedBins,
          fullBins,
          offlineBins,
          todayCollectionCount,
          pendingCollectionCount
        },
        assignedBins: updatedAssignedBins,
        todayCollections,
        pendingCollections
      }
    });
  } catch (error) {
    console.error('Get collector dashboard error:', error);
    try {
      const { mockData } = require('../data/mockData');
      const bins = mockData.bins;
      return res.json({
        success: true,
        data: {
          overview: { totalAssignedBins: bins.length, fullBins: 1, offlineBins: 0, todayCollectionCount: 0, pendingCollectionCount: 2 },
          assignedBins: bins.map(b => ({ binId: b.binId, fillLevel: b.currentFillLevel, status: b.status, location: b.location, lastUpdated: b.sensorData.lastUpdated })),
          todayCollections: [],
          pendingCollections: mockData.wasteRecords
        }
      });
    } catch (fallbackError) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// @desc    List warnings for the logged-in collector
// @route   GET /api/collector/warnings
// @access  Private (Collector)
router.get('/warnings', protect, authorize('collector'), async (req, res) => {
  try {
    const { status, importance } = req.query;
    const filter = { collectorId: req.user.id };
    if (status) filter.status = status;
    if (importance) filter.importance = importance;
    const warnings = await Warning.find(filter)
      .sort({ createdAt: -1 })
      .populate('supervisorId', 'name email');
    res.json({ success: true, data: warnings });
  } catch (error) {
    console.error('Collector list warnings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reply to a specific warning
// @route   POST /api/collector/warnings/:id/replies
// @access  Private (Collector)
router.post('/warnings/:id/replies', protect, authorize('collector'), async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const warning = await Warning.findById(id);
    if (!warning || String(warning.collectorId) !== String(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Warning not found' });
    }

    warning.replies.push({ userId: req.user.id, message });
    await warning.save();
    res.status(201).json({ success: true, data: warning, message: 'Reply added' });
  } catch (error) {
    console.error('Collector reply warning error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get assigned bins with map data
// @route   GET /api/collector/bins
// @access  Private (Collector)
router.get('/bins', protect, authorize('collector'), async (req, res) => {
  try {
    const collector = await User.findById(req.user.id);
    const assignedBinIds = collector.assignedBins.map(bin => bin.binId);
    
    const bins = await Bin.find({ binId: { $in: assignedBinIds } })
      .select('binId wasteType location currentFillLevel status sensorData lastCollected nextCollectionDate');

    // Format for map display
    const mapBins = bins.map(bin => ({
      id: bin.binId,
      wasteType: bin.wasteType,
      location: bin.location,
      fillLevel: bin.currentFillLevel,
      status: bin.status,
      lastUpdated: bin.sensorData.lastUpdated,
      lastCollected: bin.lastCollected,
      nextCollection: bin.nextCollectionDate,
      // Color coding for map
      color: bin.currentFillLevel >= 90 ? 'red' : 
             bin.currentFillLevel >= 75 ? 'orange' : 
             bin.currentFillLevel >= 50 ? 'yellow' : 'green'
    }));

    res.json({
      success: true,
      data: mapBins
    });
  } catch (error) {
    console.error('Get bins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Optimize collection route
// @route   POST /api/collector/optimize-route
// @access  Private (Collector)
router.post('/optimize-route', protect, authorize('collector'), async (req, res) => {
  try {
    const { binIds, startLocation } = req.body;
    
    // Get bin data
    const bins = await Bin.find({ binId: { $in: binIds } });
    
    // Simple route optimization algorithm (nearest neighbor)
    // In a real application, this would use more sophisticated algorithms
    // like TSP (Traveling Salesman Problem) solvers or Google Maps API
    
    const optimizedRoute = optimizeRoute(bins, startLocation);
    
    // Update collector's current route
    const collector = await User.findById(req.user.id);
    collector.currentRoute = optimizedRoute.map((bin, index) => ({
      binId: bin.binId,
      order: index + 1,
      status: 'pending'
    }));
    
    await collector.save();

    res.json({
      success: true,
      message: 'Route optimized successfully',
      data: {
        route: optimizedRoute,
        totalDistance: calculateTotalDistance(optimizedRoute),
        estimatedTime: calculateEstimatedTime(optimizedRoute)
      }
    });
  } catch (error) {
    console.error('Optimize route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Mark bin as collected
// @route   POST /api/collector/collect-bin
// @access  Private (Collector)
router.post('/collect-bin', protect, authorize('collector'), async (req, res) => {
  try {
    const { binId, wasteRecords } = req.body;

    const bin = await Bin.findOne({ binId });
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    // Mark bin as collected
    await bin.markCollected(req.user.id);

    // Update waste records with collection info
    if (wasteRecords && wasteRecords.length > 0) {
      await WasteRecord.updateMany(
        { _id: { $in: wasteRecords } },
        {
          collectedBy: req.user.id,
          collectionDate: new Date(),
          collectionStatus: 'collected'
        }
      );
    }

    // Update collector's route status
    const collector = await User.findById(req.user.id);
    const routeItem = collector.currentRoute.find(item => item.binId === binId);
    if (routeItem) {
      routeItem.status = 'completed';
    }
    await collector.save();

    res.json({
      success: true,
      message: 'Bin marked as collected successfully',
      data: {
        binId,
        collectionDate: new Date(),
        nextCollectionDate: bin.nextCollectionDate
      }
    });
  } catch (error) {
    console.error('Collect bin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get collection history
// @route   GET /api/collector/history
// @access  Private (Collector)
router.get('/history', protect, authorize('collector'), async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const filter = { collectedBy: req.user.id, collectionStatus: 'collected' };
    
    if (startDate || endDate) {
      filter.collectionDate = {};
      if (startDate) filter.collectionDate.$gte = new Date(startDate);
      if (endDate) filter.collectionDate.$lte = new Date(endDate);
    }

    const collections = await WasteRecord.find(filter)
      .populate('userId', 'name')
      .sort({ collectionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WasteRecord.countDocuments(filter);

    // Calculate statistics
    const totalWaste = collections.reduce((sum, record) => sum + record.amount, 0);
    const avgAccuracy = collections.length > 0 
      ? collections.reduce((sum, record) => sum + record.accuracy, 0) / collections.length 
      : 0;

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        statistics: {
          totalWaste,
          avgAccuracy: Math.round(avgAccuracy * 100) / 100,
          totalCollections: collections.length
        }
      }
    });
  } catch (error) {
    console.error('Get collection history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update route status
// @route   PUT /api/collector/route/:binId/status
// @access  Private (Collector)
router.put('/route/:binId/status', protect, authorize('collector'), async (req, res) => {
  try {
    const { binId } = req.params;
    const { status } = req.body;

    const collector = await User.findById(req.user.id);
    const routeItem = collector.currentRoute.find(item => item.binId === binId);
    
    if (!routeItem) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found in current route'
      });
    }

    routeItem.status = status;
    await collector.save();

    res.json({
      success: true,
      message: 'Route status updated successfully'
    });
  } catch (error) {
    console.error('Update route status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current route
// @route   GET /api/collector/route
// @access  Private (Collector)
router.get('/route', protect, authorize('collector'), async (req, res) => {
  try {
    const collector = await User.findById(req.user.id);
    
    // Get detailed bin information for current route
    const routeBins = await Bin.find({
      binId: { $in: collector.currentRoute.map(item => item.binId) }
    });

    const detailedRoute = collector.currentRoute.map(routeItem => {
      const binData = routeBins.find(bin => bin.binId === routeItem.binId);
      return {
        ...routeItem.toObject(),
        binData: binData ? {
          wasteType: binData.wasteType,
          location: binData.location,
          fillLevel: binData.currentFillLevel,
          status: binData.status
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        route: detailedRoute,
        totalBins: detailedRoute.length,
        completedBins: detailedRoute.filter(item => item.status === 'completed').length,
        pendingBins: detailedRoute.filter(item => item.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Get current route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function for route optimization (simplified nearest neighbor)
function optimizeRoute(bins, startLocation) {
  if (!bins.length) return [];
  
  const route = [];
  const unvisited = [...bins];
  let currentLocation = startLocation || { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentLocation,
      unvisited[0].location
    );
    
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation,
        unvisited[i].location
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearestBin = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearestBin);
    currentLocation = nearestBin.location;
  }
  
  return route;
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to calculate total distance of route
function calculateTotalDistance(route) {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i].location, route[i + 1].location);
  }
  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

// Helper function to calculate estimated time
function calculateEstimatedTime(route) {
  const avgSpeed = 20; // km/h (assuming city driving)
  const timePerBin = 5; // minutes per bin
  const totalDistance = calculateTotalDistance(route);
  const drivingTime = (totalDistance / avgSpeed) * 60; // minutes
  const collectionTime = route.length * timePerBin;
  return Math.round(drivingTime + collectionTime);
}

module.exports = router;
