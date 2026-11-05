import './App.css'

import Reveal from '../Reveal.jsx'
import SectionOne from './SectionOne.jsx'
import SkillRows from './SkillRows.jsx'
import SectionThree from './SectionThree.jsx'
import BottomSection from './BottomSection'

function App() {
    return (
        <>
            <SectionOne />

            <section id="work" className="section work-section">
                <div className="container">
                    <Reveal className="section-head">
                        <p className="eyebrow">
                            <span className="eyebrow-dot" />
                            Selected work
                        </p>
                        <h2 className="section-title">Design and Engineering, End to End.</h2>
                        <p className="section-lede">
                            A look at the products, platforms, and interfaces i&apos;ve designed and
                            built &mdash; from responsive applications and live trading integrations to
                            cloud architecture and creative technologies.
                        </p>
                    </Reveal>

                    <SkillRows />
                </div>
            </section>

            <SectionThree />
            <BottomSection />
        </>
    )
}

export default App;
