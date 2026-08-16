function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function viewBook() {
  const container = document.getElementById("bookDetails");

  if (!container) {
    return;
  }

  const parameters = new URLSearchParams(window.location.search);

  const id = parameters.get("id");

  if (!id) {
    container.innerHTML = "<p>Book not found.</p>";

    return;
  }

  try {
    const response = await fetch("/api/books/" + id);

    const book = await response.json();

    if (!response.ok) {
      throw new Error(book.error || "Book not found.");
    }

    let cover = "<p>No cover image available.</p>";

    if (book.cover) {
      cover = '<img src="' + escapeHTML(book.cover) + '" alt="Book Cover">';
    }

    container.innerHTML =
      cover +
      "<div>" +
      "<h2>" +
      escapeHTML(book.title) +
      "</h2>" +
      "<p><strong>Author:</strong> " +
      escapeHTML(book.author) +
      "</p>" +
      "<p><strong>Genre:</strong> " +
      escapeHTML(book.genre) +
      "</p>" +
      "<p><strong>Stock Quantity:</strong> " +
      escapeHTML(book.stock) +
      "</p>" +
      "</div>";
  } catch (error) {
    container.innerHTML = "<p>" + escapeHTML(error.message) + "</p>";
  }
}

viewBook();
