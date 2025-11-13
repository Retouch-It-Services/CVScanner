document.addEventListener("DOMContentLoaded", () => {
  const API = "http://127.0.0.1:8000";

  // UI elements
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const verifyRow = document.getElementById("verifyRow");
  const resendRow = document.getElementById("resendRow");
  const expiryRow = document.getElementById("expiryRow");
  const cooldownText = document.getElementById("cooldownText");
  const expiresText = document.getElementById("expiresText");
  const passwordRow = document.getElementById("passwordRow");
  const confirmPasswordRow = document.getElementById("confirmPasswordRow");
  const orgRow = document.getElementById("orgRow");
  const finalSubmit = document.getElementById("finalSubmit");
  const signupForm = document.getElementById("signupForm");

  // inputs
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  const emailEl = document.getElementById("email");
  const otpEl = document.getElementById("otp");
  const passwordEl = document.getElementById("password");
  const confirmEl = document.getElementById("confirmPassword");
  const orgEl = document.getElementById("organization");

  // state
  let otpExpiresAt = null;
  let cooldownUntil = null;
  let cooldownTimer = null;
  let expiryTimer = null;
  let remainingResends = null;
  let otpVerified = false;

  // ✅ Reusable message system (toast-style)
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

  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function startCountdowns(expiresInSec, cooldownSec) {
    const now = Date.now();
    otpExpiresAt = now + expiresInSec * 1000;
    cooldownUntil = now + cooldownSec * 1000;

    updateCooldown();
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(updateCooldown, 1000);

    updateExpiry();
    if (expiryTimer) clearInterval(expiryTimer);
    expiryTimer = setInterval(updateExpiry, 1000);
  }

  function updateCooldown() {
    const remain = Math.max(0, Math.floor((cooldownUntil - Date.now()) / 1000));
    if (remain > 0) {
      resendOtpBtn.disabled = true;
      cooldownText.textContent = `Resend available in ${remain}s`;
    } else {
      resendOtpBtn.disabled = false;
      cooldownText.textContent = "";
      clearInterval(cooldownTimer);
    }
  }

  function updateExpiry() {
    const remain = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
    if (remain > 0) {
      expiresText.textContent = `OTP expires in ${remain}s`;
    } else {
      expiresText.textContent = "OTP expired. Please resend.";
      clearInterval(expiryTimer);
    }
  }

  // === STEP 1: SEND OTP ===
  sendOtpBtn.addEventListener("click", async () => {
    const first_name = firstNameEl.value.trim();
    const last_name = lastNameEl.value.trim();
    const email = emailEl.value.trim();

    if (!first_name || !last_name || !email) {
      showMessage("Please fill First Name, Last Name and Email.", "#ef4444");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.detail?.includes("already registered")) {
          showMessage("Email already registered. Redirecting to login...", "#f97316");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
          return;
        }
        throw new Error(data.detail || "Failed to send OTP");
      }

      showMessage("OTP sent to your email.", "#22c55e");
      show(verifyRow);
      show(resendRow);
      show(expiryRow);

      remainingResends = data.max_resends ?? 3;
      startCountdowns(data.expires_in_seconds || 180, data.cooldown_seconds || 60);
    } catch (e) {
      console.error(e);
      showMessage(e.message, "#ef4444");
    }
  });

  // === RESEND OTP ===
  resendOtpBtn.addEventListener("click", async () => {
    const email = emailEl.value.trim();
    if (!email) {
      showMessage("Enter email first.", "#ef4444");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to resend OTP");

      remainingResends = data.remaining_resends;
      showMessage(`OTP resent. Remaining: ${remainingResends}`, "#22c55e");
      startCountdowns(data.expires_in_seconds || 180, data.cooldown_seconds || 60);
    } catch (e) {
      showMessage(e.message, "#ef4444");
    }
  });

  // === STEP 2: VERIFY OTP ===
  verifyOtpBtn.addEventListener("click", async () => {
    const email = emailEl.value.trim();
    const otp = otpEl.value.trim();
    if (!otp) {
      showMessage("Enter the OTP.", "#ef4444");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Invalid or expired OTP");

      otpVerified = true;
      showMessage("OTP verified. Set password & organization.", "#22c55e");
      show(passwordRow);
      show(confirmPasswordRow);
      show(orgRow);
      show(finalSubmit);
    } catch (e) {
      showMessage(e.message, "#ef4444");
    }
  });

  // === STEP 3: COMPLETE SIGNUP ===
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showMessage("Please verify OTP first.", "#ef4444");
      return;
    }

    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const confirm = confirmEl.value;
    const organization = orgEl.value.trim();

    if (!password || !confirm || !organization) {
      showMessage("Fill password, confirm & organization.", "#ef4444");
      return;
    }
    if (password !== confirm) {
      showMessage("Passwords do not match.", "#ef4444");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/complete-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, organization }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Signup failed");

      showMessage("Signup successful! Redirecting...", "#22c55e");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (e) {
      showMessage(e.message, "#ef4444");
    }
  });
});
