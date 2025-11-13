// routes/coins.js
import express from "express";
import pool from "../db.js";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM coins ORDER BY price DESC LIMIT 10"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// DYNAMIC HISTORY ENDPOINT
// ===============================
router.get("/:coin_id/history", async (req, res) => {
  const { coin_id } = req.params;
  const { days, start, end } = req.query;

  try {
    let result;

    // CASE 1: DAYS → 7, 30, 90, 120, etc.
    if (days) {
      result = await pool.query(
        `SELECT price, recorded_date
         FROM history
         WHERE coin_id=$1 AND recorded_date >= NOW() - INTERVAL '${days} days'
         ORDER BY recorded_date ASC`,
        [coin_id]
      );
      return res.json(result.rows);
    }

    // CASE 2: DATE RANGE → start=2024-01-01 & end=2024-01-15
    if (start && end) {
      result = await pool.query(
        `SELECT price, recorded_date
         FROM history
         WHERE coin_id=$1 AND recorded_date BETWEEN $2 AND $3
         ORDER BY recorded_date ASC`,
        [coin_id, start, end]
      );
      return res.json(result.rows);
    }

    // DEFAULT: last 30 days
    result = await pool.query(
      `SELECT price, recorded_date
       FROM history
       WHERE coin_id=$1 AND recorded_date >= NOW() - INTERVAL '30 days'
       ORDER BY recorded_date ASC`,
      [coin_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
