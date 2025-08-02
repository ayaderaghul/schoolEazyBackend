// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "test") {
      // Skip real DB connection in tests
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    throw new Error("Database connection failed");
  }
};

module.exports = connectDB;
