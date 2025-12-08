const mongoose = require('mongoose')
const config = require('./env')

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };
    await mongoose.connect(config.MONGODB_URI, options)
    console.log(`MongoDB connected successfully, ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.log(`MongoDB connection error: ${err}`)
    })
    mongoose.connection.on('disconnected', () => {
      console.warn(`MongoDB disconnected.Attempting to reconnect...`)
    })
    mongoose.connection.on('reconnected', () => {
      console.log(`MongoDB reconnected`)
    })
  } catch (error) {
    console.log(`Error connecting to MongoDB, ${error}`)
    process.exit(1)
  }
}

module.exports = connectDB
