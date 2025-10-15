document.getElementById("settingsForm").addEventListener("submit", e => {
  e.preventDefault();
  const theme = document.getElementById("theme").value;
  const email = document.getElementById("email").value;

  localStorage.setItem("appSettings", JSON.stringify({ theme, email }));
  alert("Settings saved successfully!");
});
