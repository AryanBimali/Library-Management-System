const express = require("express");

const router = express.Router();

const { run, get, all } = require("../db");

router.get("/", async (req, res) => {
  try {
    const authors = await all(
      `
      SELECT id, name, biography
      FROM authors
      ORDER BY id DESC
      `,
    );

    res.json(authors);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load authors.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const author = await get(
      `
      SELECT id, name, biography
      FROM authors
      WHERE id = ?
      `,
      [req.params.id],
    );

    if (!author) {
      return res.status(404).json({
        error: "Author not found.",
      });
    }

    res.json(author);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load author.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, biography } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Author name is required.",
      });
    }

    const result = await run(
      `
      INSERT INTO authors (name, biography)
      VALUES (?, ?)
      `,
      [name.trim(), biography ? biography.trim() : ""],
    );

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      biography: biography ? biography.trim() : "",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create author.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, biography } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Author name is required.",
      });
    }

    const existing = await get("SELECT id FROM authors WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Author not found.",
      });
    }

    await run(
      `
      UPDATE authors
      SET name = ?, biography = ?
      WHERE id = ?
      `,
      [name.trim(), biography ? biography.trim() : "", req.params.id],
    );

    res.json({
      id: Number(req.params.id),
      name: name.trim(),
      biography: biography ? biography.trim() : "",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update author.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM authors WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Author not found.",
      });
    }

    await run("DELETE FROM authors WHERE id = ?", [req.params.id]);

    res.json({
      message: "Author deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete author.",
    });
  }
});

module.exports = router;
