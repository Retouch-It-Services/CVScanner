document.addEventListener("DOMContentLoaded", () => {
  const profilePic = document.getElementById("profilePic");
  const imageUpload = document.getElementById("imageUpload");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const saveBtn = document.getElementById("saveBtn");
  const backBtn = document.getElementById("backToDashboard");
  const toast = document.getElementById("toast");

  const token = localStorage.getItem("token");
  const API_BASE = "http://127.0.0.1:8000";

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load profile");

      const data = await res.json();
      nameInput.value = `${data.first_name || ""} ${data.last_name || ""}`.trim();
      emailInput.value = data.email || "";
      phoneInput.value = data.phone || "";

      if (data.profile_pic) {
        const url = data.profile_pic.startsWith("http")
          ? data.profile_pic
          : `${API_BASE}/${data.profile_pic}`;
        profilePic.src = url;
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading profile");
    }
  }

  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/profile/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const imageUrl = `${API_BASE}/${data.profile_pic}`;
      profilePic.src = imageUrl;
      localStorage.setItem("profile_pic", imageUrl);
      showToast("Profile picture updated!");
    } catch (err) {
      console.error(err);
      showToast("Image upload failed");
    }
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    try {
      const res = await fetch(
        `${API_BASE}/profile/update?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Update failed");
      showToast("Profile updated successfully!");
      loadProfile();
    } catch (err) {
      console.error(err);
      showToast("Profile update failed");
    }
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  loadProfile();
});
