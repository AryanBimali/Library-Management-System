const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const { run, get } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// SIGN UP
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name || !username || !password) {
      return res.status(400).json({
        error: "Please fill in all fields.",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters.",
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        error: "Username must be at least 3 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
      });
    }

    // -----------------------------
    // Check existing username
    // -----------------------------

    const existingUser = await get("SELECT id FROM users WHERE username = ?", [
      username.trim(),
    ]);

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists.",
      });
    }

    // -----------------------------
    // Hash password
    // -----------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // Insert user
    // -----------------------------

    const result = await run(
      `
      INSERT INTO users
      (name, username, password_hash, role)
      VALUES (?, ?, ?, ?)
      `,
      [name.trim(), username.trim(), hashedPassword, "admin"],
    );

    // -----------------------------
    // Response
    // -----------------------------

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: Number(result.lastInsertRowid),
        name: name.trim(),
        username: username.trim(),
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle duplicate username
    if (error.message && error.message.toLowerCase().includes("unique")) {
      return res.status(409).json({
        error: "Username already exists.",
      });
    }

    res.status(500).json({
      error: "Server error while creating account.",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!username || !password) {
      return res.status(400).json({
        error: "Please enter username and password.",
      });
    }

    // -----------------------------
    // Find user
    // -----------------------------

    const user = await get(
      `
      SELECT
        id,
        name,
        username,
        password_hash,
        role
      FROM users
      WHERE username = ?
      `,
      [username.trim()],
    );

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    // -----------------------------
    // Compare password
    // -----------------------------

    const passwordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!passwordCorrect) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    // -----------------------------
    // Create JWT
    // -----------------------------

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        error: "Server authentication configuration is missing.",
      });
    }

    const token = jwt.sign(
      {
        id: Number(user.id),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    // -----------------------------
    // Response
    // -----------------------------

    res.json({
      message: "Login successful.",

      token: token,

      user: {
        id: Number(user.id),
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Server error while logging in.",
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
