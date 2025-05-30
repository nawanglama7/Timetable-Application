import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);

  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramSchoolId, setNewProgramSchoolId] = useState('');

  const [editModalShow, setEditModalShow] = useState(false);
  const [editProgramId, setEditProgramId] = useState(null);
  const [editProgramName, setEditProgramName] = useState('');
  const [editProgramSchoolId, setEditProgramSchoolId] = useState('');

  // Fetch programs and schools
  const fetchPrograms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/programs');
      setPrograms(res.data);
    } catch (err) {
      console.error('Failed to fetch programs');
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/schools');
      setSchools(res.data);
      if (res.data.length > 0) setNewProgramSchoolId(res.data[0].id);
    } catch (err) {
      console.error('Failed to fetch schools');
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSchools();
  }, []);

  // Add new program
  const handleAddProgram = async () => {
    if (!newProgramName || !newProgramSchoolId) return;
    try {
      await axios.post('http://localhost:5000/api/programs', {
        name: newProgramName,
        school_id: newProgramSchoolId,
      });
      setNewProgramName('');
      fetchPrograms();
    } catch (err) {
      console.error('Failed to add program');
    }
  };

  // Edit program
  const handleEditClick = (program) => {
    setEditProgramId(program.id);
    setEditProgramName(program.name);
    setEditProgramSchoolId(program.school_id);
    setEditModalShow(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/programs/${editProgramId}`, {
        name: editProgramName,
        school_id: editProgramSchoolId,
      });
      setEditModalShow(false);
      fetchPrograms();
    } catch (err) {
      console.error('Failed to update program');
    }
  };

  // Delete program with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await axios.delete(`http://localhost:5000/api/programs/${id}`);
        fetchPrograms();
      } catch (err) {
        console.error('Failed to delete program');
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Program Management</h3>

      <div className="row mb-4">
        <div className="col">
          <input
            className="form-control"
            placeholder="Program Name"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
          />
        </div>
        <div className="col">
          <select
            className="form-select"
            value={newProgramSchoolId}
            onChange={(e) => setNewProgramSchoolId(e.target.value)}
          >
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.short_form})
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <button className="btn btn-primary" onClick={handleAddProgram}>
            Add Program
          </button>
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Program Name</th>
            <th>School</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program, index) => (
            <tr key={program.id}>
              <td>{index + 1}</td>
              <td>{program.name}</td>
              <td>{program.school_name}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEditClick(program)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(program.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal show={editModalShow} onHide={() => setEditModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Program Name</Form.Label>
            <Form.Control
              type="text"
              value={editProgramName}
              onChange={(e) => setEditProgramName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>School</Form.Label>
            <Form.Select
              value={editProgramSchoolId}
              onChange={(e) => setEditProgramSchoolId(e.target.value)}
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.short_form})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProgramManagement;
