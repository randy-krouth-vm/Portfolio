import { Link } from "react-router-dom";

import Reveal from '../Reveal.jsx'
import './Skills.css'

const SKILLS = [
    {
        title: "UX/UI Design",
        body: "Research, wireframes, usability studies, and high-fidelity interfaces.",
    },
    {
        title: "Front-End Development",
        body: "Accessible, responsive React interfaces with considered motion.",
    },
    {
        title: "Machine Learning",
        body: "Predictive analytics, model tuning, and time series tooling.",
    },
    {
        title: "Back-End Development",
        body: "APIs, services, and integrations designed to scale.",
    },
    {
        title: "Game Design",
        body: "Interactive systems, level design, and real-time visuals.",
    },
    {
        title: "Data Analytics",
        body: "Dashboards and data models that turn raw inputs into decisions.",
    },
];

function Skills() {
    return (
    <main>
        <header className="page-hero">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">
                        <span className="eyebrow-dot" />
                        Skills
                    </p>
                    <h1 className="page-title">A Toolkit For the Whole Process.</h1>
                    <p className="page-lede">
                        Design, engineering, and analysis &mdash; the disciplines I move
                        between to take an idea from concept to a shipped, maintainable
                        product.
                    </p>
                </Reveal>
            </div>
        </header>

        <section className="section">
            <div className="container">
                <div className="skill-grid">
                    {SKILLS.map((skill, index) => (
                        <Reveal
                            as="article"
                            className="skill-card"
                            delay={index * 60}
                            key={skill.title}
                        >
                            <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
                            <h2>{skill.title}</h2>
                            <p>{skill.body}</p>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="skills-cta" delay={120}>
                    <div>
                        <h2>Want to see it in practice?</h2>
                        <p>Explore the designs and certifications behind the work.</p>
                    </div>
                    <Link className="btn btn-primary" to="/contact">Get in touch</Link>
                </Reveal>
            </div>
        </section>
    </main>
  );
}

export default Skills;