import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all schools
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM schools");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schools:", err);
    res.status(500).json({ message: "Failed to fetch schools" });
  }
});

// Add a new school
router.post('/', async (req, res) => {
  const { name, short_form } = req.body;

  if (!name || !short_form) {
    return res.status(400).json({ message: "Name and short form are required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO schools (name, short_form) VALUES (?, ?)",
      [name, short_form]
    );
    res.status(201).json({ id: result.insertId, name, short_form });
  } catch (err) {
    console.error("Error inserting school:", err);
    res.status(500).json({ message: "Failed to add school" });
  }
});
// Update a school
router.put('/:id', async (req, res) => {
  const { name, short_form } = req.body;
  const { id } = req.params;

  try {
    await pool.execute(
      "UPDATE schools SET name = ?, short_form = ? WHERE id = ?",
      [name, short_form, id]
    );
    res.json({ message: "School updated successfully" });
  } catch (err) {
    console.error("Error updating school:", err);
    res.status(500).json({ message: "Failed to update school" });
  }
});

// Delete a school
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute("DELETE FROM schools WHERE id = ?", [id]);
    res.json({ message: "School deleted successfully" });
  } catch (err) {
    console.error("Error deleting school:", err);
    res.status(500).json({ message: "Failed to delete school" });
  }
});

export default router;
