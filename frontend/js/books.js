let books = [];
let genres = [];

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadBooks() {
  const response = await fetch("/api/books");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load books.");
  }

  books = data;
}

async function loadGenres() {
  const response = await fetch("/api/genres");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load genres.");
  }

  genres = data;
}

function displayBooks() {
  const tableBody = document.getElementById("bookTableBody");

  if (!tableBody) {
    return;
  }

  const searchInput = document.getElementById("searchBook");

  const genreFilter = document.getElementById("genreFilter");

  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  const selectedGenre = genreFilter ? genreFilter.value : "";

  tableBody.innerHTML = "";

  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    const matchesSearch = book.title.toLowerCase().includes(searchText);

    const matchesGenre = selectedGenre === "" || book.genre === selectedGenre;

    if (!matchesSearch || !matchesGenre) {
      continue;
    }

    const row = document.createElement("tr");

    if (Number(book.stock) < 5) {
      row.classList.add("low-stock");
    }

    let cover = "No Image";

    if (book.cover) {
      cover =
        '<img src="' +
        escapeHTML(book.cover) +
        '" class="book-cover" alt="Book Cover">';
    }

    row.innerHTML =
      "<td>" +
      cover +
      "</td>" +
      "<td>" +
      escapeHTML(book.title) +
      "</td>" +
      "<td>" +
      escapeHTML(book.author) +
      "</td>" +
      "<td>" +
      escapeHTML(book.genre) +
      "</td>" +
      "<td>" +
      escapeHTML(book.stock) +
      "</td>" +
      '<td class="actions">' +
      '<a class="button" href="view-book.html?id=' +
      book.id +
      '">View</a>' +
      '<a class="button" href="book-form.html?id=' +
      book.id +
      '">Edit</a>' +
      '<button class="delete-button" onclick="deleteBook(' +
      book.id +
      ')">Delete</button>' +
      "</td>";

    tableBody.appendChild(row);
  }
}

function loadGenreFilter() {
  const filter = document.getElementById("genreFilter");

  if (!filter) {
    return;
  }

  filter.innerHTML = '<option value="">All Genres</option>';

  for (let i = 0; i < genres.length; i++) {
    const option = document.createElement("option");

    option.value = genres[i].name;

    option.textContent = genres[i].name;

    filter.appendChild(option);
  }
}

async function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    const response = await fetch("/api/books/" + id, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete book.");
    }

    await loadBooks();

    displayBooks();
  } catch (error) {
    alert(error.message);
  }
}

async function initializeBooksPage() {
  try {
    await loadBooks();
    await loadGenres();

    loadGenreFilter();
    displayBooks();
  } catch (error) {
    console.error(error);

    const tableBody = document.getElementById("bookTableBody");

    if (tableBody) {
      tableBody.innerHTML =
        "<tr><td colspan='6'>Failed to load books.</td></tr>";
    }
  }
}

initializeBooksPage();
