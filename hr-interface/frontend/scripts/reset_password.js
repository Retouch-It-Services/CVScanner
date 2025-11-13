document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetForm");
  const email = localStorage.getItem("resetEmail");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  // === Toast Setup ===
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
    setTimeout(() => (messageBox.style.opacity = "0"), 2200);
  }

  // === Eye toggle logic ===
  setupEyeToggle("toggleNewPassword", newPassword);
  setupEyeToggle("toggleConfirmPassword", confirmPassword);

  function setupEyeToggle(toggleId, inputField) {
    const toggle = document.getElementById(toggleId);
    const eyeOpen = toggle.querySelector(".eye-open");
    const eyeSlash = toggle.querySelector(".eye-slash");

    inputField.type = "password";
    eyeOpen.classList.remove("hidden");
    eyeSlash.classList.add("hidden");

    toggle.addEventListener("click", () => {
      const isPassword = inputField.type === "password";
      inputField.type = isPassword ? "text" : "password";
      eyeOpen.classList.toggle("hidden", !isPassword);
      eyeSlash.classList.toggle("hidden", isPassword);
    });
  }

  // === Submit new password ===
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!email) {
      showMessage("No email found. Please restart the reset process.", "#ef4444");
      setTimeout(() => (window.location.href = "forgot_password.html"), 1500);
      return;
    }

    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();

    if (newPass.length < 8) {
      showMessage("Password must be at least 8 characters.", "#ef4444");
      return;
    }

    if (newPass !== confirmPass) {
      showMessage("Passwords do not match!", "#ef4444");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: newPass })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Password updated successfully!", "#22c55e");
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        showMessage(data.detail || "Error resetting password.", "#ef4444");
      }
    } catch (error) {
      console.error(error);
      showMessage("Server error. Please try again.", "#ef4444");
    }
  });
});
