const express = require("express");

const router = express.Router();

const { run, get, all } = require("../db");

router.get("/", async (req, res) => {
  try {
    const genres = await all(
      `
      SELECT id, name
      FROM genres
      ORDER BY id DESC
      `,
    );

    res.json(genres);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load genres.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const genre = await get("SELECT id, name FROM genres WHERE id = ?", [
      req.params.id,
    ]);

    if (!genre) {
      return res.status(404).json({
        error: "Genre not found.",
      });
    }

    res.json(genre);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load genre.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Genre name is required.",
      });
    }

    const existing = await get("SELECT id FROM genres WHERE name = ?", [
      name.trim(),
    ]);

    if (existing) {
      return res.status(409).json({
        error: "Genre already exists.",
      });
    }

    const result = await run("INSERT INTO genres (name) VALUES (?)", [
      name.trim(),
    ]);

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name: name.trim(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create genre.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Genre name is required.",
      });
    }

    const existing = await get("SELECT id FROM genres WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Genre not found.",
      });
    }

    await run("UPDATE genres SET name = ? WHERE id = ?", [
      name.trim(),
      req.params.id,
    ]);

    res.json({
      id: Number(req.params.id),
      name: name.trim(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update genre.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM genres WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Genre not found.",
      });
    }

    await run("DELETE FROM genres WHERE id = ?", [req.params.id]);

    res.json({
      message: "Genre deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete genre.",
    });
  }
});

module.exports = router;
