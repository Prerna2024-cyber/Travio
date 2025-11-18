document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (res.ok) {
    localStorage.setItem("token", result.token);
    alert("Login successful!");
    window.location.href = "/index.html";
  } else {
    alert(result.message || "Login failed");
  }
});
