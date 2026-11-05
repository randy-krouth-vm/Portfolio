/*
    Converts Designs.drawio into data the site can render as real UI objects.

    Outputs:
      src/Designs/designs.generated.json  – positioned nodes, labels, and edges per design
      public/designs_gl/<hash>.png        – icon bitmaps extracted from the drawing

    Run with: npm run build:designs
*/

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const drawioPath = path.join(root, "Designs.drawio");
const outputPath = path.join(root, "src", "Designs", "designs.generated.json");
const iconDir = path.join(root, "public", "designs_gl");

/* Card order/labels shown on the /designs page. `group` is the top-level cell in the drawing. */
const DESIGNS = [
    {
        slug: "cicd",
        title: "CI/CD Pipeline",
        kind: "pipeline",
    },
    {
        slug: "self-managed",
        title: "Self-Managed Industry Standard Design",
        group: "fjQrz3hnMPhjCWTDFtm6-4",
    },
    {
        slug: "managed-secure",
        title: "Managed Industry Standard Design With Security",
        group: "fjQrz3hnMPhjCWTDFtm6-6",
    },
    {
        slug: "serverless-secure",
        title: "Serverless Industry Standard Design With Security",
        group: "fjQrz3hnMPhjCWTDFtm6-8",
    },
    {
        slug: "cost-effective",
        title: "Cost-Effective Solution",
        kind: "hybrid",
    },
    {
        slug: "encryption",
        title: "Encryption Guidelines",
        group: "fjQrz3hnMPhjCWTDFtm6-12",
    },
    {
        slug: "authentication",
        title: "Authentication Identity Control Layer",
        group: "fjQrz3hnMPhjCWTDFtm6-51",
        extras: ["fjQrz3hnMPhjCWTDFtm6-52"],
    },
    {
        slug: "security-baseline",
        title: "Security Baseline",
        kind: "checklist",
        group: "fjQrz3hnMPhjCWTDFtm6-10",
        extraLabels: ["fjQrz3hnMPhjCWTDFtm6-9"],
    },
];

/* ---------- drawing parse ---------- */

const xml = fs.readFileSync(drawioPath, "utf8");

const attr = (attrs, name) => {
    const match = attrs.match(new RegExp("(?:^|\\s)" + name + '="([^"]*)"'));
    return match ? match[1] : null;
};

const CELL_RE = /<mxCell\b([^>]*?)(\/>|>([\s\S]*?)<\/mxCell>)/g;
const cells = [];
let match;
while ((match = CELL_RE.exec(xml))) {
    const attrs = match[1];
    const body = match[3] || "";
    const geometryMatch = body.match(/<mxGeometry\b([^>]*?)(\/>|>[\s\S]*?<\/mxGeometry>)/);
    let geometry = null;
    if (geometryMatch) {
        const num = (name) => {
            const found = geometryMatch[1].match(new RegExp("(?:^|\\s)" + name + '="([^"]*)"'));
            return found ? Number(found[1]) : null;
        };
        geometry = { x: num("x"), y: num("y"), width: num("width"), height: num("height") };
    }
    cells.push({
        id: attr(attrs, "id"),
        parent: attr(attrs, "parent"),
        vertex: attr(attrs, "vertex") === "1",
        edge: attr(attrs, "edge") === "1",
        source: attr(attrs, "source"),
        target: attr(attrs, "target"),
        value: attr(attrs, "value") || "",
        style: attr(attrs, "style") || "",
        geometry,
        body,
    });
}

const byId = new Map(cells.map((cell) => [cell.id, cell]));
const childrenOf = new Map();
for (const cell of cells) {
    if (!cell.parent) continue;
    if (!childrenOf.has(cell.parent)) childrenOf.set(cell.parent, []);
    childrenOf.get(cell.parent).push(cell);
}
const kids = (id) => childrenOf.get(id) || [];

/* ---------- style/value helpers ---------- */

const unescapeXml = (text) =>
    text
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#10;/g, "\n")
        .replace(/&#13;/g, "\n")
        .replace(/&amp;/g, "&");

const labelOf = (value) =>
    unescapeXml(unescapeXml(value))
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(div|p)>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

const styleProp = (style, name) => {
    const found = style.match(new RegExp("(?:^|;)" + name + "=([^;]*)"));
    return found ? found[1] : null;
};

const fontSizeOf = (style, value) => {
    const inline = unescapeXml(unescapeXml(value)).match(/font-size:\s*(\d+(?:\.\d+)?)px/i);
    const declared = styleProp(style, "fontSize");
    return Number(inline?.[1] || declared || 12);
};

/* The drawing is authored white-on-black; the site renders it on white paper instead. */
const INK = "#33475f";
const RULE = "#93a8bb";
/* Colour the authored designs use for their connectors, matching the drawn designs. */
const CONNECTOR = "#4c5761";

const darkenForPaper = (hex) => {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    if (!/^[0-9a-f]{6}$/i.test(full)) return hex;
    const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    const luminance = (0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]) / 255;
    if (luminance < 0.55) return `#${full.toLowerCase()}`;
    return `#${channels.map((c) => Math.round(c * 0.52).toString(16).padStart(2, "0")).join("")}`;
};

/* Text at this size and above is a page title; the card already shows it. */
const TITLE_SIZE = 30;

