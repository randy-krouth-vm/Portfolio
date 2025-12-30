import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./Home/App.jsx"; 
import Skills from "./Skills/Skills.jsx";
import About from "./About/About.jsx";
import Contact from "./Contact/Contact.jsx";
import TopToolbar from './TopToolbar/TopToolbar.jsx'
import Designs from "./Designs/Designs.jsx";
import Previews from "./Previews/Previews.jsx";

export default function AppRouter() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <TopToolbar />
            <Routes>
                <Route path="/" element={<App/>}/>   
                <Route path="/skills" element={<Skills/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/designs" element={<Designs/>}/>
                <Route path="/previews" element={<Previews/>}/>
                <Route path="/contact" element={<Contact/>}/>
            </Routes>
        </Router>
    );
}
