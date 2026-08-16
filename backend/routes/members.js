const express = require("express");

const router = express.Router();

const { run, get, all } = require("../db");

function createMemberId(lastId) {
  if (!lastId) {
    return "M001";
  }

  const number = Number(lastId.substring(1)) + 1;

  return "M" + String(number).padStart(3, "0");
}

router.get("/", async (req, res) => {
  try {
    const members = await all(
      `
      SELECT id, name, email, phone, date
      FROM members
      ORDER BY id
      `,
    );

    res.json(members);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load members.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const member = await get(
      `
      SELECT id, name, email, phone, date
      FROM members
      WHERE id = ?
      `,
      [req.params.id],
    );

    if (!member) {
      return res.status(404).json({
        error: "Member not found.",
      });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load member.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, date } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Name, email and phone are required.",
      });
    }

    const lastMember = await get(
      `
      SELECT id
      FROM members
      ORDER BY id DESC
      LIMIT 1
      `,
    );

    const id = createMemberId(lastMember ? lastMember.id : null);

    const membershipDate = date || new Date().toISOString().split("T")[0];

    await run(
      `
      INSERT INTO members
      (id, name, email, phone, date)
      VALUES (?, ?, ?, ?, ?)
      `,
      [id, name.trim(), email.trim(), phone.trim(), membershipDate],
    );

    res.status(201).json({
      id: id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date: membershipDate,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create member.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Name, email and phone are required.",
      });
    }

    const existing = await get("SELECT id, date FROM members WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Member not found.",
      });
    }

    await run(
      `
      UPDATE members
      SET name = ?,
          email = ?,
          phone = ?
      WHERE id = ?
      `,
      [name.trim(), email.trim(), phone.trim(), req.params.id],
    );

    res.json({
      id: req.params.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date: existing.date,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update member.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM members WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        error: "Member not found.",
      });
    }

    await run("DELETE FROM members WHERE id = ?", [req.params.id]);

    res.json({
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete member.",
    });
  }
});

module.exports = router;
