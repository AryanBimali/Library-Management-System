require("dotenv").config();

const express = require("express");
const path = require("path");

const { databaseReady } = require("./db");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/authors", require("./routes/authors"));
app.use("/api/genres", require("./routes/genres"));
app.use("/api/members", require("./routes/members"));

// =====================================================
// TEST API
// =====================================================

app.get("/api", async (req, res) => {
  try {
    await databaseReady;

    res.json({
      message: "Library Management System API is running.",
      database: "connected",
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// =====================================================
// FRONTEND
// =====================================================

const frontendPath = path.join(__dirname, "../frontend");

// =====================================================
// DEFAULT PAGE - LOGIN
// =====================================================

// When user visits:
// https://your-project.vercel.app/
//
// show login.html first.

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// =====================================================
// STATIC FRONTEND FILES
// =====================================================

app.use(express.static(frontendPath));

// =====================================================
// 404 API HANDLER
// =====================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found.",
  });
});

// =====================================================
// EXPORT APP FOR VERCEL
// =====================================================

module.exports = app;
