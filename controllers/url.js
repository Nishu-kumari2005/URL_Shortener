const shortid = require("shortid");
const URL = require("../models/url");

async function handlegenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "url is required" });
  const shortID = shortid(8);

  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
  });

  // Enforce a maximum of 10 URLs in the database
  const latestUrls = await URL.find({}).sort({ createdAt: -1 }).limit(10);
  const latestIds = latestUrls.map(url => url._id);
  await URL.deleteMany({ _id: { $nin: latestIds } });

  return res.json({
    id: shortID,
  });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}
module.exports = {
  handlegenerateNewShortURL,
  handleGetAnalytics,
};
