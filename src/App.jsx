import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import AssignFaculty from "./components/AssignFaculty";
import FacultyTimetable from "./components/FacultyTimetable";
import SchoolPage from "./components/SchoolPage";
import ClassPage from "./components/ClassPage";
import ProgramPage from "./components/ProgramPage";
import SubjectPage from "./components/SubjectPage";
import FacultyPage from "./components/FacultyPage";
import AssignSubjects from './components/AssignSubjects';

function App() {
  const [pinned, setPinned] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setPinned(!mobile); // auto-collapse on mobile
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      <div className="d-flex">
        <Sidebar pinned={pinned} setPinned={setPinned} />

        <div
          style={{
            marginLeft: pinned ? "220px" : "60px",
            padding: "20px",
            flex: 1,
            transition: "margin-left 0.3s ease",
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assign-faculty" element={<AssignFaculty />} />
            <Route path="/faculty-timetable" element={<FacultyTimetable />} />
            <Route path="/admin/schools" element={<SchoolPage />} />
            <Route path="/admin/classes" element={<ClassPage />} />
            <Route path="/admin/programs" element={<ProgramPage />} />
            <Route path="/admin/subjects" element={<SubjectPage />} />
            <Route path="/admin/faculty" element={<FacultyPage />} />
            <Route path="/admin/assign-subjects" element={<AssignSubjects />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
