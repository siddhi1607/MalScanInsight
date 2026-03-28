const newsGrid = document.getElementById("newsGrid");
const searchInput = document.getElementById("searchInput");

// 🔥 BACKUP NEWS (WILL ALWAYS WORK)
const backupNews = [
  {
    title: "Cyber attack trends increasing globally",
    link: "#",
    pubDate: "Demo Data"
  },
  {
    title: "Phishing attacks targeting banking users",
    link: "#",
    pubDate: "Demo Data"
  },
  {
    title: "New malware detected in Android devices",
    link: "#",
    pubDate: "Demo Data"
  }
];

// Load default
loadNews("cyber security");

// Search
searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loadNews(searchInput.value);
  }
});

// MAIN FUNCTION
async function loadNews(query = "cyber security") {
  try {
    newsGrid.innerHTML = "<p>Loading...</p>";

    const res = await fetch(`/api/news?q=${query}`);
    const data = await res.json();

    // If API fails or empty → use backup
    if (!data.articles || data.articles.length === 0) {
      throw new Error("No data");
    }

    displayNews(data.articles);

  } catch (err) {
    console.error("Using backup news:", err);

    // 🔥 FALLBACK (VERY IMPORTANT)
    displayNews(backupNews);
  }
}

// DISPLAY FUNCTION
function displayNews(articles) {
  newsGrid.innerHTML = "";

  articles.forEach(article => {
    newsGrid.innerHTML += `
      <div class="news-card">
        <h3>${article.title}</h3>
        <p>${article.pubDate || ""}</p>
        <a href="${article.link}" target="_blank">Read more →</a>
      </div>
    `;
  });
}