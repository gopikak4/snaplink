const express = require("express");
const router = express.Router();
const { createShortUrl, getUserUrls, deleteUrl, updateUrl } = require("../controllers/urlController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes protected
router.use(authMiddleware);

router.post("/", createShortUrl);
router.get("/", getUserUrls);
router.delete("/:id", deleteUrl);
router.put("/:id", updateUrl);

module.exports = router;