import './Designs.css'

function Designs() {
    return (
    <>
        <div className="designs-container">
            <p>CI/CD:</p>
            <img src="Architectural_Design_3.png" id="cicd" loading="lazy"/>
            <p>Self-Managed Industry Standard Design:</p>
            <img src="Industry_Standard_Design.png" loading="lazy" />
            <p>Managed Industry Standard Design:</p>
            <img src="Industry_Standard_Managed_Design.png" loading="lazy" />
            <p>Managed Industry Standard Design with Security:</p>
            <img src="Industry_Standard_Managed_Design_With_Security.png" loading="lazy" />
            <p>Serverless Industry Standard Design with Security:</p>
            <img src="Industry_Standard_Serverless_Design_With_Security.png" loading="lazy" />
            <p>Encryption Guidelines:</p>
            <img src="Architectural_Design_4.png" loading="lazy" />
            <p>Authentication Identity Control Layer:</p>
            <img src="Authentication_Control_Layer.png" loading="lazy" />
            <p>Security Baseline:</p>
            <img src="Security_Baseline.png" loading="lazy" />
        </div>
    </>
  );
}

export default Designs;