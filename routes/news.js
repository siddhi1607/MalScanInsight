const newsGrid = document.getElementById("newsGrid");
const searchInput = document.getElementById("searchInput");

// Load default news
loadNews("cyber security");

// Search on Enter
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loadNews(searchInput.value);
  }
});

// Risk badge logic
function riskLevel(text) {
  text = text.toLowerCase();
  if (text.includes("breach") || text.includes("leak")) return "high";
  if (text.includes("phishing") || text.includes("malware")) return "medium";
  return "low";
}

// MAIN FUNCTION
async function loadNews(query = "cyber security") {
  try {
    newsGrid.innerHTML = "<p>Loading...</p>";

    const res = await fetch(`/api/news?q=${query}`);
    const data = await res.json();

    newsGrid.innerHTML = "";

    data.articles.forEach(article => {
      const risk = riskLevel(article.title);

      newsGrid.innerHTML += `
        <div class="news-card">
          <span class="badge ${risk}">
            ${risk.toUpperCase()} RISK
          </span>
          <h3>${article.title}</h3>
          <p>${article.description || ""}</p>
          <small>${article.pubDate}</small><br><br>
          <a href="${article.link}" target="_blank">Read more →</a>
        </div>
      `;
    });

  } catch (err) {
    newsGrid.innerHTML = "<p>Failed to load news 😢</p>";
    console.error(err);
  }
}