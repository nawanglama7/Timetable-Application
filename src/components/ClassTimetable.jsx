import React, { useState, useEffect } from 'react';
import axios from 'axios';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const slots = ['1', '2', '3', '4', '5', '6', '7'];

function AssignFaculty() {
  const [programs, setPrograms] = useState([]);
  const [intakeYears, setIntakeYears] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [assignment, setAssignment] = useState({ subjectId: '', facultyId: '' });

  useEffect(() => {
    // Fetch programs
    axios.get('/api/timetableAssignments/programs-with-intakes')
      .then(res => setPrograms(res.data))
      .catch(err => console.error('Error fetching programs:', err));
  }, []);

  // Update intake years based on selected program
  useEffect(() => {
    if (selectedProgram) {
      const selected = programs.find(p => p.id === parseInt(selectedProgram));
      if (selected) {
        setIntakeYears(selected.intakeYears || []);
        setSelectedIntake('');
      }
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && selectedIntake) {
      axios.get(`/api/timetableAssignments/subjects?program_id=${selectedProgram}&intake=${selectedIntake}`)
        .then(res => setSubjects(res.data))
        .catch(err => console.error('Error fetching subjects:', err));

      axios.get('/api/faculties') // assuming faculties are not filtered by program/intake
        .then(res => setFaculties(res.data))
        .catch(err => console.error('Error fetching faculties:', err));
    }
  }, [selectedProgram, selectedIntake]);

  const handleCellClick = (day, slot) => {
    const key = `${day}-${slot}`;
    const existing = timetable[key] || { subjectId: '', facultyId: '' };
    setAssignment(existing);
    setSelectedCell({ day, slot });
    new bootstrap.Modal(document.getElementById('assignModal')).show();
  };

  const saveAssignment = () => {
    if (selectedCell) {
      const key = `${selectedCell.day}-${selectedCell.slot}`;
      setTimetable(prev => ({ ...prev, [key]: { ...assignment } }));
      setSelectedCell(null);
      bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
    }
  };

  return (
    <div className="container my-4">
      <h4 className="mb-3">Timetable Assignment</h4>

      {/* Program Selection */}
      <div className="mb-3">
        <label className="form-label">Select Program</label>
        <select className="form-select" onChange={(e) => setSelectedProgram(e.target.value)} value={selectedProgram}>
          <option value="">-- Select Program --</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Intake Year Selection */}
      {selectedProgram && (
        <div className="mb-3">
          <label className="form-label">Select Intake Year</label>
          <select className="form-select" onChange={(e) => setSelectedIntake(e.target.value)} value={selectedIntake}>
            <option value="">-- Select Intake --</option>
            {intakeYears.map(intake => (
              <option key={intake} value={intake}>{intake}</option>
            ))}
          </select>
        </div>
      )}

      {/* Timetable Grid */}
      {selectedProgram && selectedIntake && (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Day / Slot</th>
                {slots.map(s => <th key={s}>Slot {s}</th>)}
              </tr>
            </thead>
            <tbody>
              {weekdays.map(day => (
                <tr key={day}>
                  <th>{day}</th>
                  {slots.map(slot => {
                    const key = `${day}-${slot}`;
                    const cell = timetable[key];
                    const subject = subjects.find(s => s.id === cell?.subjectId)?.name || '';
                    const faculty = faculties.find(f => f.id === cell?.facultyId)?.name || '';
                    return (
                      <td
                        key={slot}
                        className="p-2 bg-light"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCellClick(day, slot)}
                      >
                        <div><strong>{subject}</strong></div>
                        <div className="text-muted small">{faculty}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" id="assignModal" tabIndex="-1" aria-labelledby="assignModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="assignModalLabel">Assign Subject & Faculty</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <p><strong>{selectedCell?.day} - Slot {selectedCell?.slot}</strong></p>
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <select className="form-select" value={assignment.subjectId} onChange={(e) => setAssignment({ ...assignment, subjectId: e.target.value })}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Faculty</label>
                <select className="form-select" value={assignment.facultyId} onChange={(e) => setAssignment({ ...assignment, facultyId: e.target.value })}>
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={saveAssignment}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignFaculty;
