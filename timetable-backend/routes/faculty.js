// faculty.js (Express Router)

import express from 'express';
import db from '../db.js';

const router = express.Router();

//

// GET /api/faculty/schools
router.get('/schools', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM schools ORDER BY name');
    // rows is an array of { id, name }
    res.json(rows);
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});



//
// Get all faculty
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.id, f.keka_id, f.name, f.school_id, s.name AS school_name 
      FROM faculties f
      LEFT JOIN schools s ON f.school_id = s.id
      ORDER BY f.name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get schools for dropdown
/*router.get('/schools', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, short_form FROM schools ORDER BY name`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});*/

// Add new faculty
router.post('/', async (req, res) => {
  const { keka_id, name, school_id } = req.body;
  if (!keka_id || !name || !school_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO faculties (keka_id, name, school_id) VALUES (?, ?, ?)`,
      [keka_id, name, school_id]
    );
    res.json({ id: result.insertId, keka_id, name, school_id });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ error: 'Failed to add faculty' });
  }
});

// Update faculty by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { keka_id, name, school_id } = req.body;
  if (!keka_id || !name || !school_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await db.query(
      `UPDATE faculties SET keka_id = ?, name = ?, school_id = ? WHERE id = ?`,
      [keka_id, name, school_id, id]
    );
    res.json({ id, keka_id, name, school_id });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

// Delete faculty by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM faculties WHERE id = ?`, [id]);
    res.json({ message: 'Faculty deleted' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

export default router;
