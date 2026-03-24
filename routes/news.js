 const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q || "cyber security";

  try {
    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: query,
          lang: "en",
          max: 10,
          token: process.env.GNEWS_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("NEWS API ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;