const express = require("express");

const router = express.Router();

const { run, get, all } = require("../db");

router.get("/", async (req, res) => {
  try {
    const books = await all(
      `
      SELECT id, title, author, genre, stock, cover
      FROM books
      ORDER BY id DESC
      `,
    );

    res.json(books);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load books.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await get(
      `
      SELECT id, title, author, genre, stock, cover
      FROM books
      WHERE id = ?
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
    console.error(error);

    res.status(500).json({
      error: "Failed to load book.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, author, genre, stock, cover } = req.body;

    if (!title || !author || !genre || stock === undefined || stock === "") {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        error: "Stock quantity cannot be negative.",
      });
    }

    const result = await run(
      `
      INSERT INTO books
      (title, author, genre, stock, cover)
      VALUES (?, ?, ?, ?, ?)
      `,
      [title.trim(), author, genre, Number(stock), cover || ""],
    );

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      title: title.trim(),
      author: author,
      genre: genre,
      stock: Number(stock),
      cover: cover || "",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create book.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, author, genre, stock, cover } = req.body;

    if (!title || !author || !genre || stock === undefined || stock === "") {
      return res.status(400).json({
        error: "Please fill in all required fields.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        error: "Stock quantity cannot be negative.",
      });
    }

    const existing = await get("SELECT id FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    await run(
      `
      UPDATE books
      SET title = ?,
          author = ?,
          genre = ?,
          stock = ?,
          cover = ?
      WHERE id = ?
      `,
      [title.trim(), author, genre, Number(stock), cover || "", req.params.id],
    );

    res.json({
      id: Number(req.params.id),
      title: title.trim(),
      author: author,
      genre: genre,
      stock: Number(stock),
      cover: cover || "",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update book.",
    });
  }
});

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
    console.error(error);

    res.status(500).json({
      error: "Failed to delete book.",
    });
  }
});

module.exports = router;
