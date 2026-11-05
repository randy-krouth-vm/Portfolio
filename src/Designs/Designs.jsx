import { memo, useEffect, useRef, useState } from "react";
import Reveal from '../Reveal.jsx'
import DesignCanvas from "./DesignCanvas.jsx";
import { assetUrl } from "./assets.js";
import SecurityChecklist from "./SecurityChecklist.jsx";
import designsData from "./designs.generated.json";
import './Designs.css'

const DESIGNS = designsData.designs;

const HINTS = {
    canvas: "Zoom with the controls or Alt and the wheel, then drag to pan.",
    checklist: "Tick the checks you have reviewed.",
    image: null,
};

const PreviewBody = memo(function PreviewBody({ design }) {
    if (design.kind === "canvas") return <DesignCanvas design={design} />;
    if (design.kind === "checklist") return <SecurityChecklist design={design} preview />;
    return <img src={assetUrl(design.image)} alt={design.title} loading="lazy" />;
});

/*
    The card artwork is expensive to build, so a preview waits until its card is near
    the viewport. Once mounted it stays mounted, and memo keeps a modal opening from
    re-rendering every preview on the page.
*/
const DesignPreview = memo(function DesignPreview({ design }) {
    const hostRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;
        if (typeof IntersectionObserver === "undefined") {
            setReady(true);
            return undefined;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                setReady(true);
                observer.disconnect();
            },
            { rootMargin: "240px" }
        );
        observer.observe(host);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="design-preview" ref={hostRef}>
            {ready ? <PreviewBody design={design} /> : <span className="design-preview-placeholder" aria-hidden="true" />}
        </div>
    );
});

function Designs() {
    const [openDesign, setOpenDesign] = useState(null);
    const [resetToken, setResetToken] = useState(0);
    useEffect(() => {
        if (!openDesign) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") setOpenDesign(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [openDesign]);

    const open = (design) => {
        setResetToken(0);
        setOpenDesign(design);
    };
    return (
    <main>
        <header className="page-hero">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">
                        <span className="eyebrow-dot" />
                        Designs
                    </p>
                    <h1 className="page-title">Architecture That Holds Up.</h1>
                    <p className="page-lede">
                        Reference designs for delivery pipelines, managed and serverless
                        infrastructure, identity, and security baselines.
                    </p>
                </Reveal>
            </div>
        </header>

        <section className="section">
            <div className="container">
                <div className="design-grid">
                    {DESIGNS.map((design, index) => (
                        <Reveal
                            as="figure"
                            className="design-card"
                            delay={index * 50}
                            key={design.slug}
                        >
                            <div className="design-media" onClick={() => open(design)}>
                                <DesignPreview design={design} />
                            </div>
                            <figcaption>
                                <span>{design.title}</span>
                                <button type="button" className="design-open" onClick={() => open(design)}>
                                    {design.kind === "checklist" ? "Open checklist" : "Open"}
                                </button>
                            </figcaption>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>

        {openDesign ? (
            <div className="designModalBackdrop">
                <div
                    className="designModal"
                    role="dialog"
                    aria-modal="true"
                    aria-label={openDesign.title}
                >
                    <div className="designModalHead">
                        <h2>{openDesign.title}</h2>
                        <div className="designModalActions">
                            {openDesign.kind === "checklist" ? (
                                <button type="button" className="designModalBtn" onClick={() => setResetToken((token) => token + 1)}>
                                    Reset
                                </button>
                            ) : null}
                            <button type="button" className="designModalBtn" onClick={() => setOpenDesign(null)}>
                                Close
                            </button>
                        </div>
                    </div>

                    {HINTS[openDesign.kind] ? <p className="designModalHint">{HINTS[openDesign.kind]}</p> : null}

                    <div className={`designModalFrame designModalFrame--${openDesign.kind}`}>
                        {openDesign.kind === "canvas" ? (
                            <DesignCanvas design={openDesign} readable />
                        ) : openDesign.kind === "checklist" ? (
                            <SecurityChecklist design={openDesign} resetToken={resetToken} />
                        ) : (
                            <img className="designModalImage" src={assetUrl(openDesign.image)} alt={openDesign.title} />
                        )}
                    </div>
                </div>
            </div>
        ) : null}
    </main>
  );
}

export default Designs;
