document.addEventListener("DOMContentLoaded", () => {
  // Animate progress bar fill
  const progressFill = document.querySelector(".progress-fill");
  const scoreText = document.querySelector(".ats-score").textContent;
  const scoreValue = parseInt(scoreText.split("/")[0].trim());

  progressFill.style.width = "0%";
  setTimeout(() => {
    progressFill.style.transition = "width 1s ease-in-out";
    progressFill.style.width = `${scoreValue}%`;
  }, 100);

  // Highlight keywords dynamically
  const keywords = document.querySelectorAll(".keyword");
  keywords.forEach((keyword) => {
    keyword.style.backgroundColor = "#e0f7fa";
    keyword.style.padding = "6px 10px";
    keyword.style.margin = "4px";
    keyword.style.borderRadius = "6px";
    keyword.style.display = "inline-block";
    keyword.style.fontWeight = "bold";
    keyword.style.color = "#00796b";
  });

  // Optional: make score history clickable
  const scoreItems = document.querySelectorAll(".card:nth-of-type(3) li");
  scoreItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      alert(`Viewing details for: ${item.textContent}`);
      // Future: redirect to detailed score breakdown
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Animate ATS score progress bar
  const scoreElement = document.querySelector(".ats-score");
  const progressFill = document.querySelector(".progress-fill");

  if (scoreElement && progressFill) {
    const score = parseInt(scoreElement.textContent.split("/")[0].trim());
    progressFill.style.width = "0%";
    setTimeout(() => {
      progressFill.style.transition = "width 1s ease-in-out";
      progressFill.style.width = `${score}%`;
    }, 100);
  }

  // Style matched keywords
  const keywords = document.querySelectorAll(".keyword");
  keywords.forEach((keyword) => {
    keyword.style.backgroundColor = "#e0f7fa";
    keyword.style.padding = "6px 10px";
    keyword.style.margin = "4px";
    keyword.style.borderRadius = "6px";
    keyword.style.display = "inline-block";
    keyword.style.fontWeight = "bold";
    keyword.style.color = "#00796b";
  });

  // Make score history items interactive
  const scoreItems = document.querySelectorAll(".card:nth-of-type(3) li");
  scoreItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      alert(`Viewing details for: ${item.textContent}`);
      // Future: redirect to detailed score breakdown or resume viewer
    });
  });
});
