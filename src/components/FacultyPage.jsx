import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const FacultyPage = () => {
  const [schoolsList, setSchoolsList] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [kekaId, setKekaId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/faculty/schools")
      .then(res => setSchoolsList(res.data))
      .catch(err => {
        console.error("Error fetching schools:", err);
        setSchoolsList([]);
      });

    fetchFaculties();
  }, []);

  const fetchFaculties = () => {
    axios.get("http://localhost:5000/api/faculty")
      .then(res => setFaculties(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Error fetching faculties:", err);
        setFaculties([]);
      });
  };

  const handleAddFaculty = () => {
    if (!facultyName.trim() || !kekaId.trim() || !selectedSchool) return;

    const selected = schoolsList.find(s => s.name === selectedSchool);
    if (!selected) return;

    const newFaculty = {
      name: facultyName.trim(),
      keka_id: kekaId.trim(),
      school_id: selected.id,
    };

    axios.post("http://localhost:5000/api/faculty", newFaculty)
      .then(() => {
        setFacultyName("");
        setKekaId("");
        setSelectedSchool("");
        fetchFaculties();
      })
      .catch(err => console.error("Error adding faculty:", err));
  };

  const handleDeleteFaculty = (id) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      axios.delete(`http://localhost:5000/api/faculty/${id}`)
        .then(() => fetchFaculties())
        .catch(err => console.error("Error deleting faculty:", err));
    }
  };

  const openEditModal = (faculty) => {
    setEditFaculty({ ...faculty });
    setShowModal(true);
  };

  const handleUpdateFaculty = () => {
    if (!editFaculty?.name.trim() || !editFaculty?.keka_id.trim() || !editFaculty?.school_id) return;
  
    axios.put(`http://localhost:5000/api/faculty/${editFaculty.id}`, {
      name: editFaculty.name.trim(),
      keka_id: editFaculty.keka_id.trim(),
      school_id: editFaculty.school_id
    })
      .then(() => {
        setShowModal(false);
        setEditFaculty(null);
        fetchFaculties();
      })
      .catch(err => console.error("Error updating faculty:", err));
  };
  

  const filteredFaculties = selectedSchool
    ? faculties.filter(fac => {
        const school = schoolsList.find(s => s.id === fac.school_id);
        return school && school.name === selectedSchool;
      })
    : faculties;

  return (
    <div className="container mt-4">
      <h3>Faculty Management</h3>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Select School</label>
          <select
            className="form-select"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">-- Select School --</option>
            {schoolsList.map((school) => (
              <option key={school.id} value={school.name}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Faculty Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter name"
            value={facultyName}
            onChange={(e) => setFacultyName(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">KEKA ID</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter KEKA ID"
            value={kekaId}
            onChange={(e) => setKekaId(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-success w-100" onClick={handleAddFaculty}>
            Add Faculty
          </button>
        </div>
      </div>

      <hr />

      <h5>Faculty List</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>KEKA ID</th>
            <th>School</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaculties.length === 0 ? (
            <tr>
              <td colSpan="5">No faculty available.</td>
            </tr>
          ) : (
            filteredFaculties.map((fac, index) => {
              const school = schoolsList.find(s => s.id === fac.school_id);
              return (
                <tr key={fac.id}>
                  <td>{index + 1}</td>
                  <td>{fac.name}</td>
                  <td>{fac.keka_id}</td>
                  <td>{school ? school.name : "Unknown"}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => openEditModal(fac)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFaculty(fac.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Faculty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editFacultyName" className="mb-3">
              <Form.Label>Faculty Name</Form.Label>
              <Form.Control
                type="text"
                value={editFaculty?.name || ""}
                onChange={(e) =>
                  setEditFaculty({ ...editFaculty, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="editKekaId">
              <Form.Label>KEKA ID</Form.Label>
              <Form.Control
                type="text"
                value={editFaculty?.keka_id || ""}
                onChange={(e) =>
                  setEditFaculty({ ...editFaculty, keka_id: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateFaculty}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FacultyPage;
