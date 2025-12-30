import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './TopToolbar.css'

function TopToolbar() {
  return (
      <div id="top-toolbar">
          <Link to="/">Home</Link>
          <Link to="/skills">Skills</Link>
          <Link to="/about">About</Link>
          <Link to="/previews">Previews</Link>
          <Link to="/contact">Contact</Link>
      </div>
  );
}

export default TopToolbar;