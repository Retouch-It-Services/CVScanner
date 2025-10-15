// Profile image fallback if not found
document.addEventListener("DOMContentLoaded", () => {
  const profileImg = document.querySelector(".profile-pic-navbar");
  profileImg.onerror = () => {
    profileImg.src = ""; // fallback image
  };
});

// Search bar functionality (basic keyword logging)
const searchInput = document.querySelector(".search-bar input");
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      console.log("Search triggered for:", query);
      // Future: redirect or filter dashboard content
    }
  }
});

// Optional: highlight active sidebar link dynamically
const currentPage = location.pathname.split("/").pop();
document.querySelectorAll(".sidebar a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
