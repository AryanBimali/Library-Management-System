// Get data from localStorage
let books = JSON.parse(localStorage.getItem("books")) || [];
let authors = JSON.parse(localStorage.getItem("authors")) || [
  {
    id: 1,
    name: "J.K. Rowling",
    biography: "British author known for the Harry Potter series.",
  },
  {
    id: 2,
    name: "George Orwell",
    biography: "English novelist and essayist.",
  },
];

let genres = JSON.parse(localStorage.getItem("genres")) || [
  {
    id: 1,
    name: "Fantasy",
  },
  {
    id: 2,
    name: "Fiction",
  },
];

// Save data
function saveData() {
  localStorage.setItem("books", JSON.stringify(books));
  localStorage.setItem("authors", JSON.stringify(authors));
  localStorage.setItem("genres", JSON.stringify(genres));
}

saveData();

// -------------------- BOOKS --------------------

function displayBooks() {
  let tableBody = document.getElementById("bookTableBody");

  if (!tableBody) {
    return;
  }

  let searchInput = document.getElementById("searchBook");
  let genreFilter = document.getElementById("genreFilter");

  let searchText = searchInput ? searchInput.value.toLowerCase() : "";
  let selectedGenre = genreFilter ? genreFilter.value : "";

  tableBody.innerHTML = "";

  for (let i = 0; i < books.length; i++) {
    let book = books[i];

    let matchesSearch = book.title.toLowerCase().includes(searchText);

    let matchesGenre = selectedGenre === "" || book.genre === selectedGenre;

    if (matchesSearch && matchesGenre) {
      let row = document.createElement("tr");

      // Low stock alert
      if (Number(book.stock) < 5) {
        row.classList.add("low-stock");
      }

      let cover = "";

      if (book.cover) {
        cover =
          '<img src="' + book.cover + '" class="book-cover" alt="Book Cover">';
      } else {
        cover = "No Image";
      }

      row.innerHTML =
        "<td>" +
        cover +
        "</td>" +
        "<td>" +
        book.title +
        "</td>" +
        "<td>" +
        book.author +
        "</td>" +
        "<td>" +
        book.genre +
        "</td>" +
        "<td>" +
        book.stock +
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
}

function loadGenreFilter() {
  let filter = document.getElementById("genreFilter");

  if (!filter) {
    return;
  }

  for (let i = 0; i < genres.length; i++) {
    let option = document.createElement("option");

    option.value = genres[i].name;
    option.textContent = genres[i].name;

    filter.appendChild(option);
  }
}

function deleteBook(id) {
  let confirmDelete = confirm("Are you sure you want to delete this book?");

  if (confirmDelete) {
    books = books.filter(function (book) {
      return book.id !== id;
    });

    saveData();
    displayBooks();
  }
}

function viewBook() {
  let container = document.getElementById("bookDetails");

  if (!container) {
    return;
  }

  let parameters = new URLSearchParams(window.location.search);
  let id = Number(parameters.get("id"));

  let selectedBook = null;

  for (let i = 0; i < books.length; i++) {
    if (books[i].id === id) {
      selectedBook = books[i];
    }
  }

  if (!selectedBook) {
    container.innerHTML = "<p>Book not found.</p>";
    return;
  }

  let cover = "";

  if (selectedBook.cover) {
    cover = '<img src="' + selectedBook.cover + '" alt="Book Cover">';
  } else {
    cover = "<p>No cover image available.</p>";
  }

  container.innerHTML =
    cover +
    "<div>" +
    "<h2>" +
    selectedBook.title +
    "</h2>" +
    "<p><strong>Author:</strong> " +
    selectedBook.author +
    "</p>" +
    "<p><strong>Genre:</strong> " +
    selectedBook.genre +
    "</p>" +
    "<p><strong>Stock Quantity:</strong> " +
    selectedBook.stock +
    "</p>" +
    "</div>";
}

// -------------------- BOOK FORM --------------------

function loadBookForm() {
  let form = document.getElementById("bookForm");

  if (!form) {
    return;
  }

  let authorSelect = document.getElementById("bookAuthor");
  let genreSelect = document.getElementById("bookGenre");

  // Load authors
  authorSelect.innerHTML = '<option value="">Select Author</option>';

  for (let i = 0; i < authors.length; i++) {
    let option = document.createElement("option");

    option.value = authors[i].name;
    option.textContent = authors[i].name;

    authorSelect.appendChild(option);
  }

  // Load genres
  genreSelect.innerHTML = '<option value="">Select Genre</option>';

  for (let i = 0; i < genres.length; i++) {
    let option = document.createElement("option");

    option.value = genres[i].name;
    option.textContent = genres[i].name;

    genreSelect.appendChild(option);
  }

  let parameters = new URLSearchParams(window.location.search);
  let id = Number(parameters.get("id"));

  let editingBook = null;

  if (id) {
    for (let i = 0; i < books.length; i++) {
      if (books[i].id === id) {
        editingBook = books[i];
      }
    }
  }

  if (editingBook) {
    document.getElementById("bookFormTitle").textContent = "Edit Book";

    document.getElementById("bookTitle").value = editingBook.title;

    document.getElementById("bookAuthor").value = editingBook.author;

    document.getElementById("bookGenre").value = editingBook.genre;

    document.getElementById("bookStock").value = editingBook.stock;

    if (editingBook.cover) {
      let preview = document.getElementById("coverPreview");

      preview.src = editingBook.cover;
      preview.style.display = "block";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let title = document.getElementById("bookTitle").value;

    let author = document.getElementById("bookAuthor").value;

    let genre = document.getElementById("bookGenre").value;

    let stock = document.getElementById("bookStock").value;

    let imageInput = document.getElementById("bookCover");

    let imageFile = imageInput.files[0];

    // If a new image is selected
    if (imageFile) {
      let reader = new FileReader();

      reader.onload = function () {
        saveBook(title, author, genre, stock, reader.result, editingBook);
      };

      reader.readAsDataURL(imageFile);
    } else {
      let oldCover = "";

      if (editingBook) {
        oldCover = editingBook.cover;
      }

      saveBook(title, author, genre, stock, oldCover, editingBook);
    }
  });
}

function saveBook(title, author, genre, stock, cover, editingBook) {
  if (editingBook) {
    editingBook.title = title;
    editingBook.author = author;
    editingBook.genre = genre;
    editingBook.stock = stock;
    editingBook.cover = cover;
  } else {
    let newBook = {
      id: Date.now(),
      title: title,
      author: author,
      genre: genre,
      stock: stock,
      cover: cover,
    };

    books.push(newBook);
  }

  saveData();

  alert("Book saved successfully!");

  window.location.href = "books.html";
}

// -------------------- AUTHORS --------------------

function displayAuthors() {
  let tableBody = document.getElementById("authorTableBody");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  for (let i = 0; i < authors.length; i++) {
    let author = authors[i];

    let row = document.createElement("tr");

    row.innerHTML =
      "<td>" +
      author.name +
      "</td>" +
      "<td>" +
      author.biography +
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
}

function deleteAuthor(id) {
  let confirmDelete = confirm("Are you sure you want to delete this author?");

  if (confirmDelete) {
    authors = authors.filter(function (author) {
      return author.id !== id;
    });

    saveData();
    displayAuthors();
  }
}

function loadAuthorForm() {
  let form = document.getElementById("authorForm");

  if (!form) {
    return;
  }

  let parameters = new URLSearchParams(window.location.search);
  let id = Number(parameters.get("id"));

  let editingAuthor = null;

  if (id) {
    for (let i = 0; i < authors.length; i++) {
      if (authors[i].id === id) {
        editingAuthor = authors[i];
      }
    }
  }

  if (editingAuthor) {
    document.getElementById("authorFormTitle").textContent = "Edit Author";

    document.getElementById("authorName").value = editingAuthor.name;

    document.getElementById("authorBiography").value = editingAuthor.biography;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.getElementById("authorName").value;

    let biography = document.getElementById("authorBiography").value;

    if (editingAuthor) {
      editingAuthor.name = name;
      editingAuthor.biography = biography;
    } else {
      let newAuthor = {
        id: Date.now(),
        name: name,
        biography: biography,
      };

      authors.push(newAuthor);
    }

    saveData();

    alert("Author saved successfully!");

    window.location.href = "authors.html";
  });
}

// -------------------- GENRES --------------------

function displayGenres() {
  let tableBody = document.getElementById("genreTableBody");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  for (let i = 0; i < genres.length; i++) {
    let genre = genres[i];

    let row = document.createElement("tr");

    row.innerHTML =
      "<td>" +
      genre.name +
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
}

function deleteGenre(id) {
  let confirmDelete = confirm("Are you sure you want to delete this genre?");

  if (confirmDelete) {
    genres = genres.filter(function (genre) {
      return genre.id !== id;
    });

    saveData();
    displayGenres();
  }
}

function loadGenreForm() {
  let form = document.getElementById("genreForm");

  if (!form) {
    return;
  }

  let parameters = new URLSearchParams(window.location.search);
  let id = Number(parameters.get("id"));

  let editingGenre = null;

  if (id) {
    for (let i = 0; i < genres.length; i++) {
      if (genres[i].id === id) {
        editingGenre = genres[i];
      }
    }
  }

  if (editingGenre) {
    document.getElementById("genreFormTitle").textContent = "Edit Genre";

    document.getElementById("genreName").value = editingGenre.name;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let name = document.getElementById("genreName").value;

    if (editingGenre) {
      editingGenre.name = name;
    } else {
      let newGenre = {
        id: Date.now(),
        name: name,
      };

      genres.push(newGenre);
    }

    saveData();

    alert("Genre saved successfully!");

    window.location.href = "genres.html";
  });
}
