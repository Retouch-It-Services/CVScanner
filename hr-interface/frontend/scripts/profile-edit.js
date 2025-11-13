const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const uploadBtn = document.getElementById("uploadPicBtn");
const imageUpload = document.getElementById("imageUpload");
const profilePic = document.getElementById("profilePic");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const orgInput = document.getElementById("organization");
const bioInput = document.getElementById("bio");

async function loadProfile() {
  const res = await fetch("http://127.0.0.1:8000/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    nameInput.value = `${data.first_name || ""} ${data.last_name || ""}`;
    emailInput.value = data.email || "";
    phoneInput.value = data.phone || "";
    orgInput.value = data.organization || "";
    bioInput.value = data.bio || "";

    if (data.profile_pic) {
      profilePic.src = `http://127.0.0.1:8000/${data.profile_pic}`;
    }
  }
}

// Upload Image
uploadBtn.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/profile/upload-photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    profilePic.src = `http://127.0.0.1:8000/${data.profile_pic}`;
    alert("✅ Profile photo updated!");
  }
});

// Save Changes
document.getElementById("saveBtn").addEventListener("click", async () => {
  const fullName = nameInput.value.trim();
  const [first_name, ...rest] = fullName.split(" ");
  const last_name = rest.join(" ");
  const body = {
    first_name,
    last_name,
    phone: phoneInput.value.trim(),
    organization: orgInput.value.trim(),
    bio: bioInput.value.trim(),
  };

  const res = await fetch("http://127.0.0.1:8000/profile/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert("✅ Profile saved successfully!");
    window.location.href = "profile.html";
  } else {
    alert("❌ Failed to save changes.");
  }
});

// Back Button
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "profile.html";
});

loadProfile();
