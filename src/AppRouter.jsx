import { useEffect, useLayoutEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

/* A client-side route swap keeps the previous scroll offset, so every
   navigation would land mid-page. Reset it before the new route paints;
   a hash target is left to the browser so in-page links still work. */
function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        /* Without this the browser sometimes restores an old offset on back or
           forward after the reset below, which lands midway down the page. */
        if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    }, []);

    useLayoutEffect(() => {
        if (hash) return;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, hash]);

    return null;
}

export default function AppRouter() {

    useWheelScale();

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
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
