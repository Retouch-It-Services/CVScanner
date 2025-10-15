// Save Settings Handler
function saveSettings() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const darkMode = document.getElementById("darkMode").checked;

  const notifications = {
    scanAlerts: document
      .querySelectorAll(".card")[2]
      .querySelectorAll("input")[0].checked,
    tips: document.querySelectorAll(".card")[2].querySelectorAll("input")[1]
      .checked,
    updates: document.querySelectorAll(".card")[2].querySelectorAll("input")[2]
      .checked,
  };

  const scannerOptions = {
    showATS: document.querySelectorAll(".card")[3].querySelectorAll("input")[0]
      .checked,
    keywordSuggestions: document
      .querySelectorAll(".card")[3]
      .querySelectorAll("input")[1].checked,
    autoFormat: document
      .querySelectorAll(".card")[3]
      .querySelectorAll("input")[2].checked,
  };

  // Simulate saving settings (e.g., to localStorage or backend)
  console.log("Saving settings...");
  console.log({ name, email, role, darkMode, notifications, scannerOptions });

  // Show success message
  const successMsg = document.getElementById("successMsg");
  successMsg.style.display = "block";
  successMsg.style.opacity = "1";

  setTimeout(() => {
    successMsg.style.opacity = "0";
  }, 3000);
}

// Optional: Apply dark mode toggle immediately
document.addEventListener("DOMContentLoaded", () => {
  const darkToggle = document.getElementById("darkMode");
  darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkToggle.checked);
  });

  // Hide success message initially
  document.getElementById("successMsg").style.display = "none";
});
