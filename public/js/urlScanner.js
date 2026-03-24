async function scanURL() {
    const url = document.getElementById("urlInput").value;

    if (!url) {
        alert("Please enter a URL");
        return;
    }

    try {
        const res = await fetch("/urlScanner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await res.json();

        if (data.error) {
            document.getElementById("result").innerHTML = `
                <p style="color:red;"><b>Error:</b> ${data.error}</p>
            `;
            return;
        }

        let color = "lightgreen";
        if (data.score > 70) color = "red";
        else if (data.score > 30) color = "yellow";

        document.getElementById("result").innerHTML = `
            <h2 style="color:${color}">Risk Level: ${data.risk}</h2>
            <b>Score:</b> ${data.score}/100</p>
            <b>Scanned URL:</b> ${data.url}</p>
            <b>Scan Time:</b> ${data.time}</p>

            <h3>Indicators:</h3>
            <ul>
                ${data.indicators.map(i => `<li>${i}</li>`).join("")}
            </ul>
        `;

        loadHistory();

    } catch (err) {
        document.getElementById("result").innerHTML = `
            <p style="color:red;">Server error. Try again.</p>
        `;
    }
}

async function loadHistory() {
    const res = await fetch("/urlScanner/history");
    const history = await res.json();

    document.getElementById("history").innerHTML =
        history.map(item => `
            <li>${item.url} → ${item.risk} (${item.score})</li>
        `).join("");
}