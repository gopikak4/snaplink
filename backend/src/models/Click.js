const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    referer: {
      type: String,
      default: "Direct",
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Click", clickSchema);