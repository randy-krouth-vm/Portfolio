import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Designs.css'

function Designs() {
    return (
    <>
        <div className="designs-container">
            <p>CI/CD:</p>
            <img src="Architectural_Design_3.png"/>
            <p>Event Driven Streaming:</p>
            <img src="Architectural_Design_2.png"/>
            <p>Generic Web Architecture:</p>
            <img src="Architectural_Design_1.png"/>
        </div>
    </>
  );
}

export default Designs;