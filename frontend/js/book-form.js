let authors = [];
let genres = [];

// =====================================================
// LOAD AUTHORS
// =====================================================

async function loadAuthors() {
  const response = await fetch("/api/authors");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load authors.");
  }

  authors = data;
}

// =====================================================
// LOAD GENRES
// =====================================================

async function loadGenres() {
  const response = await fetch("/api/genres");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load genres.");
  }

  genres = data;
}

// =====================================================
// FILL AUTHOR DROPDOWN
// =====================================================

function fillAuthorSelect() {
  const authorSelect = document.getElementById("bookAuthor");

  authorSelect.innerHTML = '<option value="">Select Author</option>';

  for (let i = 0; i < authors.length; i++) {
    const option = document.createElement("option");

    // IMPORTANT:
    // Use author ID as the value
    option.value = authors[i].id;

    // Display author name
    option.textContent = authors[i].name;

    authorSelect.appendChild(option);
  }
}

// =====================================================
// FILL GENRE DROPDOWN
// =====================================================

function fillGenreSelect() {
  const genreSelect = document.getElementById("bookGenre");

  genreSelect.innerHTML = '<option value="">Select Genre</option>';

  for (let i = 0; i < genres.length; i++) {
    const option = document.createElement("option");

    // IMPORTANT:
    // Use genre ID as the value
    option.value = genres[i].id;

    // Display genre name
    option.textContent = genres[i].name;

    genreSelect.appendChild(option);
  }
}

// =====================================================
// LOAD BOOK FORM
// =====================================================

async function loadBookForm() {
  const form = document.getElementById("bookForm");

  if (!form) {
    return;
  }

  try {
    // Load authors and genres
    await loadAuthors();
    await loadGenres();

    // Fill dropdowns
    fillAuthorSelect();
    fillGenreSelect();

    // Check if this is edit mode
    const parameters = new URLSearchParams(window.location.search);

    const id = parameters.get("id");

    let editingBook = null;

    // =================================================
    // EDIT BOOK
    // =================================================

    if (id) {
      const response = await fetch("/api/books/" + id);

      const book = await response.json();

      if (!response.ok) {
        throw new Error(book.error || "Book not found.");
      }

      editingBook = book;

      document.getElementById("bookFormTitle").textContent = "Edit Book";

      document.getElementById("bookTitle").value = book.title;

      // IMPORTANT:
      // Select the author using author_id
      document.getElementById("bookAuthor").value = book.author_id;

      // IMPORTANT:
      // Select the genre using genre_id
      document.getElementById("bookGenre").value = book.genre_id;

      document.getElementById("bookStock").value = book.stock;

      // Display existing cover
      if (book.cover) {
        const preview = document.getElementById("coverPreview");

        preview.src = book.cover;

        preview.style.display = "block";
      }
    }

    // =================================================
    // COVER IMAGE PREVIEW
    // =================================================

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

    // =================================================
    // FORM SUBMISSION
    // =================================================

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const title = document.getElementById("bookTitle").value.trim();

      // These are now IDs
      const author_id = document.getElementById("bookAuthor").value;

      const genre_id = document.getElementById("bookGenre").value;

      const stock = document.getElementById("bookStock").value;

      // Validate fields
      if (!title || !author_id || !genre_id || stock === "") {
        alert("Please fill in all required fields.");

        return;
      }

      // Validate stock
      if (Number(stock) < 0) {
        alert("Stock quantity cannot be negative.");

        return;
      }

      const imageFile = imageInput.files[0];

      // =================================================
      // NEW COVER IMAGE
      // =================================================

      if (imageFile) {
        const reader = new FileReader();

        reader.onload = async function () {
          await saveBook(
            title,
            author_id,
            genre_id,
            stock,
            reader.result,
            editingBook,
          );
        };

        reader.readAsDataURL(imageFile);
      }

      // =================================================
      // NO NEW COVER IMAGE
      // =================================================
      else {
        const oldCover = editingBook ? editingBook.cover : "";

        await saveBook(
          title,
          author_id,
          genre_id,
          stock,
          oldCover,
          editingBook,
        );
      }
    });
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}

// =====================================================
// SAVE BOOK
// =====================================================

async function saveBook(title, author_id, genre_id, stock, cover, editingBook) {
  try {
    let response;

    // IMPORTANT:
    // These names MUST match the database/backend
    const bookData = {
      title: title,
      author_id: Number(author_id),
      genre_id: Number(genre_id),
      stock: Number(stock),
      cover: cover || "",
    };

    console.log("Sending book data:", bookData);

    // =================================================
    // UPDATE EXISTING BOOK
    // =================================================

    if (editingBook) {
      response = await fetch("/api/books/" + editingBook.id, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(bookData),
      });
    }

    // =================================================
    // CREATE NEW BOOK
    // =================================================
    else {
      response = await fetch("/api/books", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(bookData),
      });
    }

    const result = await response.json();

    console.log("Server response:", result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to save book.");
    }

    alert("Book saved successfully!");

    window.location.href = "books.html";
  } catch (error) {
    console.error("Save book error:", error);

    alert(error.message);
  }
}

// =====================================================
// START
// =====================================================

loadBookForm();
