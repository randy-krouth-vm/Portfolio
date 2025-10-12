import './BottomSection.css'

import imageTen from '../assets/Image_10_Black_White_and_Pink_Modern_Software_Engineer_Presentation.png'
import imageEleven from '../assets/Image_11.png'

import Line from '../assets/Line.png'

function BottomSection() {
  return (
      <div id="bottom-section">
          <img src={Line} id="image-line" />

          <p>DevOps practices including CI/CD, Application Security, and Agile <br />
              Methodologies using Microservices & Serverless</p>

          <img src={imageTen} id="image-ten" />
          <img src={imageEleven} id="image-eleven" />
          <button aria-placeholder="" onClick={() =>
              window.scrollTo({
                  top: 0,
                  behavior: "smooth",
              })
          } />
    </div>
  );
}

export default BottomSection;