const colorOf = (value, fallback) => {
    if (!value || value === "none" || value === "default") return fallback;
    /* draw.io writes theme-aware ink as a CSS light-dark() pair; the light value is the real colour. */
    const themed = value.match(/^#?light-dark\(\s*([^,)]+)/i);
    const ink = themed ? themed[1].trim() : value;
    const hex = ink.startsWith("#") ? ink : `#${ink}`;
    if (/^#(fff|ffffff)$/i.test(hex)) return fallback;
    return darkenForPaper(hex);
};

const isImageCell = (cell) => /shape=image/.test(cell.style) || /(?:^|;)image=/.test(cell.style) || /^image[;,]/.test(cell.style);

/* ---------- icons ---------- */

/* Stock artwork in the drawing, replaced by the custom set in DesignIcons.jsx. */
const ICON_ROLES = {
    "5f7b6b369ef4": "browser",
    "e35ed319ba2e": "database",
    "79518a4eecc4": "cache",
    "1e65630db06e": "gateway",
    "e0fd2bcd8278": "loadbalancer",
    "19a5f0bf899b": "firewall",
    "0e09e0451da9": "queue",
    "f225be3b506f": "compute",
    "ca397e81ecfc": "identity",
    "92687e2d6186": "ledger",
    "0fa9c59199bc": "users",
    "11656aaa0a11": "analytics",
};

fs.rmSync(iconDir, { recursive: true, force: true });

const iconFor = (style) => {
    const found = style.match(/image=data:image\/([a-z+0-9]+)[;,]([^;]+)/i);
    if (!found) return null;
    const [, mime, payload] = found;
    const bytes = mime === "svg+xml" ? Buffer.from(decodeURIComponent(payload), "utf8") : Buffer.from(payload, "base64");
    const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 12);

    const role = ICON_ROLES[hash];
    if (role) return { icon: role };

    /* Unmapped artwork falls back to the extracted bitmap. */
    const extension = mime === "svg+xml" ? "svg" : mime === "jpeg" ? "jpg" : mime;
    const file = `${hash}.${extension}`;
    fs.mkdirSync(iconDir, { recursive: true });
    const target = path.join(iconDir, file);
    if (!fs.existsSync(target)) fs.writeFileSync(target, bytes);
    return { src: `designs_gl/${file}` };
};

/* ---------- layout flattening ---------- */

const absoluteRects = (group) => {
    /* Maps every vertex below `group` to a rectangle relative to the group origin. */
    const rects = new Map();
    const walk = (id, offsetX, offsetY) => {
        for (const child of kids(id)) {
            if (!child.vertex || !child.geometry) continue;
            const x = offsetX + (child.geometry.x || 0);
            const y = offsetY + (child.geometry.y || 0);
            rects.set(child.id, { x, y, width: child.geometry.width || 0, height: child.geometry.height || 0 });
            walk(child.id, x, y);
        }
    };
    walk(group.id, 0, 0);
    return rects;
};

const designMeta = new Map();

/* cellId -> { slug, itemId } for every node that a connector can point at. */
const cellOwners = new Map();
const registerOwner = (slug, itemId, startId) => {
    cellOwners.set(startId, { slug, itemId });
    for (const child of kids(startId)) {
        if (child.vertex) registerOwner(slug, itemId, child.id);
    }
};

const resolveOwner = (cellId) => {
    let current = byId.get(cellId);
    while (current) {
        const owner = cellOwners.get(current.id);
        if (owner) return owner;
        current = byId.get(current.parent);
    }
    return null;
};

const partFor = (cell, rect, itemRect) => {
    const label = labelOf(cell.value);
    const base = {
        x: round(rect.x - itemRect.x),
        y: round(rect.y - itemRect.y),
        w: round(rect.width),
        h: round(rect.height),
    };

    if (isImageCell(cell)) {
        const art = iconFor(cell.style);
        if (!art) return null;
        return { ...base, type: "icon", ...art };
    }

    if (/(?:^|;)text(?:;|$)/.test(cell.style) || /^text;/.test(cell.style)) {
        if (!label) return null;
        /* The drawing's own headline duplicates the card title, so it is left out. */
        if (fontSizeOf(cell.style, cell.value) >= TITLE_SIZE) return null;
        return {
            ...base,
            type: "text",
            label,
            size: fontSizeOf(cell.style, cell.value),
            color: colorOf(styleProp(cell.style, "fontColor"), INK),
            align: styleProp(cell.style, "align") || "center",
            valign: styleProp(cell.style, "verticalAlign") || "middle",
            bold: /fontStyle=1|fontStyle=3|fontStyle=5/.test(cell.style),
        };
    }

    const fill = styleProp(cell.style, "fillColor");
    const stroke = styleProp(cell.style, "strokeColor");
    const strokeWidth = Number(styleProp(cell.style, "strokeWidth") || 0);
    const hasFill = fill && fill !== "none" && fill !== "default";
    const hasStroke = stroke && stroke !== "none" && stroke !== "default" && strokeWidth > 0;
    const rounded = styleProp(cell.style, "rounded") === "1";

    if (!hasFill && !hasStroke && !label) return null;
    /* An unstroked page heading duplicates the card title, so it is left out. */
    if (!hasStroke && fontSizeOf(cell.style, cell.value) >= TITLE_SIZE) return null;

    return {
        ...base,
        type: "box",
        label,
        size: fontSizeOf(cell.style, cell.value),
        color: colorOf(styleProp(cell.style, "fontColor"), INK),
        align: styleProp(cell.style, "align") || "center",
        valign: styleProp(cell.style, "verticalAlign") || "middle",
        fill: hasFill ? colorOf(fill, "transparent") : "transparent",
        stroke: hasStroke ? colorOf(stroke, RULE) : "transparent",
        strokeWidth: hasStroke ? strokeWidth : 0,
        dashed: styleProp(cell.style, "dashed") === "1",
        rounded,
    };
};

const round = (value) => Math.round(value * 100) / 100;

const EDGE_ARROWS = {
    classic: "arrow",
    block: "arrow",
    open: "open",
    oval: "arrow",
};

/*
    Artwork and connectors the drawing lost when it was rebuilt from the deck slides.
    Icons are placed above the text label they belong to; links connect two labels.
*/
const SUPPLEMENTS = {
    authentication: {
        icons: [
            { match: "Root CA Offline", role: "certificate" },
            { match: "HSM", role: "hsm" },
            { match: "HashiCorp Vault", role: "vault" },
            { match: "API Secrets Manager", role: "key" },
            { match: "Creates Leaf Certificates", role: "certificate" },
            { match: "Kerberos orLDAP", role: "vault" },
            { match: "Users", role: "users" },
        ],
        links: [
            ["Users", "API Gateway"],
            ["Identity Provider", "Users", { startArrow: "arrow" }],
            ["HSM", "Root CA Offline"],
            ["HashiCorp Vault", "HSM"],
            ["HashiCorp Vault", "API Proxy"],
            ["Web Service API", "Kerberos orLDAP", { startArrow: "arrow" }],
            ["API Proxy", "API Secrets Manager"],
            ["API Gateway", "Web Service API"],
        ],
    },
    encryption: {
        icons: [
            { match: "HSM", role: "hsm" },
            { match: "Resource encryption", role: "cipher", all: true },
            { match: "User Secret or Alias", role: "key" },
            { match: "Salt to prevent", role: "salt" },
            { match: "TPM, vTPM Capable Server", role: "tpm" },
            { match: "Encrypted/Decrypted Data", role: "cipher" },
            { match: "Encrypted Data", role: "cipher" },
            { match: "API Service", role: "vault" },
            { match: "Provides Wrapped DEK", role: "lock" },
        ],
        links: [
            ["HSM", "Resource encryption"],
            ["Resource encryption", "TPM, vTPM Capable Server"],
            ["TPM, vTPM Capable Server", "Encrypted/Decrypted Data", { startArrow: "arrow" }],
            ["Encrypted/Decrypted Data", "Web Service API", { startArrow: "arrow" }],
            ["Web Service API", "Encrypted Data"],
            ["User Secret or Alias", "Web Service API"],
            ["API Service", "TPM, vTPM Capable Server", { startArrow: "arrow" }],
        ],
    },
    "serverless-secure": {
        icons: [
            { match: "API Secrets Manager", role: "key" },
            { match: "Connection Pooling", role: "pool", all: true },
            { match: "SIEM", role: "rack" },
            { match: "SOAR", role: "rack" },
            { match: "Content Delivery Network", role: "rack" },
        ],
    },
    "managed-secure": {
        icons: [
            { match: "API Secrets Manager", role: "key" },
            { match: "Connection Pooling", role: "pool" },
            { match: "SIEM", role: "rack" },
            { match: "SOAR", role: "rack" },
            { match: "Content Delivery Network", role: "rack" },
        ],
    },
    "self-managed": {
        icons: [],
    },
};

const buildCanvasDesign = (config) => {
    const group = byId.get(config.group);
    const rects = absoluteRects(group);
    const extraIds = config.extras || [];
    const extraRects = new Map();
    for (const id of extraIds) {
        const cell = byId.get(id);
        if (!cell?.geometry) continue;
        extraRects.set(id, {
            x: (cell.geometry.x || 0) - (group.geometry.x || 0),
            y: (cell.geometry.y || 0) - (group.geometry.y || 0),
            width: cell.geometry.width || 0,
            height: cell.geometry.height || 0,
        });
        const walkExtras = (parentId, offsetX, offsetY) => {
            for (const child of kids(parentId)) {
                if (!child.vertex || !child.geometry) continue;
                const x = offsetX + (child.geometry.x || 0);
                const y = offsetY + (child.geometry.y || 0);
                extraRects.set(child.id, { x, y, width: child.geometry.width || 0, height: child.geometry.height || 0 });
                walkExtras(child.id, x, y);
            }
        };
        walkExtras(id, extraRects.get(id).x, extraRects.get(id).y);
    }

    const allRects = new Map([...rects, ...extraRects]);
    const itemIds = [
        ...kids(group.id).filter((cell) => cell.vertex).map((cell) => cell.id),
        ...extraIds,
    ];

    const items = [];
    for (const id of itemIds) {
        const cell = byId.get(id);
        const own = allRects.get(id);
        if (!cell || !own) continue;

        /* Union of the item's own rectangle and everything nested below it. */
        const memberIds = [id];
        const collect = (parentId) => {
            for (const child of kids(parentId)) {
                if (!child.vertex) continue;
                if (!allRects.has(child.id)) continue;
                memberIds.push(child.id);
                collect(child.id);
            }
        };
        collect(id);

        const bounds = memberIds.reduce(
            (acc, memberId) => {
                const r = allRects.get(memberId);
                return {
                    minX: Math.min(acc.minX, r.x),
                    minY: Math.min(acc.minY, r.y),
                    maxX: Math.max(acc.maxX, r.x + r.width),
                    maxY: Math.max(acc.maxY, r.y + r.height),
                };
            },
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        );

        const itemRect = { x: bounds.minX, y: bounds.minY, width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };

        const parts = [];
        for (const memberId of memberIds) {
            const member = byId.get(memberId);
            if (!member || /(?:^|;)group(?:;|$)/.test(member.style)) continue;
            const part = partFor(member, allRects.get(memberId), itemRect);
            if (part) parts.push(part);
        }
        if (!parts.length) continue;

        items.push({
            id,
            x: round(itemRect.x),
            y: round(itemRect.y),
            w: round(itemRect.width),
            h: round(itemRect.height),
            parts,
        });
        registerOwner(config.slug, id, id);
    }

    const xs = items.flatMap((item) => [item.x, item.x + item.w]);
    const ys = items.flatMap((item) => [item.y, item.y + item.h]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    let width = Math.max(...xs) - minX;
    let height = Math.max(...ys) - minY;

    const padding = 24;
    const shiftX = -minX + padding;
    const shiftY = -minY + padding;
    for (const item of items) {
        item.x = round(item.x + shiftX);
        item.y = round(item.y + shiftY);
    }

    /*
        The reference decks carried artwork that the drawing now only labels, so those
        icons are restored from the label they sit above, and arrows between labels can
        be declared by matching their text instead of by drawing coordinates.
    */
    const supplements = SUPPLEMENTS[config.slug] || {};
    const textAnchors = (needle) => {
        const key = needle.toLowerCase();
        const found = [];
        for (const item of items) {
            for (const part of item.parts) {
                if (part.type !== "text" || !part.label) continue;
                const text = part.label.trim().toLowerCase();
                if (!text.includes(key)) continue;
                /* A label that opens with the phrase wins over one that merely mentions it. */
                const score = text === key ? 0 : text.startsWith(key) ? 1 : 2;
                found.push({ item, part, score });
            }
        }
        return found.sort(
            (a, b) =>
                a.score - b.score ||
                a.item.y + a.part.y - (b.item.y + b.part.y) ||
                a.item.x + a.part.x - (b.item.x + b.part.x),
        );
    };

    /* Label parts are often shorter than the text they hold, so the visual text top is estimated. */
    const textTop = (part) => {
        const perLine = Math.max(10, part.w / (part.size * 0.5));
        const lines = (part.label || "")
            .split("\n")
            .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / perLine)), 0);
        const textHeight = lines * part.size * 1.32;
        /* Negative slack means the text overflows its box, so it also starts above it. */
        return part.y + (part.h - textHeight) / 2;
    };

    for (const entry of supplements.icons || []) {
        const matches = textAnchors(entry.match);
        const targets = entry.all ? matches : matches.slice(0, 1);
        targets.forEach((anchor, index) => {
            const size = entry.size || 80;
            const x = round(anchor.item.x + anchor.part.x + (anchor.part.w - size) / 2);
            const y = round(anchor.item.y + textTop(anchor.part) - size - 8);
            /* A label that already has artwork above it keeps the drawn artwork, otherwise the
               restored icon lands on top of it and the node shows two plates. */
            const taken = items.some((item) =>
                item.parts.some((part) => {
                    if (part.type !== "icon") return false;
                    const overlapX = Math.min(x + size, item.x + part.x + part.w) - Math.max(x, item.x + part.x);
                    const overlapY = Math.min(y + size, item.y + part.y + part.h) - Math.max(y, item.y + part.y);
                    return overlapX > 0 && overlapY > 0 && (overlapX * overlapY) / (size * size) > 0.35;
                }),
            );
            if (taken) return;
            items.push({
                id: `addon-${config.slug}-${entry.role}-${index}-${Math.round(x)}`,
                x,
                y,
                w: size,
                h: size,
                /* Connectors that end on this caption should land on the restored artwork. */
                iconFor: anchor.item.id,
                parts: [{ type: "icon", icon: entry.role, x: 0, y: 0, w: size, h: size }],
            });
        });
    }

    const addonEdges = [];
    (supplements.links || []).forEach((entry, index) => {
        const [fromMatch, toMatch, options = {}] = entry;
        const from = textAnchors(fromMatch)[0];
        const to = textAnchors(toMatch)[0];
        if (!from || !to || from.item.id === to.item.id) return;
        addonEdges.push({
            id: `addon-${config.slug}-link-${index}`,
            from: from.item.id,
            to: to.item.id,
            start: null,
            end: null,
            via: [],
            arrow: options.arrow || "arrow",
            startArrow: options.startArrow || "none",
            ortho: true,
            dashed: Boolean(options.dashed),
            color: RULE,
            width: 1.2,
            label: null,
        });
    });

    /* Restored art can sit above or left of the original content, so re-pad the canvas. */
    const spanX = items.flatMap((item) => [item.x, item.x + item.w]);
    const spanY = items.flatMap((item) => [item.y, item.y + item.h]);
    const padX = Math.max(0, padding - Math.min(...spanX));
    const padY = Math.max(0, padding - Math.min(...spanY));
    for (const item of items) {
        item.x = round(item.x + padX);
        item.y = round(item.y + padY);
    }
    width = Math.max(...spanX) - Math.min(...spanX) + padX;
    height = Math.max(...spanY) - Math.min(...spanY) + padY;

    designMeta.set(config.slug, {
        group,
        shift: { x: shiftX + padX, y: shiftY + padY },
    });

    return {
        slug: config.slug,
        title: config.title,
        kind: "canvas",
        width: round(width + padding * 2),
        height: round(height + padding * 2),
        items,
        edges: addonEdges,
    };
};

