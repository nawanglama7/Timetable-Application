import express from 'express';
import db from '../db.js'; // adjust path accordingly

const router = express.Router();

// POST: Assign subjects to a faculty
router.post('/', async (req, res) => {
  const { faculty_id, subject_ids } = req.body;

  if (!faculty_id || !Array.isArray(subject_ids)) {
    return res.status(400).json({ error: 'faculty_id and subject_ids array required' });
  }

  try {
    // Remove existing assignments
    await db.query('DELETE FROM faculty_subjects WHERE faculty_id = ?', [faculty_id]);

    // Insert new assignments
    const insertValues = subject_ids.map(subject_id => [faculty_id, subject_id]);
    if (insertValues.length > 0) {
      await db.query('INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ?', [insertValues]);
    }

    res.status(200).json({ message: 'Subjects assigned successfully' });
  } catch (err) {
    console.error('Error assigning subjects:', err);
    res.status(500).json({ error: 'Database error during assignment' });
  }
});

// GET: Get subjects assigned to a faculty with program and intake (year)
router.get('/:facultyId', async (req, res) => {
  const { facultyId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
         s.id, s.name, s.code,
         p.name AS program_name, 
         s.intake
       FROM faculty_subjects fs
       JOIN subjects s ON fs.subject_id = s.id
       JOIN programs p ON s.program_id = p.id
       WHERE fs.faculty_id = ?`,
      [facultyId]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error fetching assigned subjects:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET: Get all subjects with program and intake (for assignment form)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         s.id, s.name, s.code,
         s.program_id, p.name AS program_name,
         s.intake
       FROM subjects s
       JOIN programs p ON s.program_id = p.id`
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET: Get all faculties (for selection)
router.get('/faculties/all', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, keka_id, name FROM faculties`);
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

export default router;
