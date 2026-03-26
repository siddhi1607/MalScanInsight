const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q || "cyber security";

  try {
    const url = `https://news.google.com/rss/search?q=${query}`;

    const response = await axios.get(url);

    const result = await xml2js.parseStringPromise(response.data);

    const articles = result.rss.channel[0].item.map(item => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0]
    }));

    res.json({ articles });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;