function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function displayAuthors() {
  const tableBody = document.getElementById("authorTableBody");

  if (!tableBody) {
    return;
  }

  try {
    const response = await fetch("/api/authors");

    const authors = await response.json();

    if (!response.ok) {
      throw new Error(authors.error || "Failed to load authors.");
    }

    tableBody.innerHTML = "";

    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];

      const row = document.createElement("tr");

      row.innerHTML =
        "<td>" +
        escapeHTML(author.name) +
        "</td>" +
        "<td>" +
        escapeHTML(author.biography) +
        "</td>" +
        '<td class="actions">' +
        '<a class="button" href="author-form.html?id=' +
        author.id +
        '">Edit</a>' +
        '<button class="delete-button" onclick="deleteAuthor(' +
        author.id +
        ')">Delete</button>' +
        "</td>";

      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error(error);

    tableBody.innerHTML =
      "<tr><td colspan='3'>Failed to load authors.</td></tr>";
  }
}

async function deleteAuthor(id) {
  if (!confirm("Are you sure you want to delete this author?")) {
    return;
  }

  try {
    const response = await fetch("/api/authors/" + id, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete author.");
    }

    displayAuthors();
  } catch (error) {
    alert(error.message);
  }
}

displayAuthors();
