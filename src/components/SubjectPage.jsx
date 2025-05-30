import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const SubjectManagement = () => {
  const [subjectList, setSubjectList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [newSubject, setNewSubject] = useState({ program_id: "", intake: "", code: "", name: "" });
  const [editSubject, setEditSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filterProgram, setFilterProgram] = useState("");
  const [filterIntake, setFilterIntake] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchPrograms();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/subjects");
      setSubjectList(res.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/programs");
      setProgramList(res.data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
  };

  const handleSaveSubject = async () => {
    try {
      await axios.post("http://localhost:5000/api/subjects", newSubject);
      setNewSubject({ program_id: "", intake: "", code: "", name: "" });
      fetchSubjects();
    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  const handleEditClick = (subject) => {
    setEditSubject(subject);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`http://localhost:5000/api/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error("Failed to delete subject:", error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditSubject({ ...editSubject, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/subjects/${editSubject.id}`, editSubject);
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Failed to update subject:", error);
    }
  };

  const getFilteredSubjects = () => {
    return subjectList.filter((subject) => {
      const matchProgram = filterProgram ? subject.program_id === parseInt(filterProgram) : true;
      const matchIntake = filterIntake ? subject.intake === parseInt(filterIntake) : true;
      return matchProgram && matchIntake;
    });
  };

  const years = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 2022 + i);

  return (
    <div className="container mt-4">
      <h3>Manage Subjects / Courses</h3>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label>Filter by Program</label>
          <select className="form-select" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
            <option value="">-- All Programs --</option>
            {programList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>Filter by Intake Year</label>
          <select className="form-select" value={filterIntake} onChange={(e) => setFilterIntake(e.target.value)}>
            <option value="">-- All Years --</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Subject */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Program</label>
          <select className="form-select" name="program_id" value={newSubject.program_id} onChange={handleInputChange}>
            <option value="">-- Select Program --</option>
            {programList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label>Intake Year</label>
          <select className="form-select" name="intake" value={newSubject.intake} onChange={handleInputChange}>
            <option value="">-- Year --</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Subject Code</label>
          <input type="text" className="form-control" name="code" value={newSubject.code} onChange={handleInputChange} placeholder="e.g. CS101" />
        </div>
        <div className="col-md-3">
          <label>Subject Name</label>
          <input type="text" className="form-control" name="name" value={newSubject.name} onChange={handleInputChange} placeholder="e.g. Data Structures" />
        </div>
        <div className="col-md-1 d-flex align-items-end">
          <button className="btn btn-success w-100" onClick={handleSaveSubject}>Add</button>
        </div>
      </div>

      <hr />

      {/* Subject Table */}
      <h5>Subjects</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Name</th>
            <th>Code</th>
            <th>Program</th>
            <th>Intake</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {getFilteredSubjects().length === 0 ? (
            <tr><td colSpan="6">No subjects found.</td></tr>
          ) : (
            getFilteredSubjects().map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.name}</td>
                <td>{s.code}</td>
                <td>{s.program_name}</td>
                <td>{s.intake}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(s)}>Modify</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Modify Subject</Modal.Title></Modal.Header>
        <Modal.Body>
          {editSubject && (
            <Form>
              <Form.Group>
                <Form.Label>Program</Form.Label>
                <Form.Select name="program_id" value={editSubject.program_id} onChange={handleEditChange}>
                  {programList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Intake Year</Form.Label>
                <Form.Select name="intake" value={editSubject.intake} onChange={handleEditChange}>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Subject Code</Form.Label>
                <Form.Control type="text" name="code" value={editSubject.code} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Subject Name</Form.Label>
                <Form.Control type="text" name="name" value={editSubject.name} onChange={handleEditChange} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubjectManagement;
