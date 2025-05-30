import express from 'express';
import pool from '../db.js';

const router = express.Router();


// Get all programs with school info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.school_id, s.name AS school_name 
      FROM programs p 
      JOIN schools s ON p.school_id = s.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
});
router.get('/forclass', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, school_id FROM programs ORDER BY name');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching programs:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.school_id, s.name AS school_name 
      FROM programs p 
      JOIN schools s ON p.school_id = s.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
});
// Add new program
router.post('/', async (req, res) => {
  const { name, school_id } = req.body;
  try {
    await pool.execute('INSERT INTO programs (name, school_id) VALUES (?, ?)', [name, school_id]);
    res.json({ message: 'Program added successfully' });
  } catch (err) {
    console.error('Error adding program:', err);
    res.status(500).json({ message: 'Failed to add program' });
  }
});

// Update program
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, school_id } = req.body;
  try {
    await pool.execute('UPDATE programs SET name = ?, school_id = ? WHERE id = ?', [name, school_id, id]);
    res.json({ message: 'Program updated successfully' });
  } catch (err) {
    console.error('Error updating program:', err);
    res.status(500).json({ message: 'Failed to update program' });
  }
});

// Delete program
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM programs WHERE id = ?', [id]);
    res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    console.error('Error deleting program:', err);
    res.status(500).json({ message: 'Failed to delete program' });
  }
});

export default router;
