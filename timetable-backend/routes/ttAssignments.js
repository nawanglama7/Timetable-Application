// backend/routes/ttAssignments.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 1. Get programs with intake years
router.get('/programs-with-intakes', async (req, res) => {
  try {
    const [programs] = await pool.query('SELECT id, name FROM programs');
    const result = [];
    for (const program of programs) {
      const [intakes] = await pool.query(
        'SELECT DISTINCT intake FROM subjects WHERE program_id = ? ORDER BY intake DESC',
        [program.id]
      );
      const intakeYears = intakes.map(row => row.intake);
      result.push({ id: program.id, name: program.name, intakeYears });
    }
    res.json(result);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get subjects by program and intake
router.get('/subjects', async (req, res) => {
  const { program_id, intake } = req.query;
  if (!program_id || !intake) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const [subjects] = await pool.query(
      'SELECT id, code, name FROM subjects WHERE program_id = ? AND intake = ?',
      [program_id, intake]
    );
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Get all faculties
router.get('/faculties/by-subject/:subject_id', async (req, res) => {
  const { subject_id } = req.params;
  try {
    const [faculties] = await pool.query(
      `SELECT f.id, f.name 
       FROM faculties f
       JOIN faculty_subjects fs ON f.id = fs.faculty_id
       WHERE fs.subject_id = ? 
       ORDER BY f.name`,
      [subject_id]
    );
    res.json(faculties);
  } catch (err) {
    console.error('Error fetching faculties by subject:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Get timetable assignments for program and intake
router.get('/timetable', async (req, res) => {
  const { program_id, intake } = req.query;
  if (!program_id || !intake) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const [assignments] = await pool.query(
      'SELECT day, slot, subject_id, faculty_id FROM timetable_assignments WHERE program_id = ? AND intake = ?',
      [program_id, intake]
    );
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/timetableAssignments/faculty-by-subjects
router.post('/faculty-by-subjects', async (req, res) => {
  const { subject_ids } = req.body;
  if (!Array.isArray(subject_ids) || subject_ids.length === 0)
    return res.status(400).json({ error: 'Missing subject_ids' });

  try {
    const [rows] = await pool.query(
      `SELECT fs.subject_id, f.id, f.name
       FROM faculty_subjects fs
       JOIN faculties f ON f.id = fs.faculty_id
       WHERE fs.subject_id IN (?)`,
      [subject_ids]
    );

    const result = {};
    rows.forEach(({ subject_id, id, name }) => {
      if (!result[subject_id]) result[subject_id] = [];
      result[subject_id].push({ id, name });
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching faculty by subject:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Save timetable assignments (overwrite existing)
router.post('/timetable', async (req, res) => {
  const { program_id, intake, timetable } = req.body;
  if (!program_id || !intake || !timetable) return res.status(400).json({ error: 'Missing data' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM timetable_assignments WHERE program_id = ? AND intake = ?',
      [program_id, intake]
    );

    const entries = [];
    for (const key in timetable) {
      const [day, slot] = key.split('-');
      const { subjectId, facultyId } = timetable[key];
      if (subjectId && facultyId) {
        entries.push([program_id, intake, subjectId, facultyId, day, slot]);
      }
    }

    if (entries.length > 0) {
      await connection.query(
        `INSERT INTO timetable_assignments 
        (program_id, intake, subject_id, faculty_id, day, slot) 
        VALUES ?`,
        [entries]
      );
    }

    await connection.commit();
    res.json({ message: 'Timetable saved successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error saving timetable:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

export default router;
