import { useEffect, useMemo, useRef, useState } from "react";
import "./Certificates.css";

const PREVIEWS_ENABLED = true;

const PINNED_TOP_ORDER = [
  /ibm_full_stack_software_developer/i,
  /ibm_devops_and_software_engineering/i,
  /learnquest_advanced_network_security/i,
  /ucdavis_secure_coding_practices/i,
  /ibm_back_end_development/i,
  /google_ux_design/i,
  /google_advanced_data_analytics/i,
  /google_cybersecurity/i,
  /learnkarts_ethical_hacking/i,
  /adobe_graphic_designer/i,
  /university_of_colorado_cyber_security_for_business/i,
  /try_hack_me_devsecops/i,
  /ibm_it_fundamentals_for_cybersecurity/i,
  /ibm_applied_software_engineering_fundamentals/i,
  /try_hack_me_security_engineer/i,
  /ibm_security_analyst_fundamentals/i
];

const isSoloLearn = (name) => /^sololearn_/i.test(name);
const isAssessment = (name) => /(assessment|assement|assemeent|assessement)/i.test(name);
const getPinnedTopIndex = (name) => (isAssessment(name) ? -1 : PINNED_TOP_ORDER.findIndex((rx) => rx.test(name)));

const normalizeTitle = (filename) =>
  filename
    .replace(/\.[^.]+$/, "")
    .replaceAll("_", " ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bLearnkart\s+S\b/gi, "LearnkartS")
    .replace(/\bTry\s+Hack\s+Me\b/gi, "TryHackMe")
    .replace(/\bDev\s+Sec\s+Ops\b/gi, "DevSecOps")
    .replace(/\bDev\s+Ops\b/gi, "DevOps")
    .replace(/\bJava\s+Script\b/gi, "JavaScript")
    .replace(/\bPy\s+Torch\b/gi, "PyTorch")
    .replace(/\bLL\s+Ms\b/gi, "LLMs")
    .replace(/\b3\s+D\b/g, "3D")
    .replace(/\s+/g, " ")
    .trim();

const parseStamp = (value) => {
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
};

const hashRank = (input) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const isSafeRelativePath = (value) => {
  if (typeof value !== "string") return false;
  const normalized = value.replaceAll("\\", "/").trim();
  if (!normalized) return false;
  if (normalized.startsWith("/") || normalized.includes("://")) return false;
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  if (segments.some((segment) => segment === "." || segment === "..")) return false;
  return segments.every((segment) => /^[A-Za-z0-9._-]+$/.test(segment));
};

const withBaseUrl = (value) => {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanValue = (value || "").replace(/^\/+/, "");
  return `${cleanBase}${cleanValue}`;
};

const toWebPath = (value) => {
  if (!isSafeRelativePath(value)) return null;
  const normalized = (value || "").replaceAll("\\", "/");
  const encoded = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return withBaseUrl(encoded);
};

function CertificateCard({
  card,
  fileUrl,
  rawFileUrl,
  thumbUrl,
  dragEnabled,
  isDropTarget,
  isDragging,
  suppressClickRef,
  onOpen,
  onDropCard,
  setDraggedName,
  setDropName,
  draggedName
}) {
  const primaryImageUrl = card.fileType === "image" ? fileUrl : thumbUrl;
  const [imageSrc, setImageSrc] = useState(primaryImageUrl);
  const [usedFallback, setUsedFallback] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageSrc(primaryImageUrl);
    setUsedFallback(false);
    setImageBroken(false);
  }, [primaryImageUrl]);

  return (
    <article
      className={`certCard${dragEnabled ? " certCardDraggable" : ""}${isDropTarget ? " certCardDropTarget" : ""}${isDragging ? " certCardDragging" : ""}`}
      draggable={dragEnabled}
      onDragStart={(event) => {
        if (!dragEnabled) return;
        suppressClickRef.current = true;
        setDraggedName(card.name);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.name);
      }}
      onDragOver={(event) => {
        if (!dragEnabled || draggedName === card.name) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropName(card.name);
      }}
      onDrop={(event) => {
        if (!dragEnabled) return;
        event.preventDefault();
        const fromName = event.dataTransfer.getData("text/plain") || draggedName;
        onDropCard(fromName, card.name);
        setDropName(null);
        setDraggedName(null);
      }}
      onDragEnd={() => {
        setDropName(null);
        setDraggedName(null);
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }}
      onDragLeave={() => {
        if (isDropTarget) setDropName(null);
      }}
    >
      <button
        type="button"
        className="certCardBtn"
        onClick={() => {
          if (suppressClickRef.current) return;
          onOpen();
        }}
        aria-label={`Open preview for ${card.title}`}
      >
        <div className="certThumbFrame">
          {card.fileType === "image" ? (
            imageBroken ? (
              <div className="certThumb certPlaceholder">IMAGE</div>
            ) : (
              <img
                className={`certThumb${card.isThm ? " certThumbThm" : ""}`}
                src={imageSrc}
                alt={card.title}
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={() => {
                  if (!usedFallback && rawFileUrl && imageSrc !== rawFileUrl) {
                    setUsedFallback(true);
                    setImageSrc(rawFileUrl);
                    return;
                  }
                  setImageBroken(true);
                }}
              />
            )
          ) : card.isPdf && thumbUrl ? (
            <img
              className={`certThumb${card.isThm ? " certThumbThm" : ""}`}
              src={imageSrc}
              alt={card.title}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div className="certThumb certPlaceholder">{(card.extension || "file").replace(".", "").toUpperCase()}</div>
          )}
        </div>
        <h2 title={card.title}>{card.title}</h2>
      </button>
    </article>
  );
}

