import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignFaculty = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedIntakeYear, setSelectedIntakeYear] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [facultyMap, setFacultyMap] = useState({});
  const [assignments, setAssignments] = useState({});

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = ["9-10", "10-11", "11-12", "1-2", "2-3", "3-4"];

  // Fetch programs with intake years on load
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/timetableAssignments/programs-with-intakes")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Failed to fetch programs", err));
  }, []);

  // Get intake years for selected program
  const getIntakeYears = (programId) => {
    const program = programs.find((p) => p.id === parseInt(programId));
    return program ? program.intakeYears : [];
  };

  // Fetch subjects and faculty map when program & intake are selected
  useEffect(() => {
    if (selectedProgramId && selectedIntakeYear) {
      axios
        .get("http://localhost:5000/api/timetableAssignments/subjects", {
          params: {
            program_id: selectedProgramId,
            intake: selectedIntakeYear,
          },
        })
        .then((res) => {
          setSubjects(res.data);
          const subjectIds = res.data.map((s) => s.id);
          return axios.post("http://localhost:5000/api/timetableAssignments/faculty-by-subjects", {
            subject_ids: subjectIds,
          });
        })
        .then((res) => {
          setFacultyMap(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch subjects or faculty map", err);
          setSubjects([]);
          setFacultyMap({});
        });
    }
  }, [selectedProgramId, selectedIntakeYear]);

  // Fetch existing timetable assignments
  useEffect(() => {
    if (selectedProgramId && selectedIntakeYear) {
      axios
        .get("http://localhost:5000/api/timetableAssignments/timetable", {
          params: {
            program_id: selectedProgramId,
            intake: selectedIntakeYear,
          },
        })
        .then((res) => {
          const mapped = {};
          res.data.forEach((a) => {
            mapped[`${a.day}-${a.slot}`] = {
              subjectId: a.subject_id,
              facultyId: a.faculty_id,
            };
          });
          setAssignments(mapped);
        })
        .catch((err) => {
          console.error("Failed to fetch timetable", err);
          setAssignments({});
        });
    }
  }, [selectedProgramId, selectedIntakeYear]);

  const handleChange = (day, slot, field, value) => {
    const key = `${day}-${slot}`;
    setAssignments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/api/timetableAssignments/timetable", {
        program_id: parseInt(selectedProgramId),
        intake: parseInt(selectedIntakeYear),
        timetable: assignments,
      });
      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Failed to save timetable", err);
      alert("Error saving timetable.");
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Assign Faculty to Subjects</h4>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Program</label>
          <select
            className="form-select"
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedIntakeYear("");
              setAssignments({});
            }}
          >
            <option value="">-- Select Program --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Intake Year</label>
          <select
            className="form-select"
            value={selectedIntakeYear}
            onChange={(e) => {
              setSelectedIntakeYear(e.target.value);
            }}
            disabled={!selectedProgramId}
          >
            <option value="">-- Select Intake Year --</option>
            {getIntakeYears(selectedProgramId).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProgramId && selectedIntakeYear && (
        <>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Day / Slot</th>
                {slots.map((slot) => (
                  <th key={slot}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td>{day}</td>
                  {slots.map((slot) => {
                    const key = `${day}-${slot}`;
                    const current = assignments[key] || {};
                    const availableFaculty = facultyMap[current.subjectId] || [];

                    return (
                      <td key={slot}>
                        <select
                          className="form-select mb-1"
                          value={current.subjectId || ""}
                          onChange={(e) =>
                            handleChange(day, slot, "subjectId", parseInt(e.target.value) || "")
                          }
                        >
                          <option value="">-- Subject --</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className="form-select"
                          value={current.facultyId || ""}
                          onChange={(e) =>
                            handleChange(day, slot, "facultyId", parseInt(e.target.value) || "")
                          }
                          disabled={!current.subjectId}
                        >
                          <option value="">-- Faculty --</option>
                          {availableFaculty.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end">
            <button className="btn btn-success" onClick={handleSave}>
              Save Timetable
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignFaculty;
