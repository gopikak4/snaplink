const express = require("express");
const router = express.Router();
const { getUrlAnalytics, getSummary } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/summary", getSummary);
router.get("/:shortCode", getUrlAnalytics);

module.exports = router;