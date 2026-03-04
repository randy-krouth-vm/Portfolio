import './BottomSection.css'

function BottomSection() {
  return (
      <div id="bottom-section">
          <img src="Line.png" id="image-line" />

          <p>DevOps practices including CI/CD, Application Security, and Agile <br />
              Methodologies using Microservices & Serverless</p>

          <img src="Image_10_Black_White_and_Pink_Modern_Software_Engineer_Presentation.png" id="image-ten" alt="Software Engineer Presentation Image"/>
          <img src="Image_11.png" id="image-eleven" alt="Navigation Arrow Image" />
          <button onClick={() =>
              window.scrollTo({
                  top: 0,
                  behavior: "smooth",
              })
          } />
    </div>
  );
}

export default BottomSection;