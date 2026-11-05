import Reveal from '../Reveal.jsx'
import WorkCarousel from './WorkCarousel.jsx'

function SectionThree() {
  return (
    <section className="section section-soft capabilities">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Capabilities
          </p>
          <h2 className="section-title">From First Sketch to Production.</h2>
          <p className="section-lede">
            I work across the stack and the processes &mdash; research, interface design,
            engineering, and the infrastructure that keeps it all running.
          </p>
        </Reveal>

        <WorkCarousel />
      </div>
    </section>
  );
}

export default SectionThree;
