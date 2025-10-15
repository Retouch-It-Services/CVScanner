// Resume Upload Handler
function uploadResume() {
  const resumeFile = document.getElementById("resumeUpload").files[0];
  if (!resumeFile) {
    alert("Please select a resume file to upload.");
    return;
  }

  console.log("Uploading resume:", resumeFile.name);
  // Simulate scan and feedback
  alert(`Resume "${resumeFile.name}" uploaded and scanned successfully.`);
}

// Job Description Upload Handler
function uploadJobDescription() {
  const jobFile = document.getElementById("jobDescUpload").files[0];
  if (!jobFile) {
    alert("Please select a job description file to upload.");
    return;
  }

  console.log("Uploading job description:", jobFile.name);
  alert(`Job description "${jobFile.name}" uploaded successfully.`);
}

// Submit Job Description Text
function submitJobDescription() {
  const jobText = document.getElementById("jobDescText").value.trim();
  if (!jobText) {
    alert("Please paste a job description before submitting.");
    return;
  }

  console.log("Submitted job description text:", jobText);
  alert("Job description submitted successfully.");
}

// Resume List Actions
document.addEventListener("DOMContentLoaded", () => {
  const resumeItems = document.querySelectorAll(".resume-list li");

  resumeItems.forEach((item) => {
    const viewBtn = item.querySelector(".view-btn");
    const deleteBtn = item.querySelector(".delete-btn");
    const fileName = item.querySelector("strong").textContent;

    viewBtn.addEventListener("click", () => {
      alert(`Viewing resume: ${fileName}`);
      // Future: redirect to resume viewer
    });

    deleteBtn.addEventListener("click", () => {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${fileName}"?`
      );
      if (confirmDelete) {
        item.remove();
        alert(`Resume "${fileName}" deleted.`);
      }
    });
  });
});
