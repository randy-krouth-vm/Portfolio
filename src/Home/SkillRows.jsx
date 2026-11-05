import Reveal from '../Reveal.jsx'
import './SkillRows.css'

function DesignPreview() {
  return (
    <div className="ui-window" aria-hidden="true">
      <div className="ui-chrome">
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-address" />
      </div>
      <div className="ui-design">
        <div className="ui-rail">
          <span className="ui-rail-mark" />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="ui-canvas">
          <div className="ui-artboard">
            <span className="ui-pill" />
            <span className="ui-line ui-line-strong" />
            <span className="ui-line" />
            <span className="ui-line ui-line-short" />
            <span className="ui-cta" />
          </div>
          <div className="ui-swatches">
            <span className="ui-swatch ui-swatch-brand" />
            <span className="ui-swatch ui-swatch-ink" />
            <span className="ui-swatch ui-swatch-soft" />
          </div>
        </div>
        <div className="ui-panel">
          <span className="ui-panel-head" />
          <span className="ui-field" />
          <span className="ui-field" />
          <span className="ui-field ui-field-short" />
          <span className="ui-field ui-field-tall" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="ui-window" aria-hidden="true">
      <div className="ui-chrome">
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-address" />
      </div>
      <div className="ui-dash">
        <div className="ui-dash-main">
          <div className="ui-kpis">
            <div className="ui-kpi">
              <span className="ui-kpi-label" />
              <span className="ui-kpi-value" />
            </div>
            <div className="ui-kpi">
              <span className="ui-kpi-label" />
              <span className="ui-kpi-value" />
            </div>
            <div className="ui-kpi">
              <span className="ui-kpi-label" />
              <span className="ui-kpi-value" />
            </div>
          </div>
          <div className="ui-chart">
            <svg viewBox="0 0 320 120" preserveAspectRatio="none">
              <path
                d="M0 98 C 26 96, 40 78, 64 82 S 98 96, 120 84 S 152 54, 176 62 S 210 82, 232 66 S 268 30, 292 38 S 312 50, 320 44 L 320 120 L 0 120 Z"
                fill="rgba(41, 181, 232, 0.16)"
              />
              <path
                d="M0 98 C 26 96, 40 78, 64 82 S 98 96, 120 84 S 152 54, 176 62 S 210 82, 232 66 S 268 30, 292 38 S 312 50, 320 44"
                fill="none"
                stroke="#29b5e8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="ui-chart-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="ui-dash-side">
          <span className="ui-ring" />
          <span className="ui-side-line" />
          <span className="ui-side-line ui-side-line-short" />
          <span className="ui-side-line" />
          <span className="ui-side-line ui-side-line-short" />
        </div>
      </div>
    </div>
  );
}

function RealtimePreview() {
  return (
    <div className="ui-window ui-window-dark" aria-hidden="true">
      <div className="ui-chrome ui-chrome-dark">
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-address" />
      </div>
      <div className="ui-viewport">
        <span className="ui-sun" />
        <span className="ui-hill ui-hill-back" />
        <span className="ui-hill ui-hill-mid" />
        <span className="ui-hill ui-hill-front" />
        <span className="ui-grid" />
        <span className="ui-tool" />
        <span className="ui-tool ui-tool-two" />
        <span className="ui-transform">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="ui-timeline">
        <span className="ui-play" />
        <span className="ui-track" />
        <span className="ui-track ui-track-short" />
      </div>
    </div>
  );
}

function BackendPreview() {
  return (
    <div className="ui-window" aria-hidden="true">
      <div className="ui-chrome">
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-dot" />
        <span className="ui-address" />
      </div>
      <div className="ui-backend">
        <div className="ui-backend-side">
          <span className="ui-backend-mark" />
          <span className="ui-route ui-route-active" />
          <span className="ui-route" />
          <span className="ui-route" />
          <span className="ui-route" />
          <span className="ui-backend-divider" />
          <span className="ui-route" />
          <span className="ui-route" />
          <span className="ui-route" />
        </div>
        <div className="ui-backend-main">
          <div className="ui-request">
            <span className="ui-method" />
            <span className="ui-path" />
            <span className="ui-response" />
          </div>
          <div className="ui-code">
            <span className="ui-code-row">
              <span className="ui-code-key" />
              <span className="ui-code-value" />
            </span>
            <span className="ui-code-line ui-code-indent" />
            <span className="ui-code-row">
              <span className="ui-code-key" />
              <span className="ui-code-value ui-code-value-short" />
            </span>
            <span className="ui-code-line ui-code-indent" />
            <span className="ui-code-line" />
            <span className="ui-code-row">
              <span className="ui-code-key" />
              <span className="ui-code-value ui-code-value-wide" />
            </span>
            <span className="ui-code-line ui-code-indent" />
            <span className="ui-code-line ui-code-indent" />
            <span className="ui-code-line" />
          </div>
          <div className="ui-log">
            <span className="ui-log-dot" />
            <span className="ui-log-line" />
            <span className="ui-log-line ui-log-line-short" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SKILLS = [
  {
    preview: <DesignPreview />,
    title: "UX Research & Product Design",
    body: "Conduct UX research, usability studies, and design user experiences that feel effortless from the first interaction.",
    tags: ["UX research", "Design systems", "Prototyping", "Adobe", "Figma"],
  },
  {
    preview: <AnalyticsPreview />,
    title: "Machine Learning & Analytics",
    body: "Machine learning, hyperparameter tuning, predictive analytics, and time series generators.",
    tags: ["Python", "ML.NET", "Data visualization", "PyTorch", "Tensorflow"],
  },
  {
    preview: <RealtimePreview />,
    title: "Real-time Visual Engineering",
    body: "Exploring environment composition, lighting, and shader workflows. Blending art and direction with technical implementations to push the boundaries of what's possible in interactive worlds.",
    tags: ["Unity", "Unreal Engine", "Shaders", "Blender"],
  },
  {
    preview: <BackendPreview />,
    title: "Backend Development",
    body: "Building APIs, data models, and distributed services with security, observability, and deployment baked in from the start.",
    tags: ["C# / .NET", "SQL", "Docker", "Kafka", "Python"],
  },
];

function SkillRows() {
  return (
    <div className="skill-rows">
      {SKILLS.map((skill, index) => (
        <Reveal
          as="article"
          className="skill-row"
          delay={index * 80}
          key={skill.title}
        >
          <div className="skill-preview">{skill.preview}</div>
          <div className="skill-copy">
            <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{skill.title}</h3>
            <p>{skill.body}</p>
            <ul className="skill-tags">
              {skill.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default SkillRows;
