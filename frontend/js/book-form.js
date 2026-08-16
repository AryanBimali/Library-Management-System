let authors = [];
let genres = [];

async function loadAuthors() {
  const response = await fetch("/api/authors");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load authors.");
  }

  authors = data;
}

async function loadGenres() {
  const response = await fetch("/api/genres");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load genres.");
  }

  genres = data;
}

function fillAuthorSelect() {
  const authorSelect = document.getElementById("bookAuthor");

  authorSelect.innerHTML = '<option value="">Select Author</option>';

  for (let i = 0; i < authors.length; i++) {
    const option = document.createElement("option");

    option.value = authors[i].name;

    option.textContent = authors[i].name;

    authorSelect.appendChild(option);
  }
}

function fillGenreSelect() {
  const genreSelect = document.getElementById("bookGenre");

  genreSelect.innerHTML = '<option value="">Select Genre</option>';

  for (let i = 0; i < genres.length; i++) {
    const option = document.createElement("option");

    option.value = genres[i].name;

    option.textContent = genres[i].name;

    genreSelect.appendChild(option);
  }
}

async function loadBookForm() {
  const form = document.getElementById("bookForm");

  if (!form) {
    return;
  }

  try {
    await loadAuthors();
    await loadGenres();

    fillAuthorSelect();
    fillGenreSelect();

    const parameters = new URLSearchParams(window.location.search);

    const id = parameters.get("id");

    let editingBook = null;

    if (id) {
      const response = await fetch("/api/books/" + id);

      const book = await response.json();

      if (!response.ok) {
        throw new Error(book.error || "Book not found.");
      }

      editingBook = book;

      document.getElementById("bookFormTitle").textContent = "Edit Book";

      document.getElementById("bookTitle").value = book.title;

      document.getElementById("bookAuthor").value = book.author;

      document.getElementById("bookGenre").value = book.genre;

      document.getElementById("bookStock").value = book.stock;

      if (book.cover) {
        const preview = document.getElementById("coverPreview");

        preview.src = book.cover;

        preview.style.display = "block";
      }
    }

    const imageInput = document.getElementById("bookCover");

    const preview = document.getElementById("coverPreview");

    imageInput.addEventListener("change", function () {
      const imageFile = imageInput.files[0];

      if (!imageFile) {
        return;
      }

      if (!imageFile.type.startsWith("image/")) {
        alert("Please select a valid image file.");

        imageInput.value = "";

        preview.style.display = "none";

        return;
      }

      const reader = new FileReader();

      reader.onload = function () {
        preview.src = reader.result;

        preview.style.display = "block";
      };

      reader.readAsDataURL(imageFile);
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const title = document.getElementById("bookTitle").value.trim();

      const author = document.getElementById("bookAuthor").value;

      const genre = document.getElementById("bookGenre").value;

      const stock = document.getElementById("bookStock").value;

      if (!title || !author || !genre || stock === "") {
        alert("Please fill in all required fields.");

        return;
      }

      if (Number(stock) < 0) {
        alert("Stock quantity cannot be negative.");

        return;
      }

      const imageFile = imageInput.files[0];

      if (imageFile) {
        const reader = new FileReader();

        reader.onload = async function () {
          await saveBook(
            title,
            author,
            genre,
            stock,
            reader.result,
            editingBook,
          );
        };

        reader.readAsDataURL(imageFile);
      } else {
        const oldCover = editingBook ? editingBook.cover : "";

        await saveBook(title, author, genre, stock, oldCover, editingBook);
      }
    });
  } catch (error) {
    alert(error.message);
  }
}

async function saveBook(title, author, genre, stock, cover, editingBook) {
  try {
    let response;

    const bookData = {
      title: title,
      author: author,
      genre: genre,
      stock: Number(stock),
      cover: cover || "",
    };

    if (editingBook) {
      response = await fetch("/api/books/" + editingBook.id, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(bookData),
      });
    } else {
      response = await fetch("/api/books", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(bookData),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to save book.");
    }

    alert("Book saved successfully!");

    window.location.href = "books.html";
  } catch (error) {
    alert(error.message);
  }
}

loadBookForm();
