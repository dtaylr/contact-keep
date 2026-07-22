const mongoose = require('mongoose');
const { requireConfig } = require('./env');

const connectDB = async () => {
  try {
    const db = requireConfig('mongoURI');

    await mongoose.connect(db);

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
