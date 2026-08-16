const express = require("express");

const router = express.Router();

const { run, get, all } = require("../db");

// =====================================================
// GET ALL BOOKS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const books = await all(`
      SELECT
        books.id,
        books.title,
        books.author_id,
        authors.name AS author,
        books.genre_id,
        genres.name AS genre,
        books.stock,
        books.cover
      FROM books
      INNER JOIN authors
        ON books.author_id = authors.id
      INNER JOIN genres
        ON books.genre_id = genres.id
      ORDER BY books.id DESC
    `);

    res.json(books);
  } catch (error) {
    console.error("Failed to load books:", error);

    res.status(500).json({
      error: "Failed to load books.",
    });
  }
});

// =====================================================
// GET SINGLE BOOK
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const book = await get(
      `
      SELECT
        books.id,
        books.title,
        books.author_id,
        authors.name AS author,
        books.genre_id,
        genres.name AS genre,
        books.stock,
        books.cover
      FROM books
      INNER JOIN authors
        ON books.author_id = authors.id
      INNER JOIN genres
        ON books.genre_id = genres.id
      WHERE books.id = ?
      `,
      [req.params.id],
    );

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    res.json(book);
  } catch (error) {
    console.error("Failed to load book:", error);

    res.status(500).json({
      error: "Failed to load book.",
    });
  }
});

// =====================================================
// CREATE BOOK
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { title, author_id, genre_id, stock, cover } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !title ||
      author_id === undefined ||
      author_id === "" ||
      genre_id === undefined ||
      genre_id === "" ||
      stock === undefined ||
      stock === ""
    ) {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    // -------------------------------------------------
    // Validate stock
    // -------------------------------------------------

    const stockNumber = Number(stock);

    if (Number.isNaN(stockNumber)) {
      return res.status(400).json({
        error: "Stock must be a valid number.",
      });
    }

    if (stockNumber < 0) {
      return res.status(400).json({
        error: "Stock quantity cannot be negative.",
      });
    }

    // -------------------------------------------------
    // Check author exists
    // -------------------------------------------------

    const author = await get("SELECT id, name FROM authors WHERE id = ?", [
      author_id,
    ]);

    if (!author) {
      return res.status(400).json({
        error: "Selected author does not exist.",
      });
    }

    // -------------------------------------------------
    // Check genre exists
    // -------------------------------------------------

    const genre = await get("SELECT id, name FROM genres WHERE id = ?", [
      genre_id,
    ]);

    if (!genre) {
      return res.status(400).json({
        error: "Selected genre does not exist.",
      });
    }

    // -------------------------------------------------
    // Insert book
    // -------------------------------------------------

    const result = await run(
      `
      INSERT INTO books
      (
        title,
        author_id,
        genre_id,
        stock,
        cover
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        Number(author_id),
        Number(genre_id),
        stockNumber,
        cover || "",
      ],
    );

    // -------------------------------------------------
    // Get newly created book
    // -------------------------------------------------

    const newBook = await get(
      `
      SELECT
        books.id,
        books.title,
        books.author_id,
        authors.name AS author,
        books.genre_id,
        genres.name AS genre,
        books.stock,
        books.cover
      FROM books
      INNER JOIN authors
        ON books.author_id = authors.id
      INNER JOIN genres
        ON books.genre_id = genres.id
      WHERE books.id = ?
      `,
      [result.lastInsertRowid],
    );

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Failed to create book:", error);

    res.status(500).json({
      error: "Failed to create book.",
      details: error.message,
    });
  }
});

// =====================================================
// UPDATE BOOK
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const { title, author_id, genre_id, stock, cover } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !title ||
      author_id === undefined ||
      author_id === "" ||
      genre_id === undefined ||
      genre_id === "" ||
      stock === undefined ||
      stock === ""
    ) {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    // -------------------------------------------------
    // Validate stock
    // -------------------------------------------------

    const stockNumber = Number(stock);

    if (Number.isNaN(stockNumber)) {
      return res.status(400).json({
        error: "Stock must be a valid number.",
      });
    }

    if (stockNumber < 0) {
      return res.status(400).json({
        error: "Stock quantity cannot be negative.",
      });
    }

    // -------------------------------------------------
    // Check book exists
    // -------------------------------------------------

    const existing = await get("SELECT id FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    // -------------------------------------------------
    // Check author exists
    // -------------------------------------------------

    const author = await get("SELECT id FROM authors WHERE id = ?", [
      author_id,
    ]);

    if (!author) {
      return res.status(400).json({
        error: "Selected author does not exist.",
      });
    }

    // -------------------------------------------------
    // Check genre exists
    // -------------------------------------------------

    const genre = await get("SELECT id FROM genres WHERE id = ?", [genre_id]);

    if (!genre) {
      return res.status(400).json({
        error: "Selected genre does not exist.",
      });
    }

    // -------------------------------------------------
    // Update book
    // -------------------------------------------------

    await run(
      `
      UPDATE books
      SET
        title = ?,
        author_id = ?,
        genre_id = ?,
        stock = ?,
        cover = ?
      WHERE id = ?
      `,
      [
        title.trim(),
        Number(author_id),
        Number(genre_id),
        stockNumber,
        cover || "",
        req.params.id,
      ],
    );

    // -------------------------------------------------
    // Return updated book
    // -------------------------------------------------

    const updatedBook = await get(
      `
      SELECT
        books.id,
        books.title,
        books.author_id,
        authors.name AS author,
        books.genre_id,
        genres.name AS genre,
        books.stock,
        books.cover
      FROM books
      INNER JOIN authors
        ON books.author_id = authors.id
      INNER JOIN genres
        ON books.genre_id = genres.id
      WHERE books.id = ?
      `,
      [req.params.id],
    );

    res.json(updatedBook);
  } catch (error) {
    console.error("Failed to update book:", error);

    res.status(500).json({
      error: "Failed to update book.",
      details: error.message,
    });
  }
});

// =====================================================
// DELETE BOOK
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    await run("DELETE FROM books WHERE id = ?", [req.params.id]);

    res.json({
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete book:", error);

    res.status(500).json({
      error: "Failed to delete book.",
      details: error.message,
    });
  }
});

module.exports = router;
