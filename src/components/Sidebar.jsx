import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ pinned, setPinned }) => {
  const location = useLocation();

  const sidebarStyle = {
    width: pinned ? "220px" : "60px",
    transition: "width 0.3s ease",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "#343a40",
    color: "white",
    overflowX: "hidden",
    paddingTop: "1rem",
    zIndex: 1000,
  };

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    color: "white",
    textDecoration: "none",
    whiteSpace: "nowrap",
    fontWeight: "500",
  };

  const activeLinkStyle = {
    backgroundColor: "#495057",
  };

  return (
    <div style={sidebarStyle}>
      <button
        className="btn btn-sm btn-secondary mb-3 mx-auto d-block"
        onClick={() => setPinned(!pinned)}
        aria-label={pinned ? "Hide Sidebar" : "Show Sidebar"}
      >
        {pinned ? "Hide" : "Pin"}
      </button>

      <nav className="nav flex-column">
        <Link
          to="/"
          style={{
            ...linkStyle,
            ...(location.pathname === "/" ? activeLinkStyle : {}),
          }}
          title="Home"
        >
          <i className="bi bi-house-door-fill me-2"></i>
          {pinned && "Home"}
        </Link>

        <Link
          to="/assign-faculty"
          style={{
            ...linkStyle,
            ...(location.pathname === "/assign-faculty" ? activeLinkStyle : {}),
          }}
          title="Assign Faculty"
        >
          <i className="bi bi-pencil-square me-2"></i>
          {pinned && "Assign Faculty"}
        </Link>

        <Link
          to="/faculty-timetable"
          style={{
            ...linkStyle,
            ...(location.pathname === "/faculty-timetable" ? activeLinkStyle : {}),
          }}
          title="Faculty Timetable"
        >
          <i className="bi bi-calendar3 me-2"></i>
          {pinned && "Faculty Timetable"}

          
        </Link>
        <Link to="/admin/schools" style={linkStyle}>
  {pinned && "Manage Schools"}
</Link>
<Link to="/admin/classes" style={linkStyle}>
  {pinned && "Manage Classes"}
</Link>
      </nav>
      <Link to="/admin/programs" style={linkStyle}>
  {pinned && "Manage Programs"}
</Link>
<Link to="/admin/subjects" style={linkStyle}>
  {pinned && "Manage Subjects"}
</Link>

<Link to="/admin/faculty" style={linkStyle}>
    {pinned && "Faculty Management"}
  </Link>

  <Link to="/admin/assign-subjects" style={linkStyle}>
  {pinned && "Assign Subjects"}
</Link>
    </div>
    
  );
};

export default Sidebar;
