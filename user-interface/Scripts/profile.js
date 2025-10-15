// Score Trends Chart
const ctx = document.getElementById("scoreChart").getContext("2d");

const scoreChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["July", "August", "September", "October"],
    datasets: [
      {
        label: "ATS Score",
        data: [65, 72, 78, 85],
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        borderColor: "rgba(52, 152, 219, 1)",
        borderWidth: 2,
        pointBackgroundColor: "#3498db",
        pointRadius: 5,
        fill: true,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Score (%)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  },
});