/* The CI/CD card only ever existed as a bitmap, so it is laid out from the stages it shows. */
const PIPELINE_COLUMNS = [
    [
        ["developers", "Developers", "users"],
        ["repository", "Repository", "repository"],
    ],
    [
        ["ci", "CI Pipeline", "pipeline"],
        ["build", "Build", "build"],
        ["unit", "Unit Tests", "ledger"],
        ["static", "Static Analysis", "scan"],
        ["integration", "Integration Tests", "integration"],
    ],
    [
        ["dynamic", "Dynamic Analysis", "scan"],
        ["cd", "CD Pipeline", "pipeline"],
    ],
    [
        ["iac", "Infrastructure as Code", "code"],
        ["disaster", "Disaster Recovery", "replication"],
        ["replication", "Data Replication", "replication"],
        ["availability", "Availability", "compute"],
    ],
    [
        ["deployment", "Deployment", "deploy"],
        ["active", "Active Monitoring", "analytics"],
        ["health", "Health Checks", "health"],
        ["availability-monitoring", "Availability Monitoring", "analytics"],
        ["security-monitoring", "Security Monitoring", "security"],
    ],
];

const buildPipelineDesign = (config) => {
    const nodeWidth = 150;
    const nodeHeight = 150;
    const columnGap = 110;
    const rowGap = 30;
    const iconSize = 92;

    const nodes = [];
    PIPELINE_COLUMNS.forEach((column, columnIndex) => {
        column.forEach(([id, label, icon], rowIndex) => {
            nodes.push({
                id,
                label,
                icon,
                column: columnIndex,
                row: rowIndex,
                x: columnIndex * (nodeWidth + columnGap),
                y: rowIndex * (nodeHeight + rowGap),
            });
        });
    });

    const rectOf = (id) => nodes.find((node) => node.id === id);

    const items = nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        w: nodeWidth,
        h: nodeHeight,
        parts: [
            {
                type: "icon",
                icon: node.icon,
                x: (nodeWidth - iconSize) / 2,
                y: 0,
                w: iconSize,
                h: iconSize,
            },
            {
                type: "text",
                label: node.label,
                x: 0,
                y: iconSize + 8,
                w: nodeWidth,
                h: 30,
                size: 13,
                color: INK,
                align: "center",
                valign: "top",
                bold: false,
            },
        ],
    }));

    const edges = [];
    const connect = (fromId, toId) => {
        const from = rectOf(fromId);
        const to = rectOf(toId);
        const via = [];
        if (from.column !== to.column) {
            /* Different column: drop into the gutter between the columns, then rise. */
            const gutter = (from.x + nodeWidth + to.x) / 2;
            via.push({ x: round(gutter), y: round(from.y + iconSize / 2) });
            via.push({ x: round(gutter), y: round(to.y + iconSize / 2) });
        }
        edges.push({
            id: `${fromId}->${toId}`,
            from: fromId,
            to: toId,
            start: null,
            end: null,
            via,
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 1.6,
            label: null,
        });
    };

    PIPELINE_COLUMNS.forEach((column, index) => {
        for (let row = 0; row < column.length - 1; row += 1) {
            connect(column[row][0], column[row + 1][0]);
        }
        const next = PIPELINE_COLUMNS[index + 1];
        if (next) connect(column[column.length - 1][0], next[0][0]);
    });

    const width = Math.max(...nodes.map((node) => node.x + nodeWidth)) + 24;
    const height = Math.max(...nodes.map((node) => node.y + nodeHeight)) + 24;

    return {
        slug: config.slug,
        title: config.title,
        kind: "canvas",
        width: round(width),
        height: round(height),
        items,
        edges,
    };
};

