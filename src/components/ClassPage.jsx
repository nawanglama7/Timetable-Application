import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const ClassPage = () => {
  const [programs, setPrograms] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [intakeYear, setIntakeYear] = useState("");
  const [className, setClassName] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editClass, setEditClass] = useState(null);

  useEffect(() => {
    fetchPrograms();
    fetchClasses();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/programs");
      setPrograms(res.data);
    } catch (err) {
      console.error("Error fetching programs", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClassList(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    }
  };

  const handleAddClass = async () => {
    if (!selectedProgram || !intakeYear || !className.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/classes", {
        name: className.trim().toUpperCase(),
        intake: intakeYear,
        program_id: selectedProgram
      });
      setClassName("");
      fetchClasses();
    } catch (err) {
      console.error("Failed to add class", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  };

  const openEditModal = (cls) => {
    setEditClass(cls);
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editClass.name.trim()) return;
    try {
      await axios.put(`http://localhost:5000/api/classes/${editClass.id}`, editClass);
      setEditModal(false);
      fetchClasses();
    } catch (err) {
      console.error("Failed to update class", err);
    }
  };

  const years = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => 2022 + i
  );

  return (
    <div className="container mt-4">
      <h3>Manage Classes</h3>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Select Program</label>
          <select
            className="form-select"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">-- Select --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Select Intake</label>
          <select
            className="form-select"
            value={intakeYear}
            onChange={(e) => setIntakeYear(e.target.value)}
          >
            <option value="">-- Year --</option>
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Class Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., A, 1"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-success w-100" onClick={handleAddClass}>
            Add Class
          </button>
        </div>
      </div>

      <hr />

      <h5>Existing Classes</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Class</th>
            <th>Program</th>
            <th>Intake</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classList.length === 0 && (
            <tr>
              <td colSpan="5">No classes added yet.</td>
            </tr>
          )}
          {classList.map((cls, index) => (
            <tr key={cls.id}>
              <td>{index + 1}</td>
              <td>{cls.name}</td>
              <td>{cls.programName}</td>
              <td>{cls.intake}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(cls)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cls.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Class Name</Form.Label>
              <Form.Control
                type="text"
                value={editClass?.name || ""}
                onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Intake</Form.Label>
              <Form.Select
                value={editClass?.intake || ""}
                onChange={(e) => setEditClass({ ...editClass, intake: e.target.value })}
              >
                <option value="">-- Select --</option>
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClassPage;
