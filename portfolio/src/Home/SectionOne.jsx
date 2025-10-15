import { useNavigate } from "react-router-dom";

import './SectionOne.css'

import headerImage from '../assets/Image_14.png'
import selfPortrait from '../assets/Self_Portrait.png'

function SectionOne() {
  const navigate = useNavigate();

  return (
      <div id="section-1">

          <img src={selfPortrait} id="self-portrait" alt="Self Portrait Image"/>
          <img src={headerImage} alt="Header Image"/>
          <button onClick={() => navigate("/skills")} />
      </div>
  );
}

export default SectionOne;