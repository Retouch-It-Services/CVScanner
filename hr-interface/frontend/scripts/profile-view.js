const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

async function loadProfileView() {
  const res = await fetch("http://127.0.0.1:8000/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    document.getElementById("profileName").textContent =
      `${data.first_name || ""} ${data.last_name || ""}`;
    document.getElementById("profileEmail").textContent = data.email || "";
    document.getElementById("profileOrg").textContent = `Organization: ${data.organization || "-"}`;
    document.getElementById("profileRole").textContent = data.role || "Human Resources Manager";

    if (data.profile_pic) {
      document.getElementById("profilePic").src = `http://127.0.0.1:8000/${data.profile_pic}`;
    }
  } else {
    alert("Failed to load profile details");
  }
}

document.getElementById("editBtn").addEventListener("click", () => {
  window.location.href = "edit_profile.html";
});

loadProfileView();
