async function loadAuthorForm() {
  const form = document.getElementById("authorForm");

  if (!form) {
    return;
  }

  const parameters = new URLSearchParams(window.location.search);

  const id = parameters.get("id");

  let editingAuthor = null;

  if (id) {
    try {
      const response = await fetch("/api/authors/" + id);

      const author = await response.json();

      if (!response.ok) {
        throw new Error(author.error || "Author not found.");
      }

      editingAuthor = author;

      document.getElementById("authorFormTitle").textContent = "Edit Author";

      document.getElementById("authorName").value = author.name;

      document.getElementById("authorBiography").value = author.biography || "";
    } catch (error) {
      alert(error.message);

      window.location.href = "authors.html";

      return;
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("authorName").value.trim();

    const biography = document.getElementById("authorBiography").value.trim();

    if (!name) {
      alert("Author name is required.");
      return;
    }

    try {
      let response;

      if (editingAuthor) {
        response = await fetch("/api/authors/" + editingAuthor.id, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            biography: biography,
          }),
        });
      } else {
        response = await fetch("/api/authors", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
            biography: biography,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save author.");
      }

      alert("Author saved successfully!");

      window.location.href = "authors.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

loadAuthorForm();
