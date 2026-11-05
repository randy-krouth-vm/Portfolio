import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopToolbar from './TopToolbar/TopToolbar.jsx'
import App from "./Home/App.jsx"; 
import Skills from "./Skills/Skills.jsx";
import About from "./About/About.jsx";
import Designs from "./Designs/Designs.jsx";
import Certificates from "./Certificates/Certificates.jsx";
import Contact from "./Contact/Contact.jsx";
import ProjectPage from "./Projects/ProjectPage.jsx";
import ProjectsPage from "./Projects/ProjectsPage.jsx";
import { useWheelScale } from "./WheelScale.jsx"

export default function AppRouter() {

    useWheelScale();

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <TopToolbar />
            <Routes>
                <Route path="/" element={<App/>}/>   
                <Route path="/skills" element={<Skills/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/designs" element={<Designs/>}/>
                <Route path="/certificates" element={<Certificates/>}/>
                <Route path="/projects" element={<ProjectsPage/>}/>
                <Route path="/projects/:slug" element={<ProjectPage/>}/>
                <Route path="/contact" element={<Contact/>}/>
            </Routes>
        </Router>
    );
}
