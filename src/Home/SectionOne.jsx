import { Link } from "react-router-dom";

import Reveal from '../Reveal.jsx'
import './SectionOne.css'

const CHIPS = [
    "UX Research",
    "UI Design",
    "Front-End",
    "Back-End",
    "Machine Learning",
    "Game Design",
    "Data Analytics",
];

const TOOLKIT = [".Blazor", ".React", ".NET", ".Python", ".Cloud", ".Docker", ".SQL", ".JS"];

function SectionOne() {
  return (
      <section className="hero">
          <div className="hero-glow" aria-hidden="true">
              <span className="hero-orb hero-orb--one" />
              <span className="hero-orb hero-orb--two" />
              <span className="hero-orb hero-orb--three" />
          </div>

          <div className="container hero-inner">
              <Reveal className="hero-copy">
                  <p className="eyebrow">
                      <span className="eyebrow-dot" />
                      Full-stack developer &middot; ML engineer
                  </p>
                  <h1>
                      I Build Value Through <span className="text-gradient">Possibility</span>.
                  </h1>
                  <p className="hero-lede">
                      I&apos;m Randall Krouth &mdash; a Full-Stack Developer passionate about creating new
                      technologies and improving the one's people already love, from UX research and
                      interface design to machine learning, cloud infrastructure, and agentic development.
                  </p>
                  <div className="hero-actions">
                      <a className="btn btn-primary" href="#work">
                          Explore my work <span aria-hidden="true">&rarr;</span>
                      </a>
                      <Link className="btn btn-ghost" to="/contact">
                          Get in touch
                      </Link>
                  </div>
              </Reveal>

              <Reveal className="hero-visual" delay={160}>
                  <div className="hero-panel">
                      <div className="hero-panel-top">
                          <span className="status-pill">
                              <span className="status-dot" />
                              Open to opportunities
                          </span>
                          <span className="panel-tag">Portfolio</span>
                      </div>

                      <div className="hero-panel-body">
                          <p className="panel-label">What I do</p>
                          <div className="chip-row">
                              {CHIPS.map((chip, index) => (
                                  <span
                                      key={chip}
                                      className="chip"
                                      style={{ animationDelay: `${index * 0.35}s` }}
                                  >
                                      {chip}
                                  </span>
                              ))}
                          </div>
                      </div>

                      <div className="panel-grid">
                          <div>
                              <strong>Design</strong>
                              <span>Research &rarr; interface</span>
                          </div>
                          <div>
                              <strong>Build</strong>
                              <span>React &middot; .NET &middot; Python</span>
                          </div>
                          <div>
                              <strong>Ship</strong>
                              <span>Cloud &amp; DevOps</span>
                          </div>
                      </div>
                  </div>

                  <div className="hero-badge hero-badge--one" aria-hidden="true">
                      <span className="badge-dot" /> Machine learning
                  </div>
                  <div className="hero-badge hero-badge--two" aria-hidden="true">
                      <strong>180+</strong>
                      <span>courses completed</span>
                  </div>
              </Reveal>
          </div>

          <div className="container capability-strip-wrap">
              <div className="capability-strip">
                  {TOOLKIT.map((tool) => (
                      <span key={tool}>{tool}</span>
                  ))}
              </div>
          </div>
      </section>
  );
}

export default SectionOne;