function initSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("menuToggle"); // 3-lines button
  const mainContent = document.getElementById("mainContent");
  const navbar = document.querySelector(".navbar");

  // Check all elements exist
  if (!sidebar || !toggleBtn || !mainContent || !navbar) return;

  // Toggle sidebar on button click
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent triggering document click
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("shifted");
    navbar.classList.toggle("shifted");
  });

  // Close sidebar when clicking outside
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
