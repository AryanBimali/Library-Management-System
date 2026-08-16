require("dotenv").config();

const { createClient } = require("@libsql/client");

// =====================================================
// TURSO DATABASE CONNECTION
// =====================================================

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// =====================================================
// DATABASE HELPER FUNCTIONS
// =====================================================

async function run(sql, args = []) {
  return await db.execute({
    sql: sql,
    args: args,
  });
}

async function get(sql, args = []) {
  const result = await db.execute({
    sql: sql,
    args: args,
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function all(sql, args = []) {
  const result = await db.execute({
    sql: sql,
    args: args,
  });

  return result.rows;
}

// =====================================================
// INITIALIZE DATABASE
// =====================================================

async function initializeDatabase() {
  try {
    // -------------------------------------------------
    // Enable foreign keys
    // -------------------------------------------------

    await run("PRAGMA foreign_keys = ON");

    // -------------------------------------------------
    // USERS TABLE
    // -------------------------------------------------

    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin'
      )
    `);

    // -------------------------------------------------
    // AUTHORS TABLE
    // -------------------------------------------------

    await run(`
      CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        biography TEXT DEFAULT ''
      )
    `);

    // -------------------------------------------------
    // GENRES TABLE
    // -------------------------------------------------

    await run(`
      CREATE TABLE IF NOT EXISTS genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // -------------------------------------------------
    // BOOKS TABLE
    // -------------------------------------------------

    await run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        title TEXT NOT NULL,

        author_id INTEGER NOT NULL,

        genre_id INTEGER NOT NULL,

        stock INTEGER NOT NULL DEFAULT 0,

        cover TEXT DEFAULT '',

        FOREIGN KEY (author_id)
          REFERENCES authors(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT,

        FOREIGN KEY (genre_id)
          REFERENCES genres(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      )
    `);

    // -------------------------------------------------
    // MEMBERS TABLE
    // -------------------------------------------------

    await run(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,

        name TEXT NOT NULL,

        email TEXT NOT NULL,

        phone TEXT NOT NULL,

        date TEXT NOT NULL
      )
    `);

    // -------------------------------------------------
    // DATABASE READY
    // -------------------------------------------------

    console.log("Database tables are ready.");
  } catch (error) {
    console.error("Database initialization failed:");
    console.error(error);

    throw error;
  }
}

// =====================================================
// START DATABASE INITIALIZATION
// =====================================================

const databaseReady = initializeDatabase();

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  db,
  run,
  get,
  all,
  databaseReady,
};
