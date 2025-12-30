import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Previews.css'

function Previews() {
    return (
    <>
        <div className="video-wrapper">
            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}Recording_1.png`}>
                <source src={`${import.meta.env.BASE_URL}Recording_1.mp4`} type="video/mp4"/>
            </video>

            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}Recording_2.png`}>
                <source src={`${import.meta.env.BASE_URL}Recording_2.mp4`} type="video/mp4"/>
            </video>

            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}Recording_3.png`}>
                <source src={`${import.meta.env.BASE_URL}Recording_3.mp4`} type="video/mp4"/>
            </video>

            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}Final_Project_Unreal_Poster.png`}>
                <source src={`${import.meta.env.BASE_URL}Final_Project_Unreal.mp4`} type="video/mp4"/>
            </video>

            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}AutoFit_Example_Poster.png`}>
                <source src={`${import.meta.env.BASE_URL}AutoFit_Example.mp4`} type="video/mp4"/>
            </video>

            <video controls preload="none" playsInline poster={`${import.meta.env.BASE_URL}Scheduler_Example_Poster.png`}>
                <source src={`${import.meta.env.BASE_URL}Scheduler_Example.mp4`} type="video/mp4"/>
            </video>
        </div>
    </>
    );
}

export default Previews;