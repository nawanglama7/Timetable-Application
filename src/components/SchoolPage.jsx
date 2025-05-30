import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [shortForm, setShortForm] = useState("");

  const [editModalShow, setEditModalShow] = useState(false);
  const [editSchoolId, setEditSchoolId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editShortForm, setEditShortForm] = useState("");

  const fetchSchools = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/schools");
      setSchools(response.data);
    } catch (err) {
      console.error("Error fetching school data.");
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAddSchool = async () => {
    if (!schoolName || !shortForm) return;
    try {
      await axios.post("http://localhost:5000/api/schools", {
        name: schoolName,
        short_form: shortForm,
      });
      setSchoolName("");
      setShortForm("");
      fetchSchools();
    } catch (err) {
      console.error("Failed to add school.");
    }
  };

  const handleEditClick = (school) => {
    setEditSchoolId(school.id);
    setEditName(school.name);
    setEditShortForm(school.short_form);
    setEditModalShow(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/schools/${editSchoolId}`, {
        name: editName,
        short_form: editShortForm,
      });
      setEditModalShow(false);
      fetchSchools();
    } catch (err) {
      console.error("Failed to update school.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await axios.delete(`http://localhost:5000/api/schools/${id}`);
        fetchSchools();
      } catch (err) {
        console.error("Failed to delete school.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h3>School Management</h3>
      <div className="row mb-4">
        <div className="col">
          <input
            className="form-control"
            placeholder="School Name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Short Form"
            value={shortForm}
            onChange={(e) => setShortForm(e.target.value)}
          />
        </div>
        <div className="col">
          <button className="btn btn-primary" onClick={handleAddSchool}>
            Add School
          </button>
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>School Name</th>
            <th>Short Form</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school, index) => (
            <tr key={school.id}>
              <td>{index + 1}</td>
              <td>{school.name}</td>
              <td>{school.short_form}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEditClick(school)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(school.id)}
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
          <Modal.Title>Edit School</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>School Name</Form.Label>
            <Form.Control
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Short Form</Form.Label>
            <Form.Control
              type="text"
              value={editShortForm}
              onChange={(e) => setEditShortForm(e.target.value)}
            />
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

export default SchoolManagement;
