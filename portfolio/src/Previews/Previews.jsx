import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Previews.css'

function Previews() {
    return (
    <>
        <div className="video-wrapper">
            <video controls>
                <source src="../public/Recording_1.mp4" type="video/mp4" />
            </video>

            <video controls>
                <source src="../public/Recording_2.mp4" type="video/mp4" />
            </video>

            <video controls>
                <source src="../public/Recording_3.mp4" type="video/mp4" />
            </video>

            <video controls>
                <source src="../public/Final_Project_Unreal.mp4" type="video/mp4" />
            </video>

            <video controls>
                <source src="../public/AutoFit_Example.mp4" type="video/mp4" />
            </video>

            <video controls>
                <source src="../public/Scheduler_Example.mp4" type="video/mp4" />
            </video>

        </div>
    </>
    );
}

export default Previews;