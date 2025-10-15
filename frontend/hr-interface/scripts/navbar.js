document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.getElementById("menuToggle");

  // Theme sync (optional)
  const updateNavbarTheme = () => {
    if (body.getAttribute("data-theme") === "dark") {
      navbar.classList.add("dark");
    } else {
      navbar.classList.remove("dark");
    }
  };
  updateNavbarTheme();
  const observer = new MutationObserver(updateNavbarTheme);
  observer.observe(body, { attributes: true, attributeFilter: ["data-theme"] });

  // Sidebar toggle handled in sidebar.js
});
// Profile dropdown toggle
document.addEventListener("click", (e) => {
  const dropdown = document.querySelector(".profile-dropdown");
  if (!dropdown) return;

  if (dropdown.contains(e.target)) {
    dropdown.classList.toggle("active");
  } else {
    dropdown.classList.remove("active");
  }
});
