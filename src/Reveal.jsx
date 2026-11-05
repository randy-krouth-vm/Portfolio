import { createElement, useEffect, useRef } from "react";

/*
    Fades content in the first time it scrolls into view.
    Falls back to visible content when IntersectionObserver is unavailable
    or the visitor prefers reduced motion.
*/
export default function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

        if (typeof IntersectionObserver === "undefined" || reduceMotion) {
            node.classList.add("is-visible");
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return createElement(
        Tag,
        {
            ref,
            className: `reveal ${className}`.trim(),
            style: { "--reveal-delay": `${delay}ms` },
            ...rest,
        },
        children
    );
}
