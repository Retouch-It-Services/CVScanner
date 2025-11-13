let matchChart, experienceChart, skillsChart;

// Main report generation function
function generateReport() {
  const jobRole = document.getElementById("jobSelect").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  if (!jobRole || !fromDate || !toDate) {
    alert("Please select job role and date range!");
    return;
  }

  const candidates = JSON.parse(localStorage.getItem("candidates") || "[]");

  if (candidates.length === 0) {
    alert("No candidate data found. Please upload resumes first.");
    return;
  }

  // Filter candidates by job role and date
  const filtered = candidates.filter(c => {
    const cDate = new Date(c.date);
    return (
      c.role.toLowerCase() === jobRole.toLowerCase() &&
      cDate >= new Date(fromDate) &&
      cDate <= new Date(toDate)
    );
  });

  const chartsContainer = document.getElementById("chartsContainer");

  if (filtered.length === 0) {
    chartsContainer.classList.add("hidden");
    alert("No data found for the selected filters.");
    return;
  }

  chartsContainer.classList.remove("hidden");

  // Destroy previous charts if they exist
  if (matchChart) matchChart.destroy();
  if (experienceChart) experienceChart.destroy();
  if (skillsChart) skillsChart.destroy();

  // ✅ Match % Chart
  matchChart = new Chart(document.getElementById("matchChart"), {
    type: "bar",
    data: {
      labels: filtered.map(c => c.name),
      datasets: [{
        label: "Match %",
        data: filtered.map(c => c.match),
        backgroundColor: "#2563eb"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // ✅ Experience Chart
  const expBuckets = { "0-2 yrs": 0, "3-5 yrs": 0, "6-8 yrs": 0, "9+ yrs": 0 };
  filtered.forEach(c => {
    const exp = parseInt(c.experience);
    if (exp <= 2) expBuckets["0-2 yrs"]++;
    else if (exp <= 5) expBuckets["3-5 yrs"]++;
    else if (exp <= 8) expBuckets["6-8 yrs"]++;
    else expBuckets["9+ yrs"]++;
  });

  experienceChart = new Chart(document.getElementById("experienceChart"), {
    type: "pie",
    data: {
      labels: Object.keys(expBuckets),
      datasets: [{
        data: Object.values(expBuckets),
        backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444"]
      }]
    },
    options: { responsive: true }
  });

  // ✅ Skills Chart
  const skillCounts = {};
  filtered.forEach(c => {
    c.skills.split(",").map(s => s.trim()).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  skillsChart = new Chart(document.getElementById("skillsChart"), {
    type: "bar",
    data: {
      labels: Object.keys(skillCounts),
      datasets: [{
        label: "Skill Frequency",
        data: Object.values(skillCounts),
        backgroundColor: "#f97316"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

// Handle "Generate Report" click
document.getElementById("generateReport").addEventListener("click", generateReport);

// 🧠 Auto-Update: When localStorage data changes (from dashboard)
window.addEventListener("storage", e => {
  if (e.key === "candidates") {
    console.log("🔄 Candidates data updated from another tab.");
    autoRefreshIfFiltersSet();
  }
});

// 🧩 Also catch custom event if dispatched in same tab
window.addEventListener("candidatesUpdated", () => {
  console.log("🔄 Candidates updated within this tab.");
  autoRefreshIfFiltersSet();
});

// Refresh charts automatically if filters already chosen
function autoRefreshIfFiltersSet() {
  const jobRole = document.getElementById("jobSelect").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  if (jobRole && fromDate && toDate) {
    generateReport();
  }
}
