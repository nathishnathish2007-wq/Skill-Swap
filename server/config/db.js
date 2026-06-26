const mongoose = require('mongoose');

let mongoReady = false;

async function connectDB() {
  if (process.env.DATA_MODE === 'memory') {
    console.log('Data mode: in-memory demo store');
    mongoReady = false;
    return false;
  }

  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production.');
    }
    console.log('No MONGODB_URI set. Falling back to in-memory demo store.');
    mongoReady = false;
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    mongoReady = true;
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    mongoReady = false;
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('MongoDB connection failed. Falling back to in-memory demo store.');
    console.warn(error.message);
    return false;
  }
}

function isMongoReady() {
  return mongoReady;
}

module.exports = { connectDB, isMongoReady };