export default function Certificates() {
  const [manifest, setManifest] = useState({ files: [] });
  const [selectedCard, setSelectedCard] = useState(null);
  const [customOrder, setCustomOrder] = useState([]);
  const [draggedName, setDraggedName] = useState(null);
  const [dropName, setDropName] = useState(null);
  const suppressClickRef = useRef(false);
  const shuffleSeedRef = useRef(`seed:${Date.now()}:${Math.random()}`);

  useEffect(() => {
    const load = async () => {
      try {
        const manifestRes = await fetch(withBaseUrl("certificates-manifest.json"));
        const manifestData = await manifestRes.json();
        const safeFiles = Array.isArray(manifestData?.files)
          ? manifestData.files.filter(
              (entry) =>
                typeof entry?.name === "string" &&
                isSafeRelativePath(entry?.relativePath) &&
                (!entry?.thumbRelativePath || isSafeRelativePath(entry.thumbRelativePath))
            )
          : [];
        setManifest({ ...manifestData, files: safeFiles });
      } catch {
        setManifest({ files: [] });
      }
    };

    load();
  }, []);

  const cards = useMemo(() => {
    const mapped = (manifest.files || []).map((entry) => ({
      ...entry,
      title: normalizeTitle(entry.name),
      createdMs: parseStamp(entry.createdAt),
      isPdf: entry.extension?.toLowerCase() === ".pdf",
      isThm: /(^THM_|try\s*hack\s*me)/i.test(entry.name),
      isAssessment: isAssessment(entry.name),
      pinnedTopIndex: getPinnedTopIndex(entry.name),
      isSolo: isSoloLearn(entry.name),
      randomRank: hashRank(`${shuffleSeedRef.current}:${entry.name}`)
    }));

    const defaultSorted = mapped.sort((a, b) => {
      const aPinned = a.pinnedTopIndex >= 0;
      const bPinned = b.pinnedTopIndex >= 0;
      if (aPinned && bPinned) return a.pinnedTopIndex - b.pinnedTopIndex;
      if (aPinned) return -1;
      if (bPinned) return 1;

      if (a.isAssessment && b.isAssessment) return a.randomRank - b.randomRank;
      if (a.isAssessment) return 1;
      if (b.isAssessment) return -1;

      if (a.isSolo && b.isSolo) return a.randomRank - b.randomRank;
      if (a.isSolo) return 1;
      if (b.isSolo) return -1;

      return a.randomRank - b.randomRank;
    });

    if (customOrder.length === 0) return defaultSorted;

    const orderMap = new Map(customOrder.map((name, index) => [name, index]));
    const defaultIndexMap = new Map(defaultSorted.map((item, index) => [item.name, index]));

    return [...defaultSorted].sort((a, b) => {
      const ai = orderMap.has(a.name) ? orderMap.get(a.name) : Number.MAX_SAFE_INTEGER;
      const bi = orderMap.has(b.name) ? orderMap.get(b.name) : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;

      const ad = defaultIndexMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
      const bd = defaultIndexMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
  }, [manifest.files, customOrder]);

  const moveByDrop = (fromName, toName) => {
    if (!fromName || !toName || fromName === toName) return;

    setCustomOrder((prev) => {
      const next = prev.length > 0 ? [...prev] : cards.map((c) => c.name);
      const fromIndex = next.indexOf(fromName);
      const toIndex = next.indexOf(toName);
      if (fromIndex < 0 || toIndex < 0) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromName);
      return next;
    });
  };

  return (
    <main className="certPage">
      <section className="certGrid" aria-label="file cards">
        {cards.map((card) => {
          const fileUrl = toWebPath(card.relativePath) || "";
          const rawFileUrl = toWebPath(card.relativePath) || "";
          const thumbUrl = card.thumbRelativePath ? toWebPath(card.thumbRelativePath) : null;

          return (
            <CertificateCard
              key={card.name}
              card={card}
              fileUrl={fileUrl}
              rawFileUrl={rawFileUrl}
              thumbUrl={thumbUrl}
              dragEnabled={true}
              isDropTarget={dropName === card.name}
              isDragging={draggedName === card.name}
              suppressClickRef={suppressClickRef}
              onOpen={() => {
                if (!PREVIEWS_ENABLED) {
                  if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
                  return;
                }
                setSelectedCard({ ...card, fileUrl });
              }}
              onDropCard={moveByDrop}
              setDraggedName={setDraggedName}
              setDropName={setDropName}
              draggedName={draggedName}
            />
          );
        })}
      </section>

      {PREVIEWS_ENABLED && selectedCard ? (
        <div className="certModalBackdrop" onClick={() => setSelectedCard(null)}>
          <div
            className={`certModal${selectedCard.fileType === "image" ? " certModalImageMode" : " certModalDocMode"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="certCloseBtn" onClick={() => setSelectedCard(null)}>
              Close
            </button>
            <h3>{selectedCard.title}</h3>
            <div className={`certModalFrame${selectedCard.fileType === "image" ? " certModalFrameImage" : " certModalFrameDoc"}`}>
              {selectedCard.fileType === "image" ? (
                <img className="certModalMedia certModalImage" src={selectedCard.fileUrl} alt={selectedCard.title} />
              ) : selectedCard.isPdf ? (
                <object
                  className="certModalMedia certModalPdf"
                  data={`${selectedCard.fileUrl}#page=1&view=FitH`}
                  type="application/pdf"
                  aria-label={`${selectedCard.title} full preview`}
                >
                  <div className="certPlaceholder">PDF preview unavailable</div>
                </object>
              ) : (
                <div className="certPlaceholder certModalMedia certModalPdf">Preview unavailable</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}



