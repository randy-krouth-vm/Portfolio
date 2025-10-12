import './SectionThree.css'

import imageOne from '../assets/Image_5.png'
import imageTwo from '../assets/Image_6.png'
import imageThree from '../assets/Image_7.png'

function SectionThree() {
  return (
      <div id="section-three">
          <img src={imageOne} id="image-one" />
          <p>Conduct UX Research, Usability Studies, and Design User Experiences </p>

          <img src={imageTwo} id="image-two" />
          <p>Machine Learning, Hyperparameter Tuning, Predictive Analytics, and <br />
              Time Series Generators</p>

          <img src={imageThree} id="image-three" />
          <p>Real-Time Visual Engineering:<br /><br />

              Exploring environment composition, lighting, and shader workflows. <br />
              Blending art and direction with technical implementations to push the <br />
              boundaries of what&apos;s possible in interactive worlds.</p>
        </div>
  );
}

export default SectionThree;