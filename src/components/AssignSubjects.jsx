import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignSubjects = () => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Filters
  const [programFilter, setProgramFilter] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("");

  // Unique Programs and Intake Years for filters
  const [programs, setPrograms] = useState([]);
  const [intakes, setIntakes] = useState([]);

  // Fetch faculties on mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/facultySubjects/faculties/all")
      .then(res => setFaculties(res.data))
      .catch(err => console.error("Error fetching faculties:", err));
  }, []);

  // Fetch all subjects on mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/facultySubjects")
      .then(res => {
        setSubjects(res.data);

        // Extract unique programs & intake years
        const uniquePrograms = [];
        const uniqueIntakes = [];
        res.data.forEach(subj => {
          if (!uniquePrograms.find(p => p.id === subj.program_id)) {
            uniquePrograms.push({ id: subj.program_id, name: subj.program_name });
          }
          if (!uniqueIntakes.includes(subj.intake)) {
            uniqueIntakes.push(subj.intake);
          }
        });
        setPrograms(uniquePrograms);
        setIntakes(uniqueIntakes.sort());
      })
      .catch(err => console.error("Error fetching subjects:", err));
  }, []);

  // Fetch assigned subjects when faculty changes
  useEffect(() => {
    if (!selectedFaculty) {
      setAssignedSubjects([]);
      setSelectedSubjects([]);
      return;
    }

    axios.get(`http://localhost:5000/api/facultySubjects/${selectedFaculty}`)
      .then(res => {
        setAssignedSubjects(res.data);
        setSelectedSubjects(res.data.map(s => s.id));
      })
      .catch(err => console.error("Error fetching assigned subjects:", err));
  }, [selectedFaculty]);

  // Toggle subject checkbox
  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prevSelected => {
      if (prevSelected.includes(subjectId)) {
        return prevSelected.filter(id => id !== subjectId);
      } else {
        return [...prevSelected, subjectId];
      }
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) {
      alert("Please select a faculty.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/facultySubjects", {
        faculty_id: selectedFaculty,
        subject_ids: selectedSubjects,
      });
      alert("Subjects assigned successfully.");
      // Refresh assigned subjects:
      const res = await axios.get(`http://localhost:5000/api/facultySubjects/${selectedFaculty}`);
      setAssignedSubjects(res.data);
      setSelectedSubjects(res.data.map(s => s.id));
    } catch (err) {
      console.error("Error assigning subjects:", err);
      alert("Failed to assign subjects.");
    }
  };

  // Filter subjects by selected filters
  const filteredSubjects = subjects.filter(subj => {
    const programMatch = programFilter ? subj.program_id.toString() === programFilter : true;
    const intakeMatch = intakeFilter ? subj.intake.toString() === intakeFilter : true;
    return programMatch && intakeMatch;
  });

  return (
    <div className="container mt-4">
      <h3>Assign Subjects to Faculty</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="facultySelect" className="form-label">Select Faculty</label>
          <select
            id="facultySelect"
            className="form-select"
            value={selectedFaculty}
            onChange={e => setSelectedFaculty(e.target.value)}
            required
          >
            <option value="">-- Select Faculty --</option>
            {faculties.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.keka_id})
              </option>
            ))}
          </select>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="programFilter" className="form-label">Filter by Program</label>
            <select
              id="programFilter"
              className="form-select"
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
            >
              <option value="">-- All Programs --</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.id}>{prog.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="intakeFilter" className="form-label">Filter by Intake Year</label>
            <select
              id="intakeFilter"
              className="form-select"
              value={intakeFilter}
              onChange={e => setIntakeFilter(e.target.value)}
            >
              <option value="">-- All Intake Years --</option>
              {intakes.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          <table className="table table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: '5%' }}>Select</th>
                <th scope="col">Subject Name</th>
                <th scope="col">Code</th>
                <th scope="col">Program</th>
                <th scope="col">Intake</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr><td colSpan="5" className="text-center">No subjects found.</td></tr>
              ) : (
                filteredSubjects.map(subject => (
                  <tr key={subject.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                      />
                    </td>
                    <td>{subject.name}</td>
                    <td>{subject.code}</td>
                    <td>{subject.program_name}</td>
                    <td>{subject.intake}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Save Changes</button>
      </form>
    </div>
  );
};

export default AssignSubjects;
