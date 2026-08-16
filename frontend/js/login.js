const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();

  const password = document.getElementById("password").value;

  const errorMessage = document.getElementById("loginError");

  errorMessage.textContent = "";

  if (!username || !password) {
    errorMessage.textContent = "Please enter username and password.";

    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessage.textContent =
        result.error || "Invalid username or password.";

      return;
    }

    localStorage.setItem("token", result.token);

    localStorage.setItem("loggedIn", "true");

    localStorage.setItem("currentUser", JSON.stringify(result.user));

    window.location.href = "index.html";
  } catch (error) {
    console.error(error);

    errorMessage.textContent = "Unable to connect to the server.";
  }
});
