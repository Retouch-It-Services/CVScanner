// Example after analyzing resumes
function saveCandidatesData(parsedCandidates) {
  localStorage.setItem("candidates", JSON.stringify(parsedCandidates));

  // 🔔 Dispatch event to notify other pages (like reports.html)
  window.dispatchEvent(new Event("candidatesUpdated"));
}
