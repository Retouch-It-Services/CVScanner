// navbar.js

// Initialize navbar (dropdown, logout, toast, etc.)
function initNavbar() {
  const profileDropdown = document.querySelector(".profile-dropdown");
  if (!profileDropdown) return;

  const toggle = profileDropdown.querySelector(".profile-toggle");
  const menu = profileDropdown.querySelector(".dropdown-menu");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle open/close dropdown
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove("active");
    }
  });

  // Create Toast Message System
  const messageBox = document.createElement("div");
  messageBox.style.position = "fixed";
  messageBox.style.top = "25px";
  messageBox.style.left = "50%";
  messageBox.style.transform = "translateX(-50%)";
  messageBox.style.background = "#111";
  messageBox.style.color = "#fff";
  messageBox.style.padding = "12px 24px";
  messageBox.style.borderRadius = "8px";
  messageBox.style.fontWeight = "600";
  messageBox.style.zIndex = "9999";
  messageBox.style.opacity = "0";
  messageBox.style.transition = "opacity 0.4s ease";
  document.body.appendChild(messageBox);

  function showMessage(text, color = "#6366f1") {
    messageBox.textContent = text;
    messageBox.style.background = color;
    messageBox.style.opacity = "1";
    setTimeout(() => (messageBox.style.opacity = "0"), 2000);
  }

  // Logout functionality (with toast + redirect)
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear all session data
      localStorage.removeItem("token");
      localStorage.removeItem("profile_pic");
      localStorage.removeItem("user_name");

      // Optional: clear cookies too
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Toast feedback
      showMessage("Logged out successfully!", "#22c55e");

      // Smooth redirect to main page
      setTimeout(() => {
        window.location.href = "../pages/login.html"; 
        // ⬆️ Adjust path as per your folder structure
      }, 1200);
    });
  }
}

// ✅ Fetch user profile and update navbar info
async function updateNavbarProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const pic = document.querySelector(".profile-toggle .profile-pic");
  const name = document.querySelector(".profile-toggle .profile-name");

  try {
    const res = await fetch("http://127.0.0.1:8000/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();

      // ✅ Show full name (first + last)
      if (name) {
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
        name.textContent = fullName || "User";
      }

      // ✅ Load profile picture if exists
      if (data.profile_pic && pic) {
        pic.src = `http://127.0.0.1:8000/${data.profile_pic}`;
      }
    }
  } catch (error) {
    console.error("Failed to load profile info:", error);
  }
}

// ✅ Listen for updates from profile page (live photo update)
document.addEventListener("profilePictureUpdated", (e) => {
  const pic = document.querySelector(".profile-toggle .profile-pic");
  if (pic) pic.src = e.detail;
});

// ✅ Listen for profile info update (live name update)
document.addEventListener("profileNameUpdated", (e) => {
  const name = document.querySelector(".profile-toggle .profile-name");
  if (name) name.textContent = e.detail;
});

// ✅ Wait until navbar HTML is dynamically injected before initializing
document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");

  if (navbarContainer) {
    const observer = new MutationObserver(() => {
      if (navbarContainer.querySelector(".profile-dropdown")) {
        initNavbar();
        updateNavbarProfile();
        observer.disconnect();
      }
    });

    observer.observe(navbarContainer, { childList: true, subtree: true });
  } else {
    // Navbar already in DOM
    initNavbar();
    updateNavbarProfile();
  }
});
