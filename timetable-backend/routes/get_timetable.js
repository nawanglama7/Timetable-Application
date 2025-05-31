import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 1. Get all faculties
router.get("/faculties", async (req, res) => {
  try {
    const [faculties] = await pool.query("SELECT id, name FROM faculties;");
    res.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Get all program-intake combinations from timetable_assignments
router.get("/programs-with-intakes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT p.id AS program_id, p.name AS program_name, t.intake
      FROM timetable_assignments t
      JOIN programs p ON t.program_id = p.id
      ORDER BY p.name, t.intake DESC
    `);

    // Group by program
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.program_id]) {
        grouped[row.program_id] = {
          id: row.program_id,
          name: row.program_name,
          intakeYears: []
        };
      }
      if (!grouped[row.program_id].intakeYears.includes(row.intake)) {
        grouped[row.program_id].intakeYears.push(row.intake);
      }
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching program-intake pairs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get timetable by program and intake
router.get('/class-timetable', async (req, res) => {
  const { program_id, intake } = req.query;
  if (!program_id || !intake) return res.status(400).json({ error: 'Missing program_id or intake' });

  try {
    const [data] = await pool.query(
      `SELECT 
         ta.day, ta.slot, 
         s.name AS subject_name, 
         f.name AS faculty_name 
       FROM timetable_assignments ta
       JOIN subjects s ON ta.subject_id = s.id
       JOIN faculties f ON ta.faculty_id = f.id
       WHERE ta.program_id = ? AND ta.intake = ?
       ORDER BY ta.day, ta.slot`,
      [program_id, intake]
    );
    res.json(data);
  } catch (err) {
    console.error('Error fetching class timetable:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get timetable by faculty_id
router.get('/faculty-timetable', async (req, res) => {
  const { faculty_id } = req.query;
  if (!faculty_id) return res.status(400).json({ error: 'Missing faculty_id' });

  try {
    const [data] = await pool.query(
      `SELECT 
         ta.day, ta.slot, 
         s.name AS subject_name, 
         p.name AS program_name, 
         ta.intake 
       FROM timetable_assignments ta
       JOIN subjects s ON ta.subject_id = s.id
       JOIN programs p ON ta.program_id = p.id
       WHERE ta.faculty_id = ?
       ORDER BY ta.day, ta.slot`,
      [faculty_id]
    );
    res.json(data);
  } catch (err) {
    console.error('Error fetching faculty timetable:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
