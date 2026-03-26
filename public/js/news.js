const API_KEY = "76f38af16164c5019a95038ff4132324";
const newsGrid = document.getElementById("newsGrid");
const searchInput = document.getElementById("searchInput");

loadNews("cyber security");

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") loadNews(searchInput.value);
});

function riskLevel(text) {
  text = text.toLowerCase();
  if (text.includes("breach") || text.includes("leak")) return "high";
  if (text.includes("phishing") || text.includes("malware")) return "medium";
  return "low";
}

async function loadNews() {
    const res = await fetch("/api/news");
    const data = await res.text(); // because RSS = XML

    document.getElementById("news").innerText = data;
}

loadNews();

  newsGrid.innerHTML = "";

  data.articles.forEach(article => {
    const risk = riskLevel(article.title + article.description);

    newsGrid.innerHTML += `
      <div class="news-card">
        <span class="badge ${risk}">
          ${risk.toUpperCase()} RISK
        </span>
        <h3>${article.title}</h3>
        <p>${article.description || ""}</p>
        <small>Source: ${article.source.name}</small><br><br>
        <a href="${article.url}" target="_blank">Read full article →</a>
      </div>
    `;
  });

