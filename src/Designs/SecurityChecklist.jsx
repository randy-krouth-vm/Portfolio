import { useEffect, useMemo, useRef, useState } from "react";
import { exportSecurityBaselinePdf } from "./baselinePdf.js";

/*
    Security Baseline is a list of review questions in the drawing, so it is
    rendered as a real, tickable grid instead of positioned labels.
*/

const FILTERS = [
    { id: "all", label: "All" },
    { id: "open", label: "Unmarked" },
    { id: "marked", label: "Marked" },
];

const storageKey = (slug) => `designs.baseline.${slug}`;

const readStored = (slug) => {
    try {
        const raw = window.localStorage.getItem(storageKey(slug));
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
        return new Set();
    }
};

const writeStored = (slug, checked) => {
    try {
        window.localStorage.setItem(storageKey(slug), JSON.stringify([...checked]));
    } catch {
        /* Private mode or a full quota: marks simply stay in memory. */
    }
};

export default function SecurityChecklist({ design, preview = false, resetToken = 0 }) {
    const [checked, setChecked] = useState(() => (preview ? new Set() : readStored(design.slug)));
    const [filter, setFilter] = useState("all");
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState("");
    const lastReset = useRef(resetToken);

    /* Only a changed reset token clears marks, so a remount keeps what was reviewed. */
    useEffect(() => {
        if (lastReset.current === resetToken) return;
        lastReset.current = resetToken;
        const empty = new Set();
        setChecked(empty);
        setFilter("all");
        writeStored(design.slug, empty);
    }, [resetToken, design.slug]);

    const toggle = (label) => {
        setChecked((previous) => {
            const next = new Set(previous);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            writeStored(design.slug, next);
            return next;
        });
    };

    const exportPdf = async () => {
        if (exporting) return;
        setExporting(true);
        setExportError("");
        try {
            await exportSecurityBaselinePdf(design, checked);
        } catch (error) {
            console.error("Security baseline PDF export failed", error);
            setExportError("PDF export failed. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const total = design.items.length;
    const marked = checked.size;
    const percent = total ? Math.round((marked / total) * 100) : 0;

    const numbered = useMemo(
        () => design.items.map((label, index) => ({ label, number: index + 1 })),
        [design.items],
    );

    const visible = useMemo(() => {
        if (preview) return numbered.slice(0, 24);
        if (filter === "open") return numbered.filter((item) => !checked.has(item.label));
        if (filter === "marked") return numbered.filter((item) => checked.has(item.label));
        return numbered;
    }, [checked, filter, numbered, preview]);

    return (
        <div className={`baseline${preview ? " is-preview" : ""}`}>
            {!preview ? (
                <>
                <div className="baseline-bar">
                    <div className="baseline-progress">
                        <div className="baseline-progress-copy">
                            <span className="baseline-progress-count">
                                {marked} of {total} checks marked
                            </span>
                            <span className="baseline-progress-pct">{percent}%</span>
                        </div>
                        <div
                            className="baseline-progress-track"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-valuenow={marked}
                            aria-label="Checks marked"
                        >
                            <span style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                    <div className="baseline-tools">
                        <div className="baseline-filters" role="group" aria-label="Filter checks">
                            {FILTERS.map((option) => {
                                const count =
                                    option.id === "all" ? total
                                    : option.id === "marked" ? marked
                                    : total - marked;
                                return (
                                    <button
                                        type="button"
                                        key={option.id}
                                        className={`baseline-filter${filter === option.id ? " is-active" : ""}`}
                                        aria-pressed={filter === option.id}
                                        onClick={() => setFilter(option.id)}
                                    >
                                        {option.label}
                                        <span className="baseline-filter-count">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            className="baseline-export"
                            onClick={exportPdf}
                            disabled={exporting}
                            aria-label="Export security baseline as a PDF"
                            aria-busy={exporting}
                        >
                            {exporting ? "Preparing PDF…" : "Export PDF"}
                        </button>
                    </div>
                </div>

                {exportError ? (
                    <p className="baseline-export-error" role="alert">
                        {exportError}
                    </p>
                ) : null}
                </>
            ) : null}

            {visible.length ? (
                <ul className="baseline-grid">
                    {visible.map(({ label, number }) => (
                        <li key={label}>
                            <label className={`baseline-item${checked.has(label) ? " is-marked" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={checked.has(label)}
                                    readOnly={preview}
                                    tabIndex={preview ? -1 : undefined}
                                    onChange={preview ? undefined : () => toggle(label)}
                                />
                                {preview ? null : (
                                    <span className="baseline-item-no">{String(number).padStart(2, "0")}</span>
                                )}
                                <span>{label}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="baseline-empty">
                    {filter === "marked"
                        ? "Nothing marked yet — tick checks as you review them."
                        : "All checks are marked."}
                </p>
            )}

            {preview ? (
                <span className="baseline-more">+{total - visible.length} more checks</span>
            ) : null}
        </div>
    );
}
