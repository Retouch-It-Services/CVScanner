document.addEventListener("DOMContentLoaded", () => {
  const analyseBtn = document.getElementById("analyseBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const uploadStatus = document.getElementById("uploadStatus");
  const candidateList = document.getElementById("candidate-list");

  const totalResumes = document.getElementById("totalResumes");
  const topMatches = document.getElementById("topMatches");
  const avgFit = document.getElementById("avgFit");

  analyseBtn.addEventListener("click", async () => {
    const resumeFiles = document.getElementById("resumeUpload").files;
    const jdFile = document.getElementById("jdUpload").files[0];

    if (!resumeFiles.length || !jdFile) {
      alert("Please upload both resumes and a job description before analysing.");
      return;
    }

    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    uploadStatus.textContent = "Analyzing resumes...";

    // Create FormData
    const formData = new FormData();
    for (let file of resumeFiles) formData.append("resumes", file);

    // Send JD with both field names for backend compatibility
    formData.append("jd", jdFile);
    formData.append("job_description", jdFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", res.status, errText);
        throw new Error(`Backend returned ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Analysis Result:", data);

      const candidates = data.candidates || [];

      // Update dashboard stats and table
      updateDashboardStats(candidates);
      renderCandidates(candidates);

      progressBar.style.width = "100%";
      uploadStatus.textContent = "Analysis complete ✅";
      setTimeout(() => (progressContainer.style.display = "none"), 800);
    } catch (err) {
      console.error("❌ Error analyzing resumes:", err);
      uploadStatus.textContent = "Error analyzing resumes ❌";
      progressContainer.style.display = "none";
    }
  });

  // Dashboard Stats Update

  function updateDashboardStats(candidates) {
    if (!candidates.length) {
      totalResumes.textContent = "--";
      topMatches.textContent = "--";
      avgFit.textContent = "--";
      return;
    }

    const matchScores = candidates.map(c => parseFloat(c.match || 0));
    const maxMatch = Math.max(...matchScores);
    const avgMatch = (matchScores.reduce((a, b) => a + b, 0) / matchScores.length).toFixed(1);

    totalResumes.textContent = candidates.length;
    topMatches.textContent = `${maxMatch.toFixed(2)}%`;
    avgFit.textContent = `${avgMatch}%`;
  }

  // Render Candidates Table

  function renderCandidates(candidates) {
    candidateList.innerHTML = "";

    if (!candidates.length) {
      candidateList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No candidates found</td></tr>`;
      return;
    }

    candidates.sort((a, b) => b.match - a.match);

    candidates.forEach((c, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.match}%</td>
        <td>${c.experience}</td>
        <td><button class="view-btn" data-index="${i}">View</button></td>
      `;
      candidateList.appendChild(tr);
    });

    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = parseInt(e.target.getAttribute("data-index"));
        showCandidateDetails(candidates[idx]);
      });
    });
  }

  // Modal - Candidate Details

  function showCandidateDetails(c) {
    const modal = document.getElementById("candidateModal");
    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = `
      <h3 style="color:#2b4fff;">${c.name}</h3>
      <p><strong>Match Score:</strong> ${c.match}%</p>
      <p><strong>Experience:</strong> ${c.experience}</p>
      <p><strong>Skills:</strong> ${c.skills.join(", ")}</p>
      <p><strong>Matched Skills:</strong> ${c.matched_skills.join(", ")}</p>
      <p><strong>Missing Skills:</strong> ${c.missing_skills.join(", ")}</p>
      <p><strong>Skill Match %:</strong> ${c.skill_match_percent}%</p>
      <p><strong>Job Fit:</strong> ${c.fit_status}</p>
      <h4>AI Cover Letter</h4>
      <textarea readonly style="width:100%; height:160px;">${c.cover_letter}</textarea>
      <div style="display:flex; justify-content:space-between; margin-top:15px;">
        <a href="${c.resume_url || '#'}" download class="download-btn" 
          style="background:#007bff; color:white; padding:8px 14px; border-radius:6px; text-decoration:none;">
          ⬇️ Download Resume
        </a>
        <button id="closeModalBtn" 
          style="background:#555; color:white; padding:8px 14px; border:none; border-radius:6px;">
          Close
        </button>
      </div>
    `;

    modal.style.display = "flex";

    document.getElementById("closeModalBtn").addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Close modal on outside click

  window.addEventListener("click", e => {
    const modal = document.getElementById("candidateModal");
    if (e.target === modal) modal.style.display = "none";
  });
});
