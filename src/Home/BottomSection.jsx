import { Link } from "react-router-dom";

import Reveal from '../Reveal.jsx'
import './BottomSection.css'

function BottomSection() {
  return (
      <footer className="site-footer">
          <div className="container">
              <Reveal className="cta-panel">
                  <div className="cta-orb" aria-hidden="true" />
                  <p className="eyebrow">
                      <span className="eyebrow-dot" />
                      Let&apos;s work together
                  </p>
                  <h2>Have An Idea Worth Building?</h2>
                  <p className="cta-lede">
                      DevOps practices including CI/CD, application security, and agile
                      methodologies using microservices &amp; serverless &mdash; paired with a focus
                      on the people who use the product.
                  </p>
                  <div className="cta-actions">
                      <Link className="btn btn-primary" to="/contact">
                          Start a Conversation
                      </Link>
                      <a className="btn btn-ghost" href={`${import.meta.env.BASE_URL}Randall_Krouth_Resume.pdf`} target="_blank" rel="noopener noreferrer">
                          View Résumé
                      </a>
                  </div>
              </Reveal>

              <div className="footer-main">
                  <div className="footer-brand">
                      <Link to="/" className="brand" aria-label="Randall Krouth, home">
                          <span className="brand-mark" aria-hidden="true">RK</span>
                          <span className="footer-brand-name">Randall Krouth</span>
                      </Link>
                      <p>
                          Full-Stack Developer and ML Engineer building thoughtful, resilient
                          products from research through release.
                      </p>
                  </div>

                  <button
                      type="button"
                      className="to-top"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                      Back to Top
                  </button>
              </div>

              <div className="footer-bottom">
                  <span>&copy; {new Date().getFullYear()} Randall Krouth</span>
                  <span>Designed &amp; Built with React</span>
              </div>
          </div>
      </footer>
  );
}

export default BottomSection;