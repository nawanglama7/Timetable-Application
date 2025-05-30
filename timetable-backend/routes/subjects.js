import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all programs for dropdown
router.get("/programs", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, name FROM programs ORDER BY name");
      res.json(rows);
    } catch (err) {
      console.error("Error fetching programs:", err);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });
  
// Fetch all subjects
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.program_id, s.intake, s.code, s.name, p.name AS program_name
      FROM subjects s
      JOIN programs p ON s.program_id = p.id
      ORDER BY s.intake DESC, p.name, s.code;
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Add new subject
router.post('/', async (req, res) => {
  const { program_id, intake, code, name } = req.body;
  if (!program_id || !intake || !code || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO subjects (program_id, intake, code, name) VALUES (?, ?, ?, ?)`,
      [program_id, intake, code.trim(), name.trim()]
    );
    res.json({ id: result.insertId, program_id, intake, code, name });
  } catch (error) {
    console.error('Error adding subject:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject code already exists for this program and intake' });
    }
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

// Update subject
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { program_id, intake, code, name } = req.body;
  if (!program_id || !intake || !code || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      `UPDATE subjects SET program_id = ?, intake = ?, code = ?, name = ? WHERE id = ?`,
      [program_id, intake, code.trim(), name.trim(), id]
    );
    res.json({ id, program_id, intake, code, name });
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject code already exists for this program and intake' });
    }
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM subjects WHERE id = ?`, [id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
