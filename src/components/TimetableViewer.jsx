import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TimetableTable from './Timetable'; // Ensure the filename is correct

const TimetableViewer = () => {
  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [timetableData, setTimetableData] = useState([]);
  const [mode, setMode] = useState('program');

  useEffect(() => {
    axios.get('http://localhost:5000/api/timetable-view/programs-with-intakes')
      .then(res => {
        if (!Array.isArray(res.data)) throw new Error("Invalid program list format from API");
        setPrograms(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to load program list:", err);
        alert("Failed to load program list.");
      });

    axios.get('http://localhost:5000/api/timetable-view/faculties')
      .then(res => {
        if (!Array.isArray(res.data)) throw new Error("Invalid faculty list format");
        setFaculties(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to load faculties:", err);
        alert("Failed to load faculty list.");
      });
  }, []);

  const fetchTimetable = async () => {
    try {
      let response;
      if (mode === 'program') {
        if (!selectedProgram || !selectedIntake) return alert('Select program and intake');
        response = await axios.get('http://localhost:5000/api/timetable-view/class-timetable', {
          params: { program_id: selectedProgram, intake: selectedIntake }
        });
      } else {
        if (!selectedFaculty) return alert('Select faculty');
        response = await axios.get('http://localhost:5000/api/timetable-view/faculty-timetable', {
          params: { faculty_id: selectedFaculty }
        });
      }
      setTimetableData(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch timetable", err);
      alert("Failed to fetch timetable.");
    }
  };

  const selectedProgramObj = programs.find(p => parseInt(p.id) === parseInt(selectedProgram));

  return (
    <div className="container mt-4">
      <h3>📅 Timetable Viewer</h3>

      <div className="row mt-4">
        <div className="col-md-3">
          <label>View Mode</label>
          <select className="form-control" value={mode} onChange={e => setMode(e.target.value)}>
            <option value="program">Program + Intake</option>
            <option value="faculty">Faculty Wise</option>
          </select>
        </div>

        {mode === 'program' && (
          <>
            <div className="col-md-3">
              <label>Program</label>
              <select className="form-control" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
                <option value="">-- Select Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label>Intake</label>
              <select className="form-control" value={selectedIntake} onChange={e => setSelectedIntake(e.target.value)} disabled={!selectedProgramObj}>
                <option value="">-- Select Intake --</option>
                {selectedProgramObj?.intakeYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {mode === 'faculty' && (
          <div className="col-md-3">
            <label>Faculty</label>
            <select className="form-control" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
              <option value="">-- Select Faculty --</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={fetchTimetable}>
            View Timetable
          </button>
        </div>
      </div>

      {timetableData.length > 0 && (
        <div className="mt-5">
          <TimetableTable data={timetableData} />
        </div>
      )}
    </div>
  );
};

export default TimetableViewer;
