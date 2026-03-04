import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Designs.css'

function Designs() {
    return (
    <>
        <div className="designs-container">
            <p>CI/CD:</p>
            <img src="Architectural_Design_3.png" id="cicd"/>
            <p>Self-Managed Industry Standard Design:</p>
            <img src="Industry_Standard_Design.png" />
            <p>Managed Industry Standard Design:</p>
            <img src="Industry_Standard_Managed_Design.png" />
            <p>Managed Industry Standard Design with Security:</p>
            <img src="Industry_Standard_Managed_Design_With_Security.png" />
            <p>Serverless Industry Standard Design with Security:</p>
            <img src="Industry_Standard_Serverless_Design_With_Security.png" />
            <p>Encryption Guidelines:</p>
            <img src="Architectural_Design_4.png" />
            <p>Authentication Identity Control Layer:</p>
            <img src="Authentication_Control_Layer.png" />
            <p>Security Baseline:</p>
            <img src="Security_Baseline.png" />
        </div>
    </>
  );
}

export default Designs;