/*
    Cost-effective hybrid stack: Cloudflare edge in front, hybrid cloud storage in the
    middle, and one worker/ledger pair per application. Authored here because the design
    only exists as a reference image.
*/
/* Zone fills are translucent so the connectors drawn beneath them stay visible. */
const HYBRID_STYLES = {
    zone: { fill: "rgba(233, 238, 250, 0.55)", stroke: "#9fb0dc" },
    edgeZone: { fill: "rgba(243, 237, 252, 0.62)", stroke: "#b5a5dd" },
    app1: { fill: "rgba(253, 238, 221, 0.62)", stroke: "#dcb489" },
    app2: { fill: "rgba(251, 230, 230, 0.62)", stroke: "#dda5a5" },
    app3: { fill: "rgba(231, 242, 222, 0.62)", stroke: "#a8c78f" },
    box: { fill: "#ffffff", stroke: "#b9c4d2" },
    step: { fill: "#dbe9fb", stroke: "#93b4e6" },
    worker: { fill: "#dff0d8", stroke: "#93bd82" },
    store: { fill: "#fdf2c8", stroke: "#d3bd6d" },
    bucket: { fill: "#f1f3f5", stroke: "#b9c2cc" },
};

const buildHybridDesign = (config) => {
    const items = [];
    const edges = [];

    const box = (id, label, x, y, w, h, style = HYBRID_STYLES.box, size = 11) => {
        items.push({
            id,
            x,
            y,
            w,
            h,
            parts: [
                {
                    type: "box",
                    label,
                    x: 0,
                    y: 0,
                    w,
                    h,
                    size,
                    color: INK,
                    align: "center",
                    valign: "middle",
                    fill: style.fill,
                    stroke: style.stroke,
                    strokeWidth: 1.4,
                    dashed: false,
                    rounded: false,
                },
            ],
        });
    };

    const text = (id, label, x, y, w, h, size = 10, bold = false) => {
        items.push({
            id,
            x,
            y,
            w,
            h,
            parts: [
                {
                    type: "text",
                    label,
                    x: 0,
                    y: 0,
                    w,
                    h,
                    size,
                    color: INK,
                    align: "left",
                    valign: "top",
                    bold,
                },
            ],
        });
    };

    /* A zone is a tinted frame with its name in the top-left corner. */
    const zone = (id, label, x, y, w, h, style) => {
        box(id, "", x, y, w, h, style, 12);
        text(`${id}-title`, label, x + 12, y + 8, w - 24, 20, 12, true);
    };

    const link = (from, to, dashed = false) =>
        edges.push({
            id: `${from}->${to}`,
            from,
            to,
            start: null,
            end: null,
            via: [],
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed,
            color: CONNECTOR,
            width: 1.4,
            label: null,
        });

    /* Ledger and accounts both feed replication, so give each its own landing point
       instead of stacking two arrowheads on the same edge. */
    const replicaFeed = (from, to, endY) => {
        const source = items.find((item) => item.id === from);
        const target = items.find((item) => item.id === to);
        const start = { x: source.x + source.w, y: source.y + source.h / 2 };
        const end = { x: target.x, y: endY };
        const laneX = target.x - 16;
        const via = from.startsWith("account")
            ? [
                  { x: laneX, y: start.y },
                  { x: laneX, y: endY },
              ]
            : [];
        edges.push({
            id: `${from}->${to}`,
            from,
            to,
            start,
            end,
            via,
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 1.4,
            label: null,
            direct: true,
            partAnchors: true,
        });
    };

    /* Each Cloudflare application needs its own visible path into the proxy;
       otherwise automatic routing collapses all three into one arrowhead. */
    const proxyFeed = (from, to, endY, laneX) => {
        const source = items.find((item) => item.id === from);
        const target = items.find((item) => item.id === to);
        const start = { x: source.x + source.w, y: source.y + source.h / 2 };
        const end = { x: target.x, y: endY };
        edges.push({
            id: `${from}->${to}`,
            from,
            to,
            start,
            end,
            via: [
                { x: laneX, y: start.y },
                { x: laneX, y: endY },
            ],
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 1.4,
            label: null,
            direct: true,
            partAnchors: true,
            exact: true,
        });
    };

    /* The payment provider sits outside the application zone, past the bucket card.
       Leave the replica, run past the bucket, then come back in below its top edge
       instead of threading the few pixels between the two cards. */
    const providerFeed = (from, to) => {
        const source = items.find((item) => item.id === from);
        const target = items.find((item) => item.id === to);
        const start = { x: source.x + source.w, y: source.y + source.h / 2 };
        const laneX = 1300;
        const end = { x: target.x, y: target.y + target.h * 0.75 };
        edges.push({
            id: `${from}->${to}`,
            from,
            to,
            start,
            end,
            via: [
                { x: laneX, y: start.y },
                { x: laneX, y: end.y },
            ],
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 1.4,
            label: null,
            direct: true,
            partAnchors: true,
            exact: true,
        });
    };

    /* Three user entry points, each behind its own Cloudflare application. */
    const apps = [
        ["1", 150],
        ["2", 430],
        ["3", 710],
    ];
    for (const [index, y] of apps) {
        box(`ui${index}`, "UI", 20, y + 40, 56, 56);
        zone(`cf${index}`, `Cloudflare Application ${index}`, 96, y, 420, 200, HYBRID_STYLES.edgeZone);
        box(`edge${index}`, "Cloudflared Edge\nSecurity/Reverse Proxy", 110, y + 44, 118, 52, HYBRID_STYLES.step);
        box(`connector${index}`, "Cloudflare Deployment\n(Tunnel Connector)", 246, y + 44, 118, 52, HYBRID_STYLES.step);
        box(`api${index}`, "Workers\n(Functions)\n(As API Gateway)", 376, y + 44, 118, 52, HYBRID_STYLES.worker);
        box(`cache${index}`, "Cloudflare Static\n(HTML Bucket)", 236, y + 126, 140, 44, HYBRID_STYLES.store, 10);
        box(`bucket${index}`, "Bucket\n(Per Application)\n\nLog Snapshot", 300, y - 66, 170, 60, HYBRID_STYLES.bucket, 10);

        link(`ui${index}`, `edge${index}`);
        link(`edge${index}`, `connector${index}`);
        link(`connector${index}`, `api${index}`);
        link(`api${index}`, `cache${index}`);
        link(`api${index}`, `bucket${index}`);
    }

    text("risk", "Calculate max risk you can comfortably risk for public access.", 110, 604, 220, 40, 10);

    /* Shared hybrid middle tier. */
    zone("hybrid", "AWS / GCP / hybrid", 520, 16, 860, 950, HYBRID_STYLES.zone);
    box("proxy", "Reverse Proxy/VPN", 540, 120, 150, 52, HYBRID_STYLES.box);
    box("eks", "EKS Service\n(K8 Service)", 540, 196, 150, 52, HYBRID_STYLES.box);
    box("lb", "Load Balancer", 540, 272, 150, 44, HYBRID_STYLES.box);
    box("mount1", "Internal Mount Storage\n(Persistent Mount)", 540, 340, 170, 52, HYBRID_STYLES.box);
    box("kafka1", "Internal Kafka\n(~140k transactions/second on i9-13900kf)", 540, 412, 170, 62, HYBRID_STYLES.store, 10);
    box("kafka2", "Internal Kafka\n(~140k transactions/second on i9-13900kf)", 540, 492, 170, 62, HYBRID_STYLES.store, 10);
    box("mount2", "Internal Mount Storage\n(Persistent Mount)", 540, 574, 170, 52, HYBRID_STYLES.box);
    text(
        "writepath",
        "Write path: verify ETag and offset, hash against the API key — invalid writes replace data.\nRead path: the ledger hash must not be malformed and the client must authenticate.\nSized for roughly ten times current scale.",
        548,
        652,
        210,
        120,
        10
    );

    proxyFeed("api1", "proxy", 132, 518);
    proxyFeed("api2", "proxy", 146, 528);
    proxyFeed("api3", "proxy", 160, 522);
    link("proxy", "eks");
    link("eks", "lb");
    link("lb", "mount1");
    link("mount1", "kafka1");
    link("kafka1", "kafka2");
    link("kafka2", "mount2");

    /* One application zone per tenant, each with workers, ledger and replicas. */
    const zoneStyles = [HYBRID_STYLES.app1, HYBRID_STYLES.app2, HYBRID_STYLES.app3];
    apps.forEach(([index, y], position) => {
        const zoneY = 40 + position * 300;
        zone(`app${index}`, `Application ${index}`, 770, zoneY, 580, 270, zoneStyles[position]);

        for (const [slot, workerY] of [40, 96, 152].entries()) {
            box(`w${index}${slot}`, "Worker (Container)", 790, zoneY + workerY, 120, 44, HYBRID_STYLES.worker, 9);
        }
        box(`ledger${index}`, "Ledger\n(Read/Append Only)", 940, zoneY + 40, 120, 52, HYBRID_STYLES.box, 9);
        box(`account${index}`, "Accounts DB\n(RW)", 940, zoneY + 118, 120, 48, HYBRID_STYLES.box, 9);
        box(`replica${index}`, "Extra Replication", 1090, zoneY + 40, 120, 46, HYBRID_STYLES.box, 9);
        box(`bucket${index}-app`, "Bucket\n(Per Application)\n\nFlush at low volume (night), and flush if exceeds storage threshold.", 1090, zoneY + 112, 170, 92, HYBRID_STYLES.bucket, 8);

        /* The worker containers consume from the internal Kafka pair; the load
           balancer is not the entry point for those workloads. */
        const kafkaSource = items.find((item) => item.id === "kafka1");
        const start = { x: kafkaSource.x + kafkaSource.w, y: kafkaSource.y + kafkaSource.h / 2 };
        const laneX = index === "3" ? 762 : 742;
        for (const [slot, workerY] of [40, 96, 152].entries()) {
            const end = { x: 790, y: zoneY + workerY + 22 };
            edges.push({
                id: `kafka1->w${index}${slot}`,
                from: "kafka1",
                to: `w${index}${slot}`,
                start,
                end,
                via: [
                    { x: 742, y: start.y },
                    ...(laneX === 742 ? [] : [{ x: laneX, y: start.y }]),
                    { x: laneX, y: end.y },
                ],
                arrow: "arrow",
                startArrow: "none",
                ortho: true,
                dashed: false,
                color: CONNECTOR,
                width: 1.4,
                label: null,
                direct: true,
                partAnchors: true,
            });
        }

        /* One worker lane feeds the ledger and one feeds the account DB; the third is the warm path. */
        link(`w${index}0`, `ledger${index}`);
        link(`w${index}1`, `account${index}`);
        replicaFeed(`ledger${index}`, `replica${index}`, zoneY + 66);
        replicaFeed(`account${index}`, `replica${index}`, zoneY + 80);
        link(`replica${index}`, `bucket${index}-app`);
    });

    /* Payment provider, the aggregator tier and long-term storage per user. */
    box("square1", "Payment Provider\nAPI", 1370, 120, 90, 56, HYBRID_STYLES.box, 9);
    box("square2", "Payment Provider\nAPI", 1370, 400, 90, 56, HYBRID_STYLES.box, 9);
    box("square3", "Payment Provider\nAPI", 1370, 700, 90, 56, HYBRID_STYLES.box, 9);
    box("aggregator", "Data Aggregator Service\n(Manage Data Appropriately)", 1490, 356, 172, 62, HYBRID_STYLES.box, 10);
    box("customdb", "Custom DB per user with registry for arrow or parquet files per user.", 1490, 460, 172, 76, HYBRID_STYLES.box, 9);

    providerFeed("replica1", "square1");
    providerFeed("replica2", "square2");
    providerFeed("replica3", "square3");

    /* The warm-path worker feeds the payment provider API. Sweep the link through
       the empty band beneath the bucket and land it beside the provider's existing
       bottom-centre link so the two heads stay distinct. */
    for (const index of ["1", "2", "3"]) {
        const worker = items.find((item) => item.id === `w${index}2`);
        const provider = items.find((item) => item.id === `square${index}`);
        if (!worker || !provider) continue;
        const start = { x: round(worker.x + worker.w), y: round(worker.y + worker.h / 2) };
        const end = { x: round(provider.x + 14), y: round(provider.y + provider.h) };
        const dropX = round(worker.x + worker.w + 60);
        const laneY = round(worker.y + worker.h + 32);
        edges.push({
            id: `w${index}2->square${index}`,
            from: worker.id,
            to: provider.id,
            start,
            end,
            via: [
                { x: dropX, y: start.y },
                { x: dropX, y: laneY },
                { x: end.x, y: laneY },
            ],
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 1.4,
            label: null,
            direct: true,
            exact: true,
            partAnchors: true,
        });
    }

    link("square1", "aggregator");
    link("square2", "aggregator");
    link("square3", "aggregator");
    link("aggregator", "customdb");

    return {
        slug: config.slug,
        title: config.title,
        kind: "canvas",
        width: 1680,
        height: 990,
        items,
        edges,
    };
};

