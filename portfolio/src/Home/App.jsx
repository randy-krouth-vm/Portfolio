import './App.css'

import SectionOne from './SectionOne.jsx'
import ImageGrid from '../ImageGrid/ImageGrid.jsx'
import SectionThree from './SectionThree.jsx'
import BottomSection from './BottomSection'

import imageOne from '../assets/Image_1_Black_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png'
import imageTwo from '../assets/Image_2_Black_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png'

import imageThree from '../assets/Image_3_Gray_and_White_Minimalist_Desktop_Mockup_Instagram_Post.png'
import imageFour from '../assets/Image_4_Brown_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png'

import imageEight from '../assets/Image_8_Black_&_White_Modern_QR_Code_Wifi_Access_Flyer.png'
import imageNine from '../assets/Image_9_Cloud_Server_Logo.png'

function App() {

    // State, Effect, Etc.

  return (
    <>
          <SectionOne />
          <ImageGrid imageOne={imageOne} imageOneText="Responsive Application Design"
              imageTwo={imageTwo} imageTwoText="Live Trading & API Integrations" />
          <ImageGrid imageOne={imageThree} imageOneText="Scalable Compute Applications"
              imageTwo={imageFour} imageTwoText="Interactive Game Design" />
          <SectionThree />
          <ImageGrid imageOne={imageEight} imageOneText="Identity Access Management (IAM)"
              imageTwo={imageNine} imageTwoText="Back-End Development" />
          <BottomSection />
    </>
  )
}

export default App;
