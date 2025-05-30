import express from 'express';
import cors from 'cors';
import schoolRoutes from './routes/school.js';
import programsRouter from './routes/programs.js';
import classesRouter from './routes/classes.js';
import subjectRoutes from './routes/subjects.js';
import facultyRoutes from './routes/faculty.js';
import facultySubjectsRoutes from './routes/fs.js';
import timetableAssignmentsRoutes from './routes/ttAssignments.js';



const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/schools', schoolRoutes);
app.use('/api/programs', programsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/subjects', subjectRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/facultySubjects', facultySubjectsRoutes);
app.use('/api/timetableAssignments', timetableAssignmentsRoutes);

app.get('/', (req, res) => {
  res.send('Timetable Management Backend Running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
