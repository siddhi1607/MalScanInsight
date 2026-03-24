const express = require("express");
const router = express.Router();
const axios = require("axios");

let history = [];

// Check if website is reachable
async function isReachable(url) {
    try {
        await axios.get(url, { timeout: 3000 });
        return true;
    } catch {
        return false;
    }
}

async function analyzeURL(url) {
    let score = 0;
    let indicators = [];

    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;

        // HTTPS
        if (!url.startsWith("https")) {
            score += 30;
            indicators.push("❌ Not using HTTPS");
        } else {
            indicators.push("✔ HTTPS Enabled");
        }

        // URL length
        if (url.length > 75) {
            score += 10;
            indicators.push("⚠ Long URL detected");
        } else {
            indicators.push("✔ URL length normal");
        }

        // @ symbol
        if (url.includes("@")) {
            score += 20;
            indicators.push("❌ Contains @ symbol");
        }

        // IP address
        if (hostname.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
            score += 25;
            indicators.push("❌ IP address used");
        } else {
            indicators.push("✔ Domain name used");
        }

        // Suspicious keywords
        let keywords = ["login", "verify", "bank", "secure", "update", "free", "offer"];
        keywords.forEach(word => {
            if (url.toLowerCase().includes(word)) {
                score += 10;
                indicators.push(`⚠ Suspicious keyword: ${word}`);
            }
        });

        // 🔥 Fake famous domains (typosquatting)
        const fakePatterns = [
            { real: "amazon.com", fake: "ama0n" },
            { real: "google.com", fake: "g00gle" },
            { real: "facebook.com", fake: "faceb00k" },
            { real: "paypal.com", fake: "paypa1" },
            { real: "instagram.com", fake: "instagrarn" }
        ];

        fakePatterns.forEach(site => {
            if (hostname.includes(site.fake)) {
                score += 40;
                indicators.push(`🚨 Fake version of ${site.real} detected`);
            }
        });

        // 🔢 Too many numbers
        let numberCount = (hostname.match(/[0-9]/g) || []).length;
        if (numberCount > 3) {
            score += 15;
            indicators.push("⚠ Too many numbers in domain");
        }

        // 🌐 Suspicious TLD
        const suspiciousTLDs = [".xyz", ".tk", ".ml", ".ga", ".cf"];
        suspiciousTLDs.forEach(tld => {
            if (hostname.endsWith(tld)) {
                score += 20;
                indicators.push(`⚠ Suspicious domain extension: ${tld}`);
            }
        });

        // ➖ Too many hyphens
        if ((hostname.match(/-/g) || []).length > 2) {
            score += 10;
            indicators.push("⚠ Too many hyphens in domain");
        }

        // 🌍 Reachability check
        const reachable = await isReachable(url);
        if (!reachable) {
            score += 20;
            indicators.push("⚠ Website not reachable / may be fake");
        } else {
            indicators.push("✔ Website reachable");
        }

    } catch {
        return { error: "Invalid URL format (use https://example.com)" };
    }

    // Risk calculation
    let risk = "Safe 🟢";
    if (score > 70) risk = "Dangerous 🔴";
    else if (score > 30) risk = "Suspicious 🟡";

    let result = {
        url,
        score,
        risk,
        indicators,
        time: new Date().toLocaleString()
    };

    history.unshift(result);
    return result;
}

// Routes
router.post("/", async (req, res) => {
    const { url } = req.body;
    const result = await analyzeURL(url);
    res.json(result);
});

router.get("/history", (req, res) => {
    res.json(history);
});

module.exports = router;