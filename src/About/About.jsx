import Reveal from '../Reveal.jsx'
import './About.css'

function About() {
    return (
      <main>
          <header className="page-hero">
              <div className="container">
                  <Reveal>
                      <p className="eyebrow">
                          <span className="eyebrow-dot" />
                          About
                      </p>
                      <h1 className="page-title">Still Learning, Always Building.</h1>
                      <p className="page-lede">
                          The path that led me to full-stack development, machine learning,
                          and secure software design.
                      </p>
                  </Reveal>
              </div>
          </header>

          <section className="section">
              <div className="container about-layout">
                  <Reveal className="about-copy">
                      <p>
                          Hello, my name is Randall Krouth. I am currently pursuing a
                          Bachelor&apos;s Degree in Computer Science Software Development with a
                          Minor in Cybersecurity at the College at Brockport. I am in my last semester
                          in completing the Bachelor's of Science degree program and plan to continue on completing my Minor's in Cybersecuity which requires 1 more class for completion.
                      </p>
                      <p>
                          I&apos;ve been programming for approximately 10 years and have completed over 180 courses across Coursera, TryHackMe, and
                          SoloLearn, covering topics such as programming, cloud computing, and
                          application security. I also continue to expand my knowledge
                          independently through reading and practical projects &mdash;
                          particularly in machine learning, database administration,
                          full-stack development, identity access management, and secure
                          software design.
                      </p>
                      <p>
                          Beyond academics, I have a strong interest in financial markets,
                          software engineering, and creative technology. I enjoy developing
                          applications, listening to music, photography, and snowboarding.
                          I&apos;m also an active learner who values exploration, both through
                          technology and travel, and I&apos;m excited about opportunities that
                          allow me to grow and experience diverse environments.
                      </p>
                  </Reveal>

                  <Reveal as="aside" className="about-facts" delay={120}>
                      <h2>Quick Facts</h2>
                      <dl>
                          <div>
                              <dt>Focus</dt>
                              <dd>Full-stack Development &amp; Machine Learning</dd>
                          </div>
                          <div>
                              <dt>Education</dt>
                              <dd>Computer Science: Software Development</dd>
                          </div>
                          <div>
                              <dt>Minor</dt>
                              <dd>Cybersecurity</dd>
                          </div>
                          <div>
                              <dt>Learning</dt>
                              <dd>180+ courses completed</dd>
                          </div>
                          <div>
                              <dt>Interests</dt>
                              <dd>Programming, Markets, Photography, Snowboarding</dd>
                          </div>
                      </dl>
                  </Reveal>
              </div>
          </section>
      </main>
  );
}

export default About;