const buildChecklistDesign = (config) => {
    const group = byId.get(config.group);
    const rects = absoluteRects(group);
    const lines = [];

    const skip = new Set(config.extraLabels || []);
    const collect = (parentId) => {
        for (const child of kids(parentId)) {
            if (child.vertex) {
                const text = labelOf(child.value);
                const rect = rects.get(child.id);
                if (text && rect && !skip.has(child.id)) lines.push({ text, x: rect.x, y: rect.y });
            }
            collect(child.id);
        }
    };
    collect(group.id);

    const heading = (config.extraLabels || [])
        .map((id) => labelOf(byId.get(id)?.value || ""))
        .find(Boolean);

    /* The drawing lays the checks out in columns; recover them, then read column by column. */
    const columns = [];
    for (const line of lines.sort((a, b) => a.x - b.x)) {
        const column = columns.find((candidate) => Math.abs(candidate.x - line.x) < 240);
        if (column) {
            column.x = Math.min(column.x, line.x);
            column.lines.push(line);
        } else {
            columns.push({ x: line.x, lines: [line] });
        }
    }
    const ordered = columns
        .sort((a, b) => a.x - b.x)
        .flatMap((column) => column.lines.sort((a, b) => a.y - b.y).map((line) => line.text));

    const seen = new Set();
    const items = ordered.filter((text) => {
        const key = text.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        slug: config.slug,
        title: config.title,
        kind: "checklist",
        heading: heading || config.title,
        items,
    };
};

/*
    A full drawing is far too dense to read in a card, so each card shows a distilled
    flow of the same components at a size where the labels still work. The modal keeps
    the complete drawing with its notes.
*/
const COVERS = {
    "self-managed": {
        flow: [
            ["Browser", "browser"],
            ["WAF / Reverse Proxy", "firewall"],
            ["API Gateway", "gateway"],
            ["Web Service API", "compute"],
        ],
        branches: [
            ["above", 2, "Identity Provider", "identity"],
            ["above", 3, "Rabbit MQ", "queue"],
            ["below", 3, "Per-service Database", "database"],
        ],
    },
    "managed-secure": {
        flow: [
            ["Browser", "browser"],
            ["IDS / IPS", "firewall"],
            ["API Gateway", "gateway"],
            ["Web Service API", "compute"],
        ],
        branches: [
            ["above", 3, "SIEM / SOAR", "security"],
            ["below", 2, "Identity Provider", "identity"],
            ["below", 3, "Per-service Database", "database"],
        ],
    },
    "serverless-secure": {
        flow: [
            ["Browser", "browser"],
            ["WAF / DDoS Shield", "firewall"],
            ["API Gateway", "gateway"],
            ["Serverless API", "compute"],
        ],
        branches: [
            ["above", 3, "Active Monitoring", "analytics"],
            ["below", 2, "Event Queue", "queue"],
            ["below", 3, "Managed Database", "database"],
        ],
    },
    encryption: {
        flow: [
            ["Web Service API", "compute"],
            ["TPM / vTPM Server", "compute"],
            ["Wrapped DEK", "security"],
            ["Encrypted Database", "database"],
        ],
        branches: [
            ["above", 1, "HSM / KMS", "identity"],
            ["below", 0, "Rate Limiting", "loadbalancer"],
            ["below", 2, "Key Rotation", "ledger"],
        ],
    },
    authentication: {
        flow: [
            ["User", "users"],
            ["Identity Provider", "identity"],
            ["API Gateway", "gateway"],
            ["Web Service API", "compute"],
        ],
        branches: [
            ["above", 3, "JWT Validation", "security"],
            ["below", 1, "Token Cache", "cache"],
            ["below", 3, "User Store", "database"],
        ],
    },
    "cost-effective": {
        flow: [
            ["Cloudflare Edge", "firewall"],
            ["Edge Workers", "code"],
            ["Reverse Proxy", "gateway"],
            ["Load Balancer", "loadbalancer"],
            ["App Workers", "compute"],
        ],
        branches: [
            ["above", 1, "R2 Bucket", "cache"],
            ["below", 2, "Hybrid Storage", "database"],
            ["below", 4, "Extra Replication", "replication"],
        ],
    },
    cicd: {
        flow: [
            ["Repository", "repository"],
            ["CI Pipeline", "pipeline"],
            ["Build & Tests", "build"],
            ["Deploy", "deploy"],
            ["Monitoring", "health"],
        ],
        branches: [
            ["above", 0, "Developers", "users"],
            ["above", 2, "Static Analysis", "scan"],
            ["below", 2, "Infrastructure as Code", "code"],
            ["below", 4, "Security Monitoring", "security"],
        ],
    },
};

const buildCoverDesign = (spec) => {
    const width = 960;
    const height = 600;
    const nodeHeight = 168;
    const margin = 36;
    const minGap = 56;
    const columns = spec.flow.length;
    /* Wider flows shrink the node so the strip stays inside the canvas. */
    const nodeWidth = Math.min(168, (width - margin * 2 - minGap * (columns - 1)) / columns);
    const iconSize = Math.min(96, nodeWidth - 40);
    const gap = (width - margin * 2 - columns * nodeWidth) / Math.max(1, columns - 1);
    const flowY = 216;
    const branchY = { above: 32, below: 400 };

    const nodes = spec.flow.map(([label, icon], index) => ({
        id: `flow-${index}`,
        label,
        icon,
        x: round(margin + index * (nodeWidth + gap)),
        y: flowY,
    }));

    spec.branches.forEach(([position, anchor, label, icon], index) => {
        nodes.push({
            id: `branch-${index}`,
            label,
            icon,
            x: nodes[anchor].x,
            y: branchY[position],
        });
    });

    const items = nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        w: nodeWidth,
        h: nodeHeight,
        parts: [
            {
                type: "icon",
                icon: node.icon,
                x: (nodeWidth - iconSize) / 2,
                y: 0,
                w: iconSize,
                h: iconSize,
            },
            {
                type: "text",
                label: node.label,
                x: -6,
                y: iconSize + 12,
                w: nodeWidth + 12,
                h: 44,
                size: 15,
                color: INK,
                align: "center",
                valign: "top",
                bold: false,
            },
        ],
    }));

    const edge = (from, to) => ({
        id: `${from}->${to}`,
        from,
        to,
        start: null,
        end: null,
        via: [],
        arrow: "arrow",
        startArrow: "none",
        ortho: true,
        dashed: false,
        color: RULE,
        width: 1.8,
        label: null,
    });

    const edges = [];
    for (let index = 0; index < spec.flow.length - 1; index += 1) {
        edges.push(edge(`flow-${index}`, `flow-${index + 1}`));
    }
    spec.branches.forEach(([, anchor], index) => {
        edges.push(edge(`branch-${index}`, `flow-${anchor}`));
    });

    return { width, height, items, edges };
};

