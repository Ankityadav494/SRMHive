const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["Hackathon", "Startup", "Academic", "Personal"],
      default: "Hackathon",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    mode: {
      type: String,
      enum: ["Remote", "Offline", "Hybrid"],
      default: "Remote",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);