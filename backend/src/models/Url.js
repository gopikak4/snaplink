const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    customAlias: {
      type: String,
      default: null,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null, // null means never expires
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", urlSchema);