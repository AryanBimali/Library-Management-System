const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  const username = document.getElementById("username").value.trim();

  const password = document.getElementById("password").value;

  const confirmPassword = document.getElementById("confirmPassword").value;

  const errorMessage = document.getElementById("signupError");

  errorMessage.textContent = "";

  if (!name || !username || !password || !confirmPassword) {
    errorMessage.textContent = "Please fill in all fields.";

    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters.";

    return;
  }

  if (password !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match.";

    return;
  }

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      errorMessage.textContent = result.error || "Failed to create account.";

      return;
    }

    alert("Account created successfully!");

    window.location.href = "login.html";
  } catch (error) {
    console.error(error);

    errorMessage.textContent = "Unable to connect to the server.";
  }
});
