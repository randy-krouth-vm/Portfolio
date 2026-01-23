import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './Previews.css'

function Previews() {
    return (
        <>
            <div className="video-wrapper">

                <video controls preload="none" playsInline poster="Stream_Poster.png">
                    <source src="Stream.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Recording_1_Poster.png">
                    <source src="Recording_1.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Recording_2_Poster.png">
                    <source src="Recording_2.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Recording_3_Poster.png">
                    <source src="Recording_3.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Final_Project_Unreal_Poster.png">
                    <source src="Final_Project_Unreal.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="AutoFit_Example_Poster.png">
                    <source src="AutoFit_Example.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Scheduler_Example_Poster.png">
                    <source src="Scheduler_Example.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="BurpSuite_Example_Poster.png">
                    <source src="BurpSuite_Example.mp4" type="video/mp4" />
                </video>

                <video controls preload="none" playsInline poster="Mock_Example_Poster.png">
                    <source src="Mock_Example.mp4" type="video/mp4" />
                </video>
            </div>

        </>
    );
}

export default Previews;