 require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dns = require("dns").promises;
const urlScannerRoute = require("./routes/urlScanner");
const newsRoute = require("./routes/news");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/news", newsRoute);

/* ---------------- URL SCANNER (NO CHANGE) ---------------- */
app.use("/urlScanner", urlScannerRoute);
/* ---------------- MAIL SCANNER ---------------- */
 async function hasDKIM(domain) {
  const selectors = ["default", "selector1", "selector2", "google", "mail"];

  for (const selector of selectors) {
    try {
      const result = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
      if (result) return true;
    } catch {}
  }
  return false;
}

app.post("/scan-mail", async (req, res) => {

  const { email } = req.body;

  console.log("📧 MAIL SCAN REQUEST:", email);

  if (!email || !email.includes("@")) {
    return res.json({ error: "Invalid email format" });
  }

  const domain = email.split("@")[1].toLowerCase();
  const indicators = [];
  let riskScore = 0;

  /* -------- Disposable Email Detection -------- */
  const disposableDomains = [
    "tempmail",
    "mailinator",
    "10minutemail",
    "guerrillamail"
  ];

  if (disposableDomains.some(d => domain.includes(d))) {
    indicators.push("Disposable or temporary email service detected");
    riskScore += 4;
  }

  /* -------- Numeric / Impersonation Check -------- */
  if (/[0-9]/.test(domain)) {
    indicators.push("Numbers found in domain (possible impersonation)");
    riskScore += 2;
  }

  /* -------- Free vs Custom Provider -------- */
  const freeProviders = ["gmail.com", "yahoo.com", "outlook.com"];
  if (freeProviders.includes(domain)) {
    indicators.push("Common free email provider");
  } else {
    indicators.push("Custom or lesser-known email domain");
    riskScore += 1;
  }

  /* -------- MX RECORD CHECK -------- */
  try {
  const mx = await dns.resolveMx(domain);

  if (mx && mx.length > 0) {
    indicators.push("MX record found (email server exists)");
  } else {
    indicators.push("No MX record found");
    riskScore += 4;
  }
} catch (err) {
  indicators.push("MX lookup failed (network/DNS issue)");
}

  /* -------- SPF CHECK -------- */
  try {
  const txt = await dns.resolveTxt(domain);
  const hasSPF = txt.flat().some(t => t.startsWith("v=spf1"));

  if (hasSPF) {
    indicators.push("SPF record present");
  } else {
    indicators.push("SPF record missing");
    riskScore += 2;
  }
} catch {
  indicators.push("SPF lookup failed");
}

  const dkimExists = await hasDKIM(domain);

if (!dkimExists) {
  indicators.push(
    "No DKIM record found (email authenticity cannot be cryptographically verified)"
  );
  riskScore += 2;
}


  /* -------- VIRUSTOTAL DOMAIN CHECK -------- */
  try {
    const vt = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY
        }
      }
    );

    const stats = vt.data.data.attributes.last_analysis_stats;

    if (stats.malicious > 0) {
      indicators.push("Domain flagged malicious by VirusTotal");
      riskScore += 5;
    }

    if (stats.suspicious > 0) {
      indicators.push("Domain flagged suspicious by VirusTotal");
      riskScore += 3;
    }
  } catch {
    indicators.push("VirusTotal data unavailable or domain unknown");
  }

  /* -------- RISK LEVEL -------- */
  let riskLevel = "Safe 🟢";
  if (riskScore >= 7) riskLevel = "Dangerous 🔴";
  else if (riskScore >= 3) riskLevel = "Suspicious 🟡";

  res.json({
    scannedEmail: email,
    domain,
    indicators,
    riskScore,
    riskLevel,
    explanation:
      "Email analyzed using DNS (MX/SPF), VirusTotal reputation, and impersonation heuristics.",
    recommendation:
      riskLevel.includes("Dangerous")
        ? "Do NOT interact with this email. High phishing risk."
        : riskLevel.includes("Suspicious")
        ? "Proceed carefully and verify sender authenticity."
        : "No strong threat indicators detected."
  });
});

app.get("/", (req, res) => {
  res.send("✅ MalScanInsight running successfully");
}); 

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MalScanInsight running at http://localhost:${PORT}`);
});