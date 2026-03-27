const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q || "cyber security";

    const url = `https://news.google.com/rss/search?q=${query}`;

    const response = await axios.get(url);

    res.set("Content-Type", "text/xml");
    res.send(response.data);

  } catch (err) {
    res.status(500).send("Error fetching RSS news");
  }
});

module.exports = router;