const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q || "cyber security";

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const xml = response.data;

    xml2js.parseString(xml, (err, result) => {
      if (err) {
        return res.json({ articles: [] });
      }

      const items = result.rss.channel[0].item;

      const articles = items.slice(0, 10).map(item => ({
        title: item.title[0],
        link: item.link[0],
        pubDate: item.pubDate[0]
      }));

      res.json({ articles });
    });

  } catch (error) {
    console.log("News error:", error.message);
    res.json({ articles: [] });
  }
});

module.exports = router;