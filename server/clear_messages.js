// Script to delete all messages without a valid sender (corrupt messages)
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  try {
    // Delete messages where sender is null/missing
    const result = await db.collection("messages").deleteMany({ sender: null });
    console.log(`Deleted ${result.deletedCount} messages with no sender.`);
    
    // Also show remaining messages count
    const remaining = await db.collection("messages").countDocuments();
    console.log(`Remaining messages in DB: ${remaining}`);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
}).catch(console.error);
