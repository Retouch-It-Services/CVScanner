document.getElementById("analyseBtn").addEventListener("click", () => {
  const resumeFiles = document.getElementById("resumeUpload").files;
  const jdFile = document.getElementById("jdUpload").files[0];
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const statusText = document.getElementById("uploadStatus");

  if (resumeFiles.length === 0 || !jdFile) {
    alert("Please upload both candidate resumes and a job description file before analyzing.");
    return;
  }

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  statusText.textContent = "Analyzing resumes...";

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => analyzeResumes(resumeFiles), 500);
    }
  }, 200);
});

function analyzeResumes(resumeFiles) {
  const candidateList = document.getElementById("candidate-list");
  candidateList.innerHTML = "";

  const candidates = [];

  for (let i = 0; i < resumeFiles.length; i++) {
    const file = resumeFiles[i];
    const matchPercent = Math.floor(Math.random() * 41) + 60;
    const expYears = Math.floor(Math.random() * 10) + 1;

    candidates.push({
      name: file.name.replace(/\.[^/.]+$/, ""),
      match: matchPercent,
      experience: `${expYears} yrs`,
      skills: generateRandomSkills(),
      resumeFile: URL.createObjectURL(file),
      resumeName: file.name
    });
  }

  candidates.forEach((candidate, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${candidate.name}</td>
      <td>${candidate.match}%</td>
      <td>${candidate.experience}</td>
      <td>
        <button class="view-btn" data-index="${index}">View</button>
      </td>
    `;
    candidateList.appendChild(row);
  });

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      showCandidateDetails(candidates[index]);
    });
  });

  // Update summary cards
  const totalResumes = candidates.length;
  const topMatch = Math.max(...candidates.map(c => c.match));
  const avgFit = (candidates.reduce((sum, c) => sum + c.match, 0) / totalResumes).toFixed(1);

  document.getElementById("totalResumes").textContent = totalResumes;
  document.getElementById("topMatches").textContent = `${topMatch}%`;
  document.getElementById("avgFit").textContent = `${avgFit}%`;

  document.getElementById("uploadStatus").textContent = "Analysis complete ✅";
  document.getElementById("progressContainer").style.display = "none";
}

function generateRandomSkills() {
  const skillPool = ["Python","JavaScript","React","Node.js","SQL","Machine Learning",
                     "Data Analysis","C#","Java","HTML","CSS","AWS","Azure","Docker","TensorFlow"];
  const selected = [];
  while (selected.length < 4) {
    const skill = skillPool[Math.floor(Math.random() * skillPool.length)];
    if (!selected.includes(skill)) selected.push(skill);
  }
  return selected.join(", ");
}

// Show Candidate Modal with Details + Download Button
function showCandidateDetails(candidate) {
  const modal = document.getElementById("candidateModal");
  const modalContent = document.getElementById("modalContent");

  modalContent.innerHTML = `
    <h2>${candidate.name}</h2>
    <p><strong>Match:</strong> ${candidate.match}%</p>
    <p><strong>Experience:</strong> ${candidate.experience}</p>
    <p><strong>Skills:</strong> ${candidate.skills}</p>
    <button class="download-resume-btn" onclick="downloadResume('${candidate.resumeFile}','${candidate.resumeName}')">Download Resume</button>
  `;
  modal.style.display = "flex";
}

function downloadResume(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}

// Close Modal
function closeModal() {
  document.getElementById("candidateModal").style.display = "none";
}
