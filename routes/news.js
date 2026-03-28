const express = require("express");
const router = express.Router();
const axios = require("axios");
const xml2js = require("xml2js");

router.get("/", async (req, res) => {
  const query = req.query.q || "cyber security";

  try {
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await axios.get(url);

    const result = await xml2js.parseStringPromise(response.data);

    const items = result.rss.channel[0].item;

    const articles = items.map(item => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0]
    }));

    res.json({ articles });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;