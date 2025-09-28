const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelbin');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('⚠️  MongoDB not available. Using in-memory data for demo purposes.');
    console.log('📝 To install MongoDB: https://docs.mongodb.com/manual/installation/');
    // Don't exit, let the app run with in-memory data
  }
};

module.exports = connectDB;
