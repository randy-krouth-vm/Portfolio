import { useNavigate } from "react-router-dom";

import './SectionOne.css'

function SectionOne() {
  const navigate = useNavigate();

  return (
      <div id="section-1">
          <img src="Self_Portrait.png" id="self-portrait" alt="Self Portrait Image" loading="lazy" />
          <img src="Image_14.png" alt="Header Image" loading="lazy" />
          <button onClick={() => navigate("/skills")} />
      </div>
  );
}

export default SectionOne;