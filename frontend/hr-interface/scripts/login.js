function showSignup() {
  document.getElementById("signup-section").style.display = "block";
}

function hrSignup() {
  const username = document.getElementById("new-hr-username").value;
  const password = document.getElementById("new-hr-password").value;
  if (username && password) {
    localStorage.setItem("hr_" + username, password);
    alert("HR Account Created Successfully!");
    document.getElementById("signup-section").style.display = "none";
  } else {
    alert("Please fill in all fields.");
  }
}

function hrLogin() {
  const username = document.getElementById("hr-username").value;
  const password = document.getElementById("hr-password").value;
  const stored = localStorage.getItem("hr_" + username);
  if (stored && stored === password) {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.");
  }
}

function userSignup() {
  const username = document.getElementById("new-user-username").value;
  const password = document.getElementById("new-user-password").value;
  if (username && password) {
    localStorage.setItem("user_" + username, password);
    alert("User Account Created Successfully!");
    document.getElementById("signup-section").style.display = "none";
  } else {
    alert("Please fill in all fields.");
  }
}

function userLogin() {
  const username = document.getElementById("user-username").value;
  const password = document.getElementById("user-password").value;
  const stored = localStorage.getItem("user_" + username);
  if (stored && stored === password) {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.");
  }
}
