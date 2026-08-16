function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function displayGenres() {
  const tableBody = document.getElementById("genreTableBody");

  if (!tableBody) {
    return;
  }

  try {
    const response = await fetch("/api/genres");

    const genres = await response.json();

    if (!response.ok) {
      throw new Error(genres.error || "Failed to load genres.");
    }

    tableBody.innerHTML = "";

    for (let i = 0; i < genres.length; i++) {
      const genre = genres[i];

      const row = document.createElement("tr");

      row.innerHTML =
        "<td>" +
        escapeHTML(genre.name) +
        "</td>" +
        '<td class="actions">' +
        '<a class="button" href="genre-form.html?id=' +
        genre.id +
        '">Edit</a>' +
        '<button class="delete-button" onclick="deleteGenre(' +
        genre.id +
        ')">Delete</button>' +
        "</td>";

      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error(error);

    tableBody.innerHTML =
      "<tr><td colspan='2'>Failed to load genres.</td></tr>";
  }
}

async function deleteGenre(id) {
  if (!confirm("Are you sure you want to delete this genre?")) {
    return;
  }

  try {
    const response = await fetch("/api/genres/" + id, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete genre.");
    }

    displayGenres();
  } catch (error) {
    alert(error.message);
  }
}

displayGenres();
