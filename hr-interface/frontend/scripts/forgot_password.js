document.addEventListener("DOMContentLoaded", () => {
  const forgotForm = document.getElementById("forgotForm");
  const emailInput = document.getElementById("email");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpInput = document.getElementById("otp");

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

  // === Step 1: Send OTP ===
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      showMessage("Please enter your email address.", "#ef4444");
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ OTP sent to your email.", "#22c55e");
        localStorage.setItem("resetEmail", email);

        // Show OTP input section
        otpSection.classList.remove("hidden");

        sendOtpBtn.textContent = "Resend OTP";
      } else {
        showMessage(data.detail || "Error sending OTP.", "#ef4444");
        sendOtpBtn.textContent = "Send OTP";
      }
    } catch (error) {
      showMessage("Server error. Please try again.", "#ef4444");
    } finally {
      sendOtpBtn.disabled = false;
    }
  });

  // === Step 2: Verify OTP ===
  verifyOtpBtn.addEventListener("click", async () => {
    const email = localStorage.getItem("resetEmail");
    const otp = otpInput.value.trim();

    if (!otp) {
      showMessage("Please enter the OTP.", "#ef4444");
      return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/verify-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ OTP verified successfully!", "#22c55e");
        setTimeout(() => {
          window.location.href = "reset_password.html";
        }, 1500);
      } else {
        showMessage(data.detail || "Invalid OTP.", "#ef4444");
        verifyOtpBtn.textContent = "Verify OTP";
      }
    } catch (error) {
      showMessage("Server error. Please try again.", "#ef4444");
      verifyOtpBtn.textContent = "Verify OTP";
    } finally {
      verifyOtpBtn.disabled = false;
    }
  });
});
