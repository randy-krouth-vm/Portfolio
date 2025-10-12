import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Skills.css'

function Skills() {
    return (
    <>
        <div id="skills-main-section">
                <p>UX/UI Design</p>
                <p>Front-End Development</p>
                <p>Machine Learning</p>
                <p>Back-End Development</p>
                <p>Game Design</p>
                <p>Data Analytics</p>
        </div>

        <div id="skills-advance">
                <p>Explore</p>
                <Link to="/contact">Learn More &gt;</Link>
        </div>

    </>
  );
}

export default Skills;