document.addEventListener("DOMContentLoaded", () => {
  const otpForm = document.getElementById("otpForm");

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();
    const email = localStorage.getItem("resetEmail");

    const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ OTP verified successfully.");
      window.location.href = "reset_password.html";
    } else {
      alert(data.detail || "Invalid OTP. Please try again.");
    }
  });
});
