 function togglePassword() {
  const input = document.getElementById("passwordInput");
  input.type = input.type === "password" ? "text" : "password";
}

function checkPassword() {
  const password = document.getElementById("passwordInput").value;
  const fill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");
  const entropyText = document.getElementById("entropyText");

  if (password.length === 0) {
    fill.style.width = "0%";
    strengthText.textContent = "";
    entropyText.textContent = "";
    return;
  }

  // Character pool size
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

  // Entropy calculation
  const entropy = Math.round(password.length * Math.log2(pool || 1));

  let strength = "Weak 🔴";
  let percent = 25;
  let color = "#ff4d4d";

  if (entropy >= 80) {
    strength = "Very Strong 🟢";
    percent = 100;
    color = "#00ffcc";
  } else if (entropy >= 60) {
    strength = "Strong 🟢";
    percent = 75;
    color = "#00ff99";
  } else if (entropy >= 40) {
    strength = "Moderate 🟡";
    percent = 50;
    color = "#ffaa00";
  }

  fill.style.width = percent + "%";
  fill.style.background = color;

  strengthText.textContent = strength;
  entropyText.textContent = `Entropy: ${entropy} bits`;
}