import React, { useState, useEffect } from 'react';

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const slots = [1, 2, 3, 4, 5, 6, 7];

// Example mock data (replace with your actual data or props)
const classes = [
  { id: "class1", name: "Class 1" },
  { id: "class2", name: "Class 2" }
];
const faculties = [
  { id: "fac1", name: "Dr. Smith" },
  { id: "fac2", name: "Prof. Johnson" }
];
const subjects = [
  { id: "sub1", name: "Math" },
  { id: "sub2", name: "Physics" }
];

// Example class timetable data structure (replace or receive as prop)
const classTimetable = {
  class1: {
    "Monday-1": { subjectId: "sub1", facultyId: "fac1" },
    "Tuesday-3": { subjectId: "sub2", facultyId: "fac2" }
  },
  class2: {
    "Monday-1": { subjectId: "sub2", facultyId: "fac1" },
    "Wednesday-5": { subjectId: "sub1", facultyId: "fac2" }
  }
};

const FacultyTimetable = () => {
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [facultyTimetable, setFacultyTimetable] = useState({});

  // Generate faculty timetable by inverting classTimetable
  const generateFacultyTimetable = () => {
    const fTimetable = {};
    Object.entries(classTimetable).forEach(([classId, slots]) => {
      Object.entries(slots).forEach(([key, assignment]) => {
        if (assignment && assignment.facultyId) {
          const { facultyId, subjectId } = assignment;
          if (!fTimetable[facultyId]) {
            fTimetable[facultyId] = {};
          }
          fTimetable[facultyId][key] = { classId, subjectId };
        }
      });
    });
    setFacultyTimetable(fTimetable);
  };

  useEffect(() => {
    generateFacultyTimetable();
  }, []);

  return (
    <div className="container my-4">
      <h3 className="mb-4">Faculty Timetable</h3>

      <div className="mb-3">
        <label htmlFor="facultySelect" className="form-label">Select Faculty</label>
        <select
          id="facultySelect"
          className="form-select"
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          <option value="">-- Select Faculty --</option>
          {faculties.map(faculty => (
            <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
          ))}
        </select>
      </div>

      {selectedFaculty && (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Day / Slot</th>
                {slots.map(slot => (
                  <th key={slot}>Slot {slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekdays.map(day => (
                <tr key={day}>
                  <th>{day}</th>
                  {slots.map(slot => {
                    const key = `${day}-${slot}`;
                    const cell = facultyTimetable[selectedFaculty]?.[key];
                    const className = classes.find(c => c.id === cell?.classId)?.name || '';
                    const subjectName = subjects.find(s => s.id === cell?.subjectId)?.name || '';

                    return (
                      <td key={slot} style={{ minWidth: '120px' }}>
                        {className ? (
                          <>
                            <div><strong>{className}</strong></div>
                            <div className="text-muted small">{subjectName}</div>
                          </>
                        ) : (
                          <div className="text-muted">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyTimetable;
