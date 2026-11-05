import { Link } from "react-router-dom";

import Reveal from "../Reveal.jsx";
import { PROJECTS, projectImage } from "./projects.js";
import "./ProjectsPage.css";

function ProjectsPage() {
  return (
    <main className="projects-page">
      <header className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Projects
            </p>
            <div className="projects-title-row">
              <h1 className="page-title">Projects in Progress.</h1>
              <span className="projects-count">{PROJECTS.length} in progress</span>
            </div>
            <p className="page-lede">
              A living collection of the applications, tools, and experiments I&apos;m
              currently designing and building. Open any project for a closer look
              at what it is and where it stands.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="projects-grid">
            {PROJECTS.map((project, index) => (
              <Reveal
                as={Link}
                to={`/projects/${project.slug}`}
                className="project-index-card"
                delay={Math.min(index * 35, 350)}
                key={project.slug}
                aria-label={`View ${project.title}`}
              >
                <div className="project-index-media">
                  <img
                    src={projectImage(project.image)}
                    alt={project.title}
                    loading="lazy"
                  />
                </div>
                <div className="project-index-body">
                  <span className="project-index-kicker">{project.caption}</span>
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                  <ul
                    className="project-index-tags"
                    aria-label={`${project.title} technologies`}
                  >
                    {project.stack.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                  <span className="project-index-cta">
                    View project <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProjectsPage;
