const newsGrid = document.getElementById("newsGrid");
const searchInput = document.getElementById("searchInput");

loadNews("cyber security");

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") loadNews(searchInput.value);
});

async function loadNews(query = "cyber security") {
  try {
    const res = await fetch("/api/news?q=" + query);
    const data = await res.json();

    newsGrid.innerHTML = "";

    data.articles.forEach(article => {
      newsGrid.innerHTML += `
        <div class="news-card">
          <h3>${article.title}</h3>
          <p>${article.description || ""}</p>
          <a href="${article.link}" target="_blank">Read more →</a>
        </div>
      `;
    });

  } catch (err) {
    newsGrid.innerHTML = "Failed to load news 😢";
    console.error(err);
  }
}