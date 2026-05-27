const { nanoid } = require("nanoid");
const validator = require("validator");
const Url = require("../models/Url");
const Click = require("../models/Click");

// @POST /api/urls — Create short URL
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required." });
    }
    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ message: "Please provide a valid URL including http:// or https://" });
    }

    // Handle custom alias
    let shortCode;
    if (customAlias) {
      // Validate alias format
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({ message: "Custom alias can only contain letters, numbers, hyphens, and underscores." });
      }
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ message: "This custom alias is already taken. Please try another." });
      }
      shortCode = customAlias;
    } else {
      // Generate unique short code
      shortCode = nanoid(7);
      while (await Url.findOne({ shortCode })) {
        shortCode = nanoid(7);
      }
    }

    // Validate expiry date
    let expiry = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (expiry <= new Date()) {
        return res.status(400).json({ message: "Expiry date must be in the future." });
      }
    }

    const url = await Url.create({
      user: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: expiry,
    });

    res.status(201).json({
      message: "Short URL created successfully!",
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        totalClicks: url.totalClicks,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    console.error("Create URL error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @GET /api/urls — Get all URLs for logged-in user
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });

    const result = urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      totalClicks: url.totalClicks,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      createdAt: url.createdAt,
    }));

    res.json({ urls: result });
  } catch (error) {
    console.error("Get URLs error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @DELETE /api/urls/:id — Delete a URL
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: "URL not found or you don't have permission to delete it." });
    }

    await Url.findByIdAndDelete(req.params.id);
    await Click.deleteMany({ url: req.params.id }); // Clean up clicks

    res.json({ message: "URL deleted successfully." });
  } catch (error) {
    console.error("Delete URL error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @PUT /api/urls/:id — Update destination URL
const updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required." });
    }
    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ message: "Please provide a valid URL." });
    }

    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });
    if (!url) {
      return res.status(404).json({ message: "URL not found." });
    }

    url.originalUrl = originalUrl;
    await url.save();

    res.json({ message: "URL updated successfully.", url });
  } catch (error) {
    console.error("Update URL error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { createShortUrl, getUserUrls, deleteUrl, updateUrl };