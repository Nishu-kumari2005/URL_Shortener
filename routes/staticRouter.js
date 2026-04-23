const express = require('express');
const URL = require('../models/url');
const { restrictToLoggedinUserOnly } = require('../middlewares/auth');
const router = express.Router();

router.get("/urls", restrictToLoggedinUserOnly, async(req, res) => {
    try {
        const allurls = await URL.find({}).sort({ createdAt: -1 });
        return res.json({ urls: allurls });
    } catch(err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/me", restrictToLoggedinUserOnly, (req, res) => {
    return res.json({ user: req.user });
});

module.exports = router;