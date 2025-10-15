document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveProfile");

  saveBtn.addEventListener("click", () => {
    const name = document.getElementById("hrName").value;
    const email = document.getElementById("hrEmail").value;
    const dept = document.getElementById("hrDept").value;
    const pass = document.getElementById("hrPass").value;

    const profileData = { name, email, dept, pass };
    localStorage.setItem("hrProfile", JSON.stringify(profileData));

    alert("✅ Profile details saved successfully!");
  });

  // Load stored profile if exists
  const saved = JSON.parse(localStorage.getItem("hrProfile"));
  if (saved) {
    document.getElementById("hrName").value = saved.name || "";
    document.getElementById("hrEmail").value = saved.email || "";
    document.getElementById("hrDept").value = saved.dept || "";
  }
});
// Persist theme across pages
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const theme = document.body.getAttribute("data-theme");
    localStorage.setItem("theme", theme);
  });
}
