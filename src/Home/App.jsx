import './App.css'

import SectionOne from './SectionOne.jsx'
import ImageGrid from '../ImageGrid/ImageGrid.jsx'
import SectionThree from './SectionThree.jsx'
import BottomSection from './BottomSection'

function App() {

    // State, Effect, Etc.

  return (
    <>
          <SectionOne />
          <ImageGrid imageOne="Image_1_Black_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png" imageOneText="Responsive Application Design"
              imageTwo="Image_2_Black_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png" imageTwoText="Live Trading & API Integrations" />
          <ImageGrid imageOne="Image_3_Gray_and_White_Minimalist_Desktop_Mockup_Instagram_Post.png" imageOneText="Scalable Compute Applications"
              imageTwo="Image_4_Brown_and_Gray_Minimalist_Desktop_Mockup_Instagram_Post.png" imageTwoText="Interactive Game Design" />
          <SectionThree />
          <ImageGrid imageOne="Image_8_Black_&_White_Modern_QR_Code_Wifi_Access_Flyer.png" imageOneText="Identity Access Management (IAM)"
              imageTwo="Image_9_Cloud_Server_Logo.png" imageTwoText="Back-End Development" />
          <BottomSection />
    </>
  )
}

export default App;
