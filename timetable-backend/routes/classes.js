import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all classes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.intake, p.name AS programName, p.id AS programId
      FROM classes c
      JOIN programs p ON c.program_id = p.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// ADD a new class
router.post('/', async (req, res) => {
  const { name, intake, program_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO classes (name, intake, program_id) VALUES (?, ?, ?)',
      [name, intake, program_id]
    );
    res.status(201).json({ message: 'Class added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add class', details: err.message });
  }
});

// UPDATE a class
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, intake, program_id } = req.body;
  try {
    await pool.query(
      'UPDATE classes SET name = ?, intake = ?, program_id = ? WHERE id = ?',
      [name, intake, program_id, id]
    );
    res.json({ message: 'Class updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// DELETE a class
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

export default router;