const designs = DESIGNS.map((config) => {
    if (config.kind === "image") {
        return { slug: config.slug, title: config.title, kind: "image", image: config.image };
    }
    if (config.kind === "checklist") return buildChecklistDesign(config);
    const design =
        config.kind === "pipeline" ? buildPipelineDesign(config)
        : config.kind === "hybrid" ? buildHybridDesign(config)
        : buildCanvasDesign(config);
    const cover = COVERS[config.slug];
    return cover ? { ...design, cover: buildCoverDesign(cover) } : design;
});

/* ---------- connectors ---------- */

/* draw.io writes the unanchored ends of an edge either as plain points or with an `as` role, in any attribute order. */
const pointList = (xmlFragment) =>
    [...xmlFragment.matchAll(/<mxPoint\b([^>]*?)\/>/g)].map((entry) => {
        const attrs = Object.fromEntries([...entry[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((pair) => [pair[1], pair[2]]));
        return { x: Number(attrs.x || 0), y: Number(attrs.y || 0) };
    });

const firstPoint = (xmlFragment, role) => {
    const found = xmlFragment.match(new RegExp('<mxPoint[^>]*as="' + role + '"[^>]*/>'));
    if (!found) return null;
    return pointList(found[0])[0] || null;
};

/* Waypoints are stored in the edge's parent space; lift them to canvas (absolute) space. */
const parentOffset = (cell) => {
    let x = 0;
    let y = 0;
    let current = byId.get(cell.parent);
    while (current && current.id !== "1") {
        x += current.geometry?.x || 0;
        y += current.geometry?.y || 0;
        current = byId.get(current.parent);
    }
    return { x, y };
};

const designForPoint = (point) => {
    for (const design of designs) {
        const meta = designMeta.get(design.slug);
        if (!meta) continue;
        const { group } = meta;
        const gx = group.geometry.x || 0;
        const gy = group.geometry.y || 0;
        if (point.x >= gx && point.x <= gx + (group.geometry.width || 0) && point.y >= gy && point.y <= gy + (group.geometry.height || 0)) {
            return design;
        }
    }
    return null;
};

/* Group-local rectangles per design, so an unresolved connector target can be looked up. */
const groupRects = new Map();
const rectsFor = (group) => {
    if (!groupRects.has(group.id)) groupRects.set(group.id, absoluteRects(group));
    return groupRects.get(group.id);
};

for (const cell of cells) {
    if (!cell.edge) continue;

    const from = cell.source ? resolveOwner(cell.source) : null;
    const to = cell.target ? resolveOwner(cell.target) : null;
    if (from && to && from.slug !== to.slug) continue;

    const offset = parentOffset(cell);
    const pointsMatch = cell.body.match(/<Array as="points">([\s\S]*?)<\/Array>/);
    const waypoints = pointsMatch ? pointList(pointsMatch[1]) : [];
    const absoluteVia = waypoints.map((point) => ({ x: point.x + offset.x, y: point.y + offset.y }));
    const startPoint = firstPoint(cell.body, "sourcePoint");
    const endPoint = firstPoint(cell.body, "targetPoint");
    const absoluteStart = startPoint ? { x: startPoint.x + offset.x, y: startPoint.y + offset.y } : null;
    const absoluteEnd = endPoint ? { x: endPoint.x + offset.x, y: endPoint.y + offset.y } : null;

    if (!from && !to && !absoluteVia.length && !absoluteStart && !absoluteEnd) continue;

    const anchorDesign = from ? designs.find((d) => d.slug === from.slug) : to ? designs.find((d) => d.slug === to.slug) : null;
    const probe = absoluteVia[0] || absoluteStart || absoluteEnd;
    const design = anchorDesign || (probe ? designForPoint(probe) : null);
    if (!design?.items) continue;

    const meta = designMeta.get(design.slug);
    const { group, shift } = meta;
    const gx = group.geometry.x || 0;
    const gy = group.geometry.y || 0;
    const local = (point) => ({ x: round(point.x - gx + shift.x), y: round(point.y - gy + shift.y) });

    /* Fully floating connector: fall back to its first and last stored points. */
    const via = absoluteVia.map(local);
    const start = absoluteStart ? local(absoluteStart) : null;
    const end = absoluteEnd ? local(absoluteEnd) : null;
    /*
        Some nodes are drawn as library artwork that cannot be rendered, so they never become
        items and their connectors would lose an end. The item occupying that place, usually
        the caption the drawing grouped with the artwork, takes the endpoint instead.
    */
    /* Zone frames are plain outline boxes: only real nodes may take an endpoint. */
    const isNode = (item) => item.parts.some((part) => part.type === "icon" || (part.type === "text" && part.label));
    const itemAtCell = (cellId) => {
        const rect = cellId ? rectsFor(group).get(cellId) : null;
        if (!rect) return null;
        const cx = rect.x + rect.width / 2 + shift.x;
        const cy = rect.y + rect.height / 2 + shift.y;
        let best = null;
        for (const item of design.items) {
            if (!isNode(item)) continue;
            const dx = Math.max(item.x - cx, 0, cx - (item.x + item.w));
            const dy = Math.max(item.y - cy, 0, cy - (item.y + item.h));
            const distance = dx || dy ? round(Math.hypot(dx, dy)) : 0;
            if (distance > 160) continue;
            if (!best || distance < best.distance) best = { distance, id: item.id };
        }
        return best ? best.id : null;
    };
    /*
        A connector can also be stored with a bare point instead of a source or target cell.
        When that point sits inside a node's card the drawing means that card, so the link gets
        a real end instead of a stub that starts next to the artwork the point was dropped on.
    */
    const itemAtPoint = (point) => {
        if (!point) return null;
        let best = null;
        for (const item of design.items) {
            if (!isNode(item)) continue;
            if (point.x < item.x || point.x > item.x + item.w) continue;
            if (point.y < item.y || point.y > item.y + item.h) continue;
            const area = item.w * item.h;
            if (!best || area < best.area) best = { area, id: item.id };
        }
        return best ? best.id : null;
    };
    const fromItem = from ? (from.slug === design.slug ? from.itemId : null) : itemAtCell(cell.source);
    const toItem = to ? (to.slug === design.slug ? to.itemId : null) : itemAtCell(cell.target);

    const endArrow = styleProp(cell.style, "endArrow") ?? "classic";
    const startArrow = styleProp(cell.style, "startArrow") ?? "none";
    /* Only arrowed links get the point fallback: the arrowless segments that compose the zone
       borders are drawn as bare lines and must keep their exact geometry. */
    const arrowed = EDGE_ARROWS[endArrow] !== "none" || EDGE_ARROWS[startArrow] !== "none";
    const fromNode = fromItem || (arrowed && toItem ? itemAtPoint(start) : null);
    const toNode = toItem || (arrowed && fromItem ? itemAtPoint(end) : null);
    if (fromNode && fromNode === toNode && !via.length) continue;

    /* A connector needs two drawable ends: an anchored node or a stored point. */
    const usableStart = fromNode || start || via[0] || null;
    const usableEnd = toNode || end || via[via.length - 1] || null;
    if (!usableStart || !usableEnd) continue;
    design.edges.push({
        id: cell.id,
        from: fromNode,
        to: toNode,
        start,
        end,
        via,
        arrow: EDGE_ARROWS[endArrow] || "none",
        startArrow: EDGE_ARROWS[startArrow] || "none",
        ortho: /orthogonalEdgeStyle/.test(cell.style),
        dashed: styleProp(cell.style, "dashed") === "1",
        color: colorOf(styleProp(cell.style, "strokeColor"), CONNECTOR),
        width: Number(styleProp(cell.style, "strokeWidth") || 1.2),
        label: labelOf(cell.value) || null,
    });
}

/* The Self-Managed card keeps Cache, Database and Identity Provider inside one
   grouped item. Connectors stored against those child shapes therefore collapse
   onto the group and either disappear or land on its outer edge. Give them
   explicit part-level endpoints so they stay visible and hit the identity icon. */
const addSelfManagedIdentityLinks = (design) => {
    if (!design || design.slug !== "self-managed") return;
    const group = design.items.find((item) => {
        const icons = new Set(item.parts.filter((part) => part.type === "icon").map((part) => part.icon));
        return icons.has("identity") && icons.has("cache") && icons.has("database");
    });
    if (!group) return;

    const icon = (name) => group.parts.find((part) => part.type === "icon" && part.icon === name);
    const identity = icon("identity");
    const cache = icon("cache");
    const database = icon("database");
    if (!identity || !cache || !database) return;

    const at = (part, x, y) => ({ x: round(group.x + part.x + part.w * x), y: round(group.y + part.y + part.h * y) });
    const identityTop = at(identity, 0.5, 0);
    const publicLb = design.items
        .filter((item) => item.parts.some((part) => part.type === "text" && part.label === "Public Load Balancer"))
        .sort((a, b) => a.y - b.y)[0];

    const publicEdge = design.edges.find((edge) => edge.from === publicLb?.id && edge.to === group.id);
    if (publicEdge) {
        const start = { x: round(publicLb.x + publicLb.w / 2), y: round(publicLb.y) };
        const end = at(identity, 0, 0.5);
        publicEdge.start = start;
        publicEdge.via = [{ x: start.x, y: end.y }];
        publicEdge.end = end;
        publicEdge.direct = true;
        publicEdge.partAnchors = true;
    }

    const addPartEdge = (id, start, end) => {
        if (design.edges.some((edge) => edge.id === id)) return;
        const lane = round(identityTop.y - 20);
        design.edges.push({
            id,
            from: group.id,
            to: group.id,
            start,
            end,
            via: [{ x: start.x, y: lane }, { x: end.x, y: lane }],
            direct: true,
            partAnchors: true,
            arrow: "arrow",
            startArrow: "none",
            ortho: true,
            dashed: false,
            color: CONNECTOR,
            width: 2,
            label: null,
        });
    };

    /* Start beside each label so the line does not run through its text. */
    const cacheStart = { x: round(group.x + cache.x + cache.w - 2), y: round(group.y + cache.y + cache.h) };
    const databaseStart = { x: round(group.x + database.x + 2), y: round(group.y + database.y + database.h) };
    addPartEdge("pJzPPJBQcUgIVhVGT_Sb-43", databaseStart, at(identity, 0.75, 0));
    addPartEdge("pJzPPJBQcUgIVhVGT_Sb-44", cacheStart, at(identity, 0.25, 0));
};

/* Two long connectors in the Self-Managed card were sharing a trunk or crossing
   a caption. Give them explicit routes so each branch and caption reads cleanly. */
const fixSelfManagedRoutes = (design) => {
    if (!design || design.slug !== "self-managed") return;
    const itemByCaption = (text) =>
        design.items.find((item) => item.parts.some((part) => part.type === "text" && part.label === text));
    const kafka = itemByCaption("Kafka");
    const ledger = itemByCaption("Ledger");
    const analytics = itemByCaption("Analytics");

    if (kafka && ledger && analytics) {
        const startY = round(kafka.y + kafka.h / 2);
        const start = { x: round(kafka.x + kafka.w), y: startY };
        const branch = (id, target, laneX) => {
            const edge = design.edges.find((entry) => entry.id === id);
            if (!edge) return;
            const end = { x: round(target.x), y: round(target.y + target.h / 2) };
            edge.start = start;
            edge.end = end;
            edge.via = [{ x: laneX, y: start.y }, { x: laneX, y: end.y }];
            edge.direct = true;
            edge.partAnchors = true;
        };
        branch("pJzPPJBQcUgIVhVGT_Sb-251", ledger, round(kafka.x + kafka.w + 32));
        branch("pJzPPJBQcUgIVhVGT_Sb-84", analytics, round(kafka.x + kafka.w + 72));
    }

    const serviceEdge = design.edges.find((edge) => edge.id === "pJzPPJBQcUgIVhVGT_Sb-140");
    const serviceSource = serviceEdge && design.items.find((item) => item.id === serviceEdge.from);
    const serviceCaption = itemByCaption("(Any applicable service)");
    if (serviceEdge && serviceSource && serviceCaption) {
        const laneX = round(serviceCaption.x - 32);
        /* Leave from the icon's left edge, below the incoming load-balancer link
           but above the caption, and turn left immediately. */
        const icon = serviceSource.parts.find((part) => part.type === "icon");
        const start = {
            x: round(serviceSource.x + 2),
            y: round(serviceSource.y + (icon?.h ?? serviceSource.h) * 0.65),
        };
        const oldVia = serviceEdge.via || [];
        const upY = oldVia[0]?.y ?? 72;
        serviceEdge.start = start;
        serviceEdge.via = [
            { x: laneX, y: start.y },
            { x: laneX, y: upY },
            ...oldVia.slice(1),
        ];
        serviceEdge.direct = true;
        serviceEdge.partAnchors = true;
    }

    /* The connector into the public load balancer climbed over the card and had its
       tip pushed out through the top, which left the head hanging above the icon.
       Run it straight across the gap and into the card's left edge. */
    const publicEdge = design.edges.find((edge) => edge.id === "pJzPPJBQcUgIVhVGT_Sb-100");
    const publicSource = publicEdge && design.items.find((item) => item.id === publicEdge.from);
    const publicTarget = publicEdge && design.items.find((item) => item.id === publicEdge.to);
    if (publicEdge && publicSource && publicTarget) {
        const y = round(publicSource.y + publicSource.h / 2);
        publicEdge.start = { x: round(publicSource.x + publicSource.w), y };
        publicEdge.end = { x: round(publicTarget.x), y };
        publicEdge.via = [];
        publicEdge.direct = true;
        publicEdge.partAnchors = true;
    }

    /* The rail the Kafka column lifts into stopped in open air beside the
       "Upgraded connections" note, a short stub above the run it belongs to.
       Carry it on to the other top rail so the bus reads as one line. */
    const topRail = design.edges.find((edge) => edge.id === "pJzPPJBQcUgIVhVGT_Sb-146");
    const leftRail = design.edges.find((edge) => edge.id === "pJzPPJBQcUgIVhVGT_Sb-140");
    if (topRail && leftRail?.via?.length) {
        const laneY = Math.min(...leftRail.via.map((point) => point.y));
        const joinX = Math.max(...leftRail.via.filter((point) => point.y === laneY).map((point) => point.x));
        topRail.end = { x: round(joinX), y: round(laneY) };
        topRail.via = [{ x: topRail.start.x, y: round(laneY) }];
        topRail.direct = true;
        topRail.exact = true;
    }
};

/* Two Serverless connectors read as errors: the API-to-browser run crosses the
   security notes, and the WAF-to-IDS tip climbs into the IDS icon from below.
   Give the long run a clear lane outside the security frame and land the WAF
   link straight on the IDS icon's left edge. */
const fixServerlessRoutes = (design) => {
    if (!design || design.slug !== "serverless-secure") return;
    const edge = (id) => design.edges.find((entry) => entry.id === id);
    const item = (id) => design.items.find((entry) => entry.id === id);

    const topRun = edge("pzLC8zUIy6n8I0Lp7QUf-30");
    const api = item("pzLC8zUIy6n8I0Lp7QUf-55");
    const securityZone = item("pzLC8zUIy6n8I0Lp7QUf-118");
    if (topRun && api && securityZone) {
        const startX = round(api.x + api.w / 2);
        const laneY = round(api.y - 11);
        const laneX = round(securityZone.x + securityZone.w + 66);
        const oldVia = topRun.via || [];
        const railY = oldVia[1]?.y ?? 152;
        topRun.via = [
            { x: startX, y: laneY },
            { x: laneX, y: laneY },
            { x: laneX, y: railY },
            { x: 111, y: railY },
            { x: 111, y: 647 },
        ];
        topRun.direct = true;
        topRun.exact = true;
    }

    /* The MSK lead-in stopped just above the rail it joins, leaving a short
       vertical spur over the security heading. End it on the rail instead. */
    const mskLead = edge("pzLC8zUIy6n8I0Lp7QUf-88");
    if (mskLead?.end) {
        mskLead.end = { x: round(mskLead.end.x), y: round(mskLead.via?.[0]?.y ?? mskLead.end.y) };
        mskLead.direct = true;
        mskLead.exact = true;
    }

    const wafRun = edge("pzLC8zUIy6n8I0Lp7QUf-109");
    const waf = item("pzLC8zUIy6n8I0Lp7QUf-22");
    const ids = item("pzLC8zUIy6n8I0Lp7QUf-105");
    const wafIcon = waf?.parts.find((part) => part.type === "icon" && part.icon === "firewall");
    if (wafRun && waf && ids && wafIcon) {
        const y = round(ids.y + ids.h / 2);
        wafRun.start = { x: round(waf.x + wafIcon.x + wafIcon.w), y };
        wafRun.end = { x: round(ids.x), y };
        wafRun.via = [];
        wafRun.direct = true;
        wafRun.partAnchors = true;
        wafRun.exact = true;
    }
};

/* Two loose connectors in the Managed card dead-ended on nothing: one ran the
   length of the identity zone's bottom border and planted its head on the border
   itself, the other stabbed up the side of the firewall chip from a point five
   units away. Settle each on the icon it was pointing at. */
const fixManagedRoutes = (design) => {
    if (!design || design.slug !== "managed-secure") return;
    const itemByCaptionStart = (text) =>
        design.items.find((item) =>
            item.parts.some((part) => part.type === "text" && String(part.label || "").startsWith(text)),
        );
    const iconOf = (item) => item && item.parts.find((part) => part.type === "icon");
    const partBox = (item, part) => ({
        x: round(item.x + part.x),
        y: round(item.y + part.y),
        w: round(part.w),
        h: round(part.h),
    });

    /* Browser -> Identity Provider: the tip stopped on the zone border with the
       identity chip 130 units above it. Carry the run up beside the zone's note,
       then across the band between the note above and the chip's own caption. */
    const identityEdge = design.edges.find((edge) => edge.id === "8g4pamMf9IHq5r4i4Y-3-459");
    const identity = itemByCaptionStart("Identity Provider");
    const identityIcon = iconOf(identity);
    const identitySource = identityEdge && design.items.find((item) => item.id === identityEdge.from);
    const identitySourceIcon = iconOf(identitySource);
    if (identityEdge && identityIcon && identitySourceIcon) {
        const source = partBox(identitySource, identitySourceIcon);
        const target = partBox(identity, identityIcon);
        const start = { x: round(source.x + source.w), y: round(source.y + source.h / 2) };
        const laneX = round(start.x + 14);
        const laneY = round(target.y + target.h);
        identityEdge.to = identity.id;
        identityEdge.start = start;
        identityEdge.via = [{ x: laneX, y: start.y }, { x: laneX, y: laneY }];
        identityEdge.end = { x: target.x, y: laneY };
        identityEdge.direct = true;
        identityEdge.partAnchors = true;
        identityEdge.exact = true;
    }

    /* WAF/Reverse Proxy -> IDS/IPS: the loose start sat just off the WAF chip, so the
       link drew as a six-unit hook beside the firewall icon. Run it straight across. */
    const idsEdge = design.edges.find((edge) => edge.id === "8g4pamMf9IHq5r4i4Y-3-495");
    const idsTarget = idsEdge && design.items.find((item) => item.id === idsEdge.to);
    const idsIcon = iconOf(idsTarget);
    const firewall = itemByCaptionStart("WAF/Reverse Proxy");
    const firewallIcon = iconOf(firewall);
    if (idsEdge && idsIcon && firewallIcon) {
        const ids = partBox(idsTarget, idsIcon);
        const waf = partBox(firewall, firewallIcon);
        const y = round(ids.y + ids.h / 2);
        idsEdge.start = { x: round(waf.x + waf.w), y };
        idsEdge.end = { x: ids.x, y };
        idsEdge.via = [];
        idsEdge.direct = true;
        idsEdge.partAnchors = true;
        idsEdge.exact = true;
    }
};

for (const design of designs) {
    addSelfManagedIdentityLinks(design);
    fixSelfManagedRoutes(design);
    fixServerlessRoutes(design);
    fixManagedRoutes(design);
}

/* Zone frames are drawn as loose line segments that overshoot at the corners.
   Straighten each into a true horizontal or vertical run, then pull its ends onto
   the perpendicular segment it meets so every zone closes square. */
const FRAME_SNAP = 12;

const snapZoneCorners = (edges) => {
    const frames = edges.filter(
        (edge) =>
            !edge.from &&
            !edge.to &&
            !(edge.via && edge.via.length) &&
            edge.arrow === "none" &&
            Number(edge.width) >= 3 &&
            edge.start &&
            edge.end,
    );
    const horizontal = [];
    const vertical = [];
    for (const frame of frames) {
        const dx = Math.abs(frame.end.x - frame.start.x);
        const dy = Math.abs(frame.end.y - frame.start.y);
        if (dx >= dy) {
            const y = round((frame.start.y + frame.end.y) / 2);
            frame.start.y = y;
            frame.end.y = y;
            horizontal.push(frame);
        } else {
            const x = round((frame.start.x + frame.end.x) / 2);
            frame.start.x = x;
            frame.end.x = x;
            vertical.push(frame);
        }
    }

    const near = (value, target) => Math.abs(value - target) <= FRAME_SNAP;
    const within = (value, a, b) => value >= Math.min(a, b) - FRAME_SNAP && value <= Math.max(a, b) + FRAME_SNAP;

    for (const line of horizontal) {
        for (const end of [line.start, line.end]) {
            let best = null;
            for (const cross of vertical) {
                if (!near(end.x, cross.start.x) || !within(end.y, cross.start.y, cross.end.y)) continue;
                if (best === null || Math.abs(end.x - cross.start.x) < Math.abs(end.x - best)) best = cross.start.x;
            }
            if (best !== null) end.x = best;
        }
    }
    for (const line of vertical) {
        for (const end of [line.start, line.end]) {
            let best = null;
            for (const cross of horizontal) {
                if (!near(end.y, cross.start.y) || !within(end.x, cross.start.x, cross.end.x)) continue;
                if (best === null || Math.abs(end.y - cross.start.y) < Math.abs(end.y - best)) best = cross.start.y;
            }
            if (best !== null) end.y = best;
        }
    }
};

for (const design of designs) {
    if (Array.isArray(design.edges)) snapZoneCorners(design.edges);
}

/* Hairline traces (1.2px rule colour) are the drawing's leftover scaffolding:
   when a design also carries bold connectors, keep only the bold path. */
for (const design of designs) {
    if (!Array.isArray(design.edges)) continue;
    const bold = design.edges.some((edge) => Number(edge.width) > 1.2);
    if (bold) design.edges = design.edges.filter((edge) => Number(edge.width) > 1.2);
}

const extractedIcons = fs.existsSync(iconDir) ? fs.readdirSync(iconDir).length : 0;
fs.writeFileSync(outputPath, `${JSON.stringify({ designs }, null, 2)}\n`);

const summary = designs.map((design) => ({
    slug: design.slug,
    kind: design.kind,
    size: design.kind === "canvas" ? `${Math.round(design.width)}x${Math.round(design.height)}` : undefined,
    items: design.items?.length,
    edges: design.edges?.length,
}));
console.log(JSON.stringify({ designs: summary, extractedIcons }, null, 2));
