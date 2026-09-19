const mongoose = require("mongoose");
const dns = require("dns");

// Ensure reliable Atlas SRV resolution across environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Pass if DNS setting restricted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ChatDb");
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
