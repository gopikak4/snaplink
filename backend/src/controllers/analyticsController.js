const Url = require("../models/Url");
const Click = require("../models/Click");

// @GET /api/analytics/:shortCode — Get analytics for a specific URL
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
      user: req.user._id,
    });

    if (!url) {
      return res.status(404).json({ message: "URL not found." });
    }

    // Get all clicks for this URL
    const clicks = await Click.find({ url: url._id }).sort({ clickedAt: -1 });

    // Last visited time
    const lastVisited = clicks.length > 0 ? clicks[0].clickedAt : null;

    // Recent 10 visits
    const recentVisits = clicks.slice(0, 10).map((click) => ({
      clickedAt: click.clickedAt,
      referer: click.referer,
      userAgent: click.userAgent,
    }));

    // Daily clicks for last 7 days (for chart)
    const dailyClicks = await getDailyClicks(url._id);

    res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      },
      analytics: {
        totalClicks: url.totalClicks,
        lastVisited,
        recentVisits,
        dailyClicks,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Helper: get clicks grouped by day for last 7 days
const getDailyClicks = async (urlId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await Click.aggregate([
    {
      $match: {
        url: urlId,
        clickedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days with 0
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const found = result.find((r) => r._id === dateStr);
    days.push({ date: dateStr, clicks: found ? found.count : 0 });
  }

  return days;
};

// @GET /api/analytics/summary — Get summary for all user URLs
const getSummary = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id });
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.totalClicks, 0);

    // Most clicked URL
    const topUrl = urls.sort((a, b) => b.totalClicks - a.totalClicks)[0];

    res.json({
      totalUrls,
      totalClicks,
      topUrl: topUrl
        ? {
            shortCode: topUrl.shortCode,
            originalUrl: topUrl.originalUrl,
            totalClicks: topUrl.totalClicks,
          }
        : null,
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getUrlAnalytics, getSummary };