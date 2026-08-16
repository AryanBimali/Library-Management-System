async function loadGenreForm() {
  const form = document.getElementById("genreForm");

  if (!form) {
    return;
  }

  const parameters = new URLSearchParams(window.location.search);

  const id = parameters.get("id");

  let editingGenre = null;

  if (id) {
    try {
      const response = await fetch("/api/genres/" + id);

      const genre = await response.json();

      if (!response.ok) {
        throw new Error(genre.error || "Genre not found.");
      }

      editingGenre = genre;

      document.getElementById("genreFormTitle").textContent = "Edit Genre";

      document.getElementById("genreName").value = genre.name;
    } catch (error) {
      alert(error.message);

      window.location.href = "genres.html";

      return;
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("genreName").value.trim();

    if (!name) {
      alert("Genre name is required.");
      return;
    }

    try {
      let response;

      if (editingGenre) {
        response = await fetch("/api/genres/" + editingGenre.id, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
          }),
        });
      } else {
        response = await fetch("/api/genres", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save genre.");
      }

      alert("Genre saved successfully!");

      window.location.href = "genres.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

loadGenreForm();
