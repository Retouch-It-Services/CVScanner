function initSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("menuToggle");
  const mainContent = document.getElementById("mainContent");
  const navbar = document.querySelector(".navbar");

  if (!sidebar || !toggleBtn || !mainContent || !navbar) return;

  // Toggle sidebar
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("shifted");
    navbar.classList.toggle("shifted");
  });

  // Close sidebar on outside click
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      mainContent.classList.remove("shifted");
      navbar.classList.remove("shifted");
    }
  });
}
