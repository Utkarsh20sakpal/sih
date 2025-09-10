// In-memory data store for demo purposes when MongoDB is not available
const mockData = {
  users: [
    {
      _id: '1',
      name: 'Demo User',
      email: 'user@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      userType: 'user',
      isActive: true,
      monthlyPoints: 150,
      monthlyAccuracy: 85.5,
      totalWasteAmount: 25.3,
      segregationEfficiency: 87.2,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    {
      _id: '2',
      name: 'Demo Supervisor',
      email: 'supervisor@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      userType: 'supervisor',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    {
      _id: '3',
      name: 'Demo Collector',
      email: 'collector@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      userType: 'collector',
      isActive: true,
      assignedBins: [
        { binId: 'BIN001', fillLevel: 75, status: 'active' },
        { binId: 'BIN002', fillLevel: 90, status: 'active' }
      ],
      createdAt: new Date(),
      lastLogin: new Date()
    }
  ],
  wasteRecords: [
    {
      _id: '1',
      userId: '1',
      binId: 'BIN001',
      wasteType: 'organic',
      amount: 2.5,
      unit: 'kg',
      accuracy: 92.5,
      points: 25,
      timestamp: new Date(),
      collectionStatus: 'collected'
    },
    {
      _id: '2',
      userId: '1',
      binId: 'BIN002',
      wasteType: 'plastic',
      amount: 1.8,
      unit: 'kg',
      accuracy: 88.0,
      points: 18,
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      collectionStatus: 'pending'
    }
  ],
  bins: [
    {
      binId: 'BIN001',
      wasteType: 'organic',
      location: { latitude: 28.6139, longitude: 77.2090, address: 'Delhi, India' },
      currentFillLevel: 75,
      status: 'active',
      sensorData: { lastUpdated: new Date() }
    },
    {
      binId: 'BIN002',
      wasteType: 'plastic',
      location: { latitude: 28.6140, longitude: 77.2091, address: 'Delhi, India' },
      currentFillLevel: 90,
      status: 'active',
      sensorData: { lastUpdated: new Date() }
    }
  ],
  feedback: [
    {
      _id: '1',
      userId: '1',
      category: 'website',
      subject: 'Great app!',
      message: 'The waste segregation system is working perfectly.',
      rating: 5,
      status: 'resolved',
      createdAt: new Date()
    }
  ]
};

// Helper functions for in-memory operations
const findById = (collection, id) => collection.find(item => item._id === id);
const findByEmail = (collection, email) => collection.find(item => item.email === email);
const addItem = (collection, item) => {
  const newItem = { ...item, _id: Date.now().toString() };
  collection.push(newItem);
  return newItem;
};

module.exports = {
  mockData,
  findById,
  findByEmail,
  addItem
};
