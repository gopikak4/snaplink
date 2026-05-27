const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const Click = require("../models/Click");

// @GET /:shortCode — Redirect to original URL
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Skip API routes
    if (shortCode.startsWith("api")) {
      return res.status(404).json({ message: "Not found" });
    }

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>🔗 Link Not Found</h2>
            <p>This short URL does not exist or has been deleted.</p>
            <a href="${process.env.FRONTEND_URL}">Go to Homepage</a>
          </body>
        </html>
      `);
    }

    // Check if link has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>⏰ Link Expired</h2>
            <p>This short URL has expired.</p>
            <a href="${process.env.FRONTEND_URL}">Go to Homepage</a>
          </body>
        </html>
      `);
    }

    // Record click analytics
    await Click.create({
      url: url._id,
      shortCode,
      clickedAt: new Date(),
      userAgent: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
      referer: req.headers["referer"] || "Direct",
    });

    // Increment total clicks
    await Url.findByIdAndUpdate(url._id, { $inc: { totalClicks: 1 } });

    // Redirect to original URL
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).send("Server error.");
  }
});

module.exports = router;