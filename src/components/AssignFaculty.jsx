import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const AssignFaculty = () => {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyMap, setFacultyMap] = useState({});
  const [assignments, setAssignments] = useState({});
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedIntakeYear, setSelectedIntakeYear] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalDay, setModalDay] = useState("");
  const [modalSlot, setModalSlot] = useState("");
  const [modalSubjectId, setModalSubjectId] = useState("");
  const [modalFacultyId, setModalFacultyId] = useState("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = ["1", "2", "3", "4", "5", "6", "7"];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/timetableAssignments/programs-with-intakes")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  useEffect(() => {
    if (selectedProgramId && selectedIntakeYear) {
      axios
        .get("http://localhost:5000/api/timetableAssignments/subjects", {
          params: { program_id: selectedProgramId, intake: selectedIntakeYear },
        })
        .then((res) => {
          setSubjects(res.data);
          fetchFacultyMap(res.data.map((s) => s.id));
        })
        .catch(() => setSubjects([]));
    }
  }, [selectedProgramId, selectedIntakeYear]);

  const fetchFacultyMap = async (subjectIds) => {
    try {
      const res = await axios.post("http://localhost:5000/api/timetableAssignments/faculty-by-subjects", {
        subject_ids: subjectIds,
      });
      setFacultyMap(res.data);
    } catch (err) {
      console.error("Error fetching faculty map:", err);
      setFacultyMap({});
    }
  };

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
          const assignmentMap = {};
          res.data.forEach((a) => {
            assignmentMap[`${a.day}-${a.slot}`] = {
              subjectId: a.subject_id,
              facultyId: a.faculty_id,
            };
          });
          setAssignments(assignmentMap);
        })
        .catch((err) => {
          console.error("Error fetching assignments:", err);
          setAssignments({});
        });
    } else {
      setAssignments({});
    }
  }, [selectedProgramId, selectedIntakeYear]);

  const getIntakeYears = (programId) =>
    programs.find((p) => p.id === parseInt(programId))?.intakeYears || [];

  const openModal = (day, slot) => {
    const key = `${day}-${slot}`;
    const current = assignments[key] || {};
    setModalDay(day);
    setModalSlot(slot);
    setModalSubjectId(current.subjectId || "");
    setModalFacultyId(current.facultyId || "");
    setModalVisible(true);
  };

  const handleModalSave = () => {
    const key = `${modalDay}-${modalSlot}`;
    const newAssignment = { subjectId: modalSubjectId, facultyId: modalFacultyId };
    setAssignments((prev) => ({
      ...prev,
      [key]: newAssignment,
    }));
    setModalVisible(false);
  };

  const handleSubjectChange = (subjectId) => {
    setModalSubjectId(subjectId);
    const facultyOptions = facultyMap[subjectId] || [];
    if (facultyOptions.length === 1) {
      setModalFacultyId(facultyOptions[0].id);
    } else {
      setModalFacultyId("");
    }
  };

  const handleSaveTimetable = async () => {
    try {
      await axios.post("http://localhost:5000/api/timetableAssignments/timetable", {
        program_id: parseInt(selectedProgramId),
        intake: parseInt(selectedIntakeYear),
        timetable: assignments,
      });
      alert("Timetable saved successfully.");
    } catch (err) {
      console.error("Error saving timetable:", err);
      alert("Error saving timetable.");
    }
  };

  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || "";
  const getFacultyName = (subjectId, facultyId) =>
    (facultyMap[subjectId]?.find((f) => f.id === facultyId)?.name) || "";

  return (
    <div className="container mt-4">
      <h4>Assign Faculty to Subjects - Timetable</h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <label>Select Program</label>
          <select
            className="form-select"
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedIntakeYear("");
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
          <label>Select Intake Year</label>
          <select
            className="form-select"
            value={selectedIntakeYear}
            onChange={(e) => setSelectedIntakeYear(e.target.value)}
            disabled={!selectedProgramId}
          >
            <option value="">-- Select Year --</option>
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
                    const assignment = assignments[key];
                    const text = assignment
                      ? `${getSubjectName(assignment.subjectId)} (${getFacultyName(
                          assignment.subjectId,
                          assignment.facultyId
                        )})`
                      : "";
                    return (
                      <td key={slot} onClick={() => openModal(day, slot)} style={{ cursor: "pointer" }}>
                        {text || <span className="text-muted">Click to assign</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <Button variant="success" onClick={handleSaveTimetable}>
            Save Timetable
          </Button>
        </>
      )}

      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Subject & Faculty ({modalDay} - {modalSlot})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Subject</label>
          <select
            className="form-select mb-2"
            value={modalSubjectId}
            onChange={(e) => handleSubjectChange(parseInt(e.target.value) || "")}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label>Faculty</label>
          <select
            className="form-select"
            value={modalFacultyId}
            onChange={(e) => setModalFacultyId(parseInt(e.target.value) || "")}
            disabled={!modalSubjectId}
          >
            <option value="">-- Select Faculty --</option>
            {(facultyMap[modalSubjectId] || []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSave} disabled={!modalSubjectId || !modalFacultyId}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignFaculty;
