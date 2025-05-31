import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TimetableTable from './Timetable'; // ensure file is correctly named and in the same folder

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
        //console.log("📦 Programs API response:", res.data);
        if (!Array.isArray(res.data)) throw new Error("Invalid program list format from API");
        setPrograms(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to load program list:", err);
        alert("Failed to load program list.");
      });

    axios.get('http://localhost:5000/api/timetable-view/faculties')
      .then(res => {
        //console.log("📦 Programs API response:", res.data);
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
        console.log("📦 Programs API response:", response.data);
      } else {
        if (!selectedFaculty) return alert('Select faculty');
        response = await axios.get('http://localhost:5000/api/timetable-view/faculty-timetable', {
          params: { faculty_id: selectedFaculty }
        });
      }
      //console.log("📦 Programs API response:", res.data);
      setTimetableData(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch timetable", err);
      alert("Failed to fetch timetable.");
    }
  };

  const selectedProgramObj = programs.find(p => parseInt(p.id) === parseInt(selectedProgram));

  return (
    <div className="container mt-4">
      <h3>Timetable Viewer</h3>

      <div className="form-group">
        <label>View Mode:</label>
        <select className="form-control" value={mode} onChange={e => setMode(e.target.value)}>
          <option value="program">Program + Intake Wise</option>
          <option value="faculty">Faculty Wise</option>
        </select>
      </div>

      {mode === 'program' ? (
        <>
          <div className="form-group mt-3">
            <label>Program:</label>
            <select className="form-control" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
              <option value="">-- Select Program --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProgramObj && (
            <div className="form-group mt-2">
              <label>Intake:</label>
              <select className="form-control" value={selectedIntake} onChange={e => setSelectedIntake(e.target.value)}>
                <option value="">-- Select Intake --</option>
                {selectedProgramObj.intakeYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        <div className="form-group mt-3">
          <label>Faculty:</label>
          <select className="form-control" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
            <option value="">-- Select Faculty --</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary mt-3" onClick={fetchTimetable}>View Timetable</button>

      {timetableData.length > 0 && (
        <div className="mt-4">
          <TimetableTable data={timetableData} />
        </div>
      )}
    </div>
  );
};

export default TimetableViewer;
