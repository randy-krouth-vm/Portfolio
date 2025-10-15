import './SectionThree.css'

import imageOne from '../assets/Image_5.png'
import imageTwo from '../assets/Image_6.png'
import imageThree from '../assets/Image_7.png'

function SectionThree() {
  return (
      <div id="section-three">
          <img src={imageOne} id="image-one" alt="Usability Study Image"/>
          <p>Conduct UX Research, Usability Studies, and Design User Experiences </p>

          <img src={imageTwo} id="image-two" alt="Machine Learning Image"/>
          <p>Machine Learning, Hyperparameter Tuning, Predictive Analytics, and
              Time Series Generators</p>

          <img src={imageThree} id="image-three" alt="Game Design Image"/>
          <p>Real-Time Visual Engineering:<br /><br />

              Exploring environment composition, lighting, and shader workflows.
              Blending art and direction with technical implementations to push the
              boundaries of what&apos;s possible in interactive worlds.</p>
        </div>
  );
}

export default SectionThree;