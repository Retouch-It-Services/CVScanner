document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const eyeOpen = togglePassword.querySelector(".eye-open");
  const eyeSlash = togglePassword.querySelector(".eye-slash");

  // Initialize password field hidden
  passwordInput.type = "password";
  eyeOpen.classList.remove("hidden");
  eyeSlash.classList.add("hidden");

  // Toggle show/hide password
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeOpen.classList.toggle("hidden", !isPassword);
    eyeSlash.classList.toggle("hidden", isPassword);
  });

  // Create toast notification box
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
  messageBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  messageBox.style.opacity = "0";
  messageBox.style.transition = "opacity 0.4s ease";
  document.body.appendChild(messageBox);

  function showMessage(text, color = "#6366f1") {
    messageBox.textContent = text;
    messageBox.style.background = color;
    messageBox.style.opacity = "1";
    setTimeout(() => (messageBox.style.opacity = "0"), 2200);
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showMessage("Please enter both email and password.", "#ef4444");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.clear();
        localStorage.setItem("token", data.access_token);
        showMessage("Login successful! Redirecting...", "#22c55e");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        showMessage(data.detail || "Invalid email or password.", "#ef4444");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("Server error. Please try again.", "#ef4444");
    }
  });
});
