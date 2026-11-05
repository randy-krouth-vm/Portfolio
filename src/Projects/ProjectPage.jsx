import { Link, useParams } from "react-router-dom";

import Reveal from "../Reveal.jsx";
import { getProject, projectImage } from "./projects.js";
import "./ProjectPage.css";

function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);

  if (!project) {
    return (
      <main className="section project-missing">
        <div className="container">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Projects
          </p>
          <h1 className="page-title">Project not found.</h1>
          <p className="page-lede">
            That project page doesn&apos;t exist yet. Head back to the work section to
            browse the current projects.
          </p>
          <Link to="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="project-page">
      <header className="page-hero project-hero">
        <div className="container">
          <Link to="/projects" className="project-back">
            <span aria-hidden="true">&larr;</span>
            All projects
          </Link>

          <Reveal>
            <div className="project-eyebrow-row">
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Project in progress
              </p>
              <span className="project-wip">WIP</span>
            </div>
            <h1 className="page-title">{project.title}</h1>
            <p className="page-lede">{project.description}</p>
            <ul className="project-tags" aria-label="Project technologies">
              {project.stack.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </header>

      <section className="section project-body">
        <div className="container project-layout">
          <Reveal as="figure" className="project-figure">
            <div className="project-figure-media">
              <img src={projectImage(project.image)} alt={project.title} />
            </div>
            <figcaption>{project.caption}</figcaption>
          </Reveal>

          <Reveal as="aside" className="project-aside" delay={80}>
            <span className="project-aside-kicker">Project snapshot</span>
            <h2>The short version.</h2>
            <p>{project.snapshot ?? project.description}</p>

            <dl className="project-facts">
              <div>
                <dt>Focus</dt>
                <dd>{project.caption}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.stack.join(" \u00b7 ")}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>In progress</dd>
              </div>
            </dl>

            <Link to="/projects" className="btn btn-ghost">
              Back to all projects
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default ProjectPage;
