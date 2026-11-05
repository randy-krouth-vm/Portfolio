import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DesignIcon from "./DesignIcons.jsx";
import { assetUrl } from "./assets.js";

/* The modal can magnify the fitted drawing up to this multiple. */
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;
const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(1, value));

/*
    Renders one reference design as real DOM nodes (icons, shapes, labels) with
    connectors drawn as SVG between them, scaled to fit the available space.
*/

const centerOf = (rect) => ({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });

/* Gap kept between a connector and the boxes it passes. */
const CLEARANCE = 12;
/* Boxes are treated as obstacles with this much padding, so lines do not graze them. */
const OBSTACLE_PAD = 4;
/* How far outside its two ends a run considers the surrounding boxes. */
const ROUTE_MARGIN = 180;
/* Extra cost of a bend, so a straight run wins over a zig-zag of the same length. */
const BEND_COST = 28;

/* Arrowhead size, in drawing units, matched to the connector weight below. */
const ARROW_LENGTH = 10;
const ARROW_HALF = 4.6;

/* Caption overflow is scale-independent, so a preview can pass its measurements to the modal. */
const captionInkCache = new WeakMap();

/*
    Exit and entry points sit on the side of the rectangle that faces the other end,
    at the height of that rectangle's own artwork so the arrow meets the icon, not its
    caption or the empty padding around it.
*/
function facingSide(rect, toward, level) {
    const centre = centerOf(rect);
    const dx = toward.x - centre.x;
    const dy = toward.y - centre.y;
    /* The line meets the box at the height (or column) of its own artwork, not the box centre. */
    const meet = level || centre;
    const clampX = (value) => Math.min(Math.max(value, rect.x + 6), rect.x + rect.w - 6);
    const clampY = (value) => Math.min(Math.max(value, rect.y + 6), rect.y + rect.h - 6);
    if (Math.abs(dx) >= Math.abs(dy)) {
        return {
            point: { x: dx >= 0 ? rect.x + rect.w : rect.x, y: clampY(meet.y) },
            direction: { x: dx >= 0 ? 1 : -1, y: 0 },
        };
    }
    return {
        point: { x: clampX(meet.x), y: dy >= 0 ? rect.y + rect.h : rect.y },
        direction: { x: 0, y: dy >= 0 ? 1 : -1 },
    };
}

/* Small binary min-heap so the lattice search stays cheap on large drawings. */
class MinHeap {
    constructor() {
        this.items = [];
    }

    get length() {
        return this.items.length;
    }

    push(node, cost) {
        this.items.push({ node, cost });
        let index = this.items.length - 1;
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.items[parent].cost <= this.items[index].cost) break;
            [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
            index = parent;
        }
    }

    pop() {
        if (!this.items.length) return null;
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length) {
            this.items[0] = last;
            let index = 0;
            for (;;) {
                const left = index * 2 + 1;
                const right = left + 1;
                let smallest = index;
                if (left < this.items.length && this.items[left].cost < this.items[smallest].cost) smallest = left;
                if (right < this.items.length && this.items[right].cost < this.items[smallest].cost) smallest = right;
                if (smallest === index) break;
                [this.items[smallest], this.items[index]] = [this.items[index], this.items[smallest]];
                index = smallest;
            }
        }
        return top.node;
    }
}

/*
    Orthogonal router: walks a lattice of candidate corridors and skips any segment
    that would cross a box, so connectors travel through the gaps like the drawing does.
*/
function routeOrthogonal(start, end, obstacles, bounds) {
    const stub = CLEARANCE + 2;

    const inside = (point, rect) =>
        point.x > rect.x &&
        point.x < rect.x + rect.w &&
        point.y > rect.y &&
        point.y < rect.y + rect.h;

    /* Artwork is inset in its own box, so a short stub can land back inside that box and leave
       the lattice without a free end to start from. The stub walks straight out of it. */
    const clearStub = (point, direction) => {
        const out = { x: point.x + direction.x * stub, y: point.y + direction.y * stub };
        for (let step = 0; step < 8 && obstacles.some((rect) => inside(out, rect)); step += 1) {
            out.x += direction.x * 6;
            out.y += direction.y * 6;
        }
        return out;
    };
    const from = clearStub(start.point, start.direction);
    const to = clearStub(end.point, end.direction);

    const xs = new Set([from.x, to.x, bounds.minX, bounds.maxX]);
    const ys = new Set([from.y, to.y, bounds.minY, bounds.maxY]);
    for (const rect of obstacles) {
        xs.add(rect.x - CLEARANCE);
        xs.add(rect.x + rect.w + CLEARANCE);
        ys.add(rect.y - CLEARANCE);
        ys.add(rect.y + rect.h + CLEARANCE);
    }
    const xList = [...xs].sort((a, b) => a - b);
    const yList = [...ys].sort((a, b) => a - b);

    const blockedHorizontal = (y, x1, x2) =>
        obstacles.some(
            (rect) =>
                y > rect.y &&
                y < rect.y + rect.h &&
                Math.max(x1, x2) > rect.x &&
                Math.min(x1, x2) < rect.x + rect.w,
        );
    const blockedVertical = (x, y1, y2) =>
        obstacles.some(
            (rect) =>
                x > rect.x &&
                x < rect.x + rect.w &&
                Math.max(y1, y2) > rect.y &&
                Math.min(y1, y2) < rect.y + rect.h,
        );

    const columns = new Map();
    const rows = new Map();
    for (const y of yList) {
        const column = [];
        for (let index = 0; index < xList.length; index += 1) {
            if (obstacles.some((rect) => inside({ x: xList[index], y }, rect))) continue;
            column.push(index);
        }
        columns.set(y, column);
    }
    for (const x of xList) {
        const row = [];
        for (let index = 0; index < yList.length; index += 1) {
            if (obstacles.some((rect) => inside({ x, y: yList[index] }, rect))) continue;
            row.push(index);
        }
        rows.set(x, row);
    }

    const key = (xIndex, yIndex) => xIndex * yList.length + yIndex;
    const nodes = new Map();
    const addNode = (xIndex, yIndex) => {
        const id = key(xIndex, yIndex);
        if (!nodes.has(id)) {
            nodes.set(id, { id, xIndex, yIndex, cost: Infinity, previous: null, direction: null });
        }
        return nodes.get(id);
    };

    const startX = xList.indexOf(from.x);
    const startY = yList.indexOf(from.y);
    const endX = xList.indexOf(to.x);
    const endY = yList.indexOf(to.y);
    if (startX < 0 || startY < 0 || endX < 0 || endY < 0) return null;

    const startNode = addNode(startX, startY);
    startNode.cost = 0;
    const queue = new MinHeap();
    queue.push(startNode, 0);
    const visited = new Set();

    while (queue.length) {
        const current = queue.pop();
        if (!current) break;
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        if (current.xIndex === endX && current.yIndex === endY) break;

        const moves = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];
        for (const move of moves) {
            let xIndex = current.xIndex;
            let yIndex = current.yIndex;
            let distance = 0;
            /* Extend along the corridor one lane at a time until a box blocks the way. */
            for (;;) {
                const nextX = xIndex + move.dx;
                const nextY = yIndex + move.dy;
                if (nextX < 0 || nextX >= xList.length || nextY < 0 || nextY >= yList.length) break;
                const x1 = xList[xIndex];
                const y1 = yList[yIndex];
                const x2 = xList[nextX];
                const y2 = yList[nextY];
                if (move.dx ? blockedHorizontal(y1, x1, x2) : blockedVertical(x1, y1, y2)) break;
                xIndex = nextX;
                yIndex = nextY;
                distance += Math.abs(x2 - x1) + Math.abs(y2 - y1);
                if (obstacles.some((rect) => inside({ x: xList[xIndex], y: yList[yIndex] }, rect))) break;

                const direction = move.dx ? "h" : "v";
                const neighbour = addNode(xIndex, yIndex);
                const turn = current.direction && current.direction !== direction ? BEND_COST : 0;
                const cost = current.cost + distance + turn;
                if (cost < neighbour.cost) {
                    neighbour.cost = cost;
                    neighbour.previous = current;
                    neighbour.direction = direction;
                    queue.push(neighbour, cost);
                }
            }
        }
    }

    const target = nodes.get(key(endX, endY));
    if (!target || target.cost === Infinity) return null;
    const path = [];
    for (let node = target; node; node = node.previous) {
        path.push({ x: xList[node.xIndex], y: yList[node.yIndex] });
    }
    path.reverse();
    return [start.point, from, ...path.slice(1, -1), to, end.point];
}

/* Last-resort elbow when no corridor is free. */
function elbow(points) {
    if (points.length < 2) return points;
    const output = [points[0]];
    for (let index = 1; index < points.length; index += 1) {
        const from = output[output.length - 1];
        const to = points[index];
        const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
        if (Math.abs(to.x - from.x) > 0.5 && Math.abs(to.y - from.y) > 0.5) {
            output.push(horizontal ? { x: to.x, y: from.y } : { x: from.x, y: to.y });
        }
        output.push(to);
    }
    return output;
}

/* Pulls a loose connector tip that starts inside a box back out to its border. */
function trimInside(point, toward, boxes) {
    const dx = toward.x - point.x;
    const dy = toward.y - point.y;
    if (!dx && !dy) return point;
    let best = null;
    for (const rect of boxes) {
        const inside =
            point.x > rect.x && point.x < rect.x + rect.w && point.y > rect.y && point.y < rect.y + rect.h;
        if (!inside) continue;
        const tx = dx ? ((dx > 0 ? rect.x + rect.w : rect.x) - point.x) / dx : Infinity;
        const ty = dy ? ((dy > 0 ? rect.y + rect.h : rect.y) - point.y) / dy : Infinity;
        const t = Math.min(tx, ty);
        if (t > 0 && t < 1 && (!best || t < best)) best = t;
    }
    return best === null ? point : { x: point.x + dx * best, y: point.y + dy * best };
}

/* Puts a loose connector tip on the border of the box it was meant to touch. */
function snapTip(point, boxes, maxDistance = 26) {
    let best = null;
    for (const rect of boxes) {
        const insideY = point.y >= rect.y - 6 && point.y <= rect.y + rect.h + 6;
        const insideX = point.x >= rect.x - 6 && point.x <= rect.x + rect.w + 6;
        if (insideY) {
            for (const x of [rect.x, rect.x + rect.w]) {
                const distance = Math.abs(point.x - x);
                if (distance <= maxDistance && (!best || distance < best.distance)) best = { distance, point: { x, y: point.y } };
            }
        }
        if (insideX) {
            for (const y of [rect.y, rect.y + rect.h]) {
                const distance = Math.abs(point.y - y);
                if (distance <= maxDistance && (!best || distance < best.distance)) best = { distance, point: { x: point.x, y } };
            }
        }
    }
    return best ? best.point : point;
}

const onBorderOf = (point, rect, tolerance = 3) => {
    const withinX = point.x >= rect.x - tolerance && point.x <= rect.x + rect.w + tolerance;
    const withinY = point.y >= rect.y - tolerance && point.y <= rect.y + rect.h + tolerance;
    const nearEdgeX = Math.min(Math.abs(point.x - rect.x), Math.abs(point.x - (rect.x + rect.w))) <= tolerance;
    const nearEdgeY = Math.min(Math.abs(point.y - rect.y), Math.abs(point.y - (rect.y + rect.h))) <= tolerance;
    return (nearEdgeX && withinY) || (nearEdgeY && withinX);
};

/*
    A hand-drawn arrow often stops a little short of what it points at. Continue it along its
    own direction until it meets a box, so the head lands on the border instead of open space.
*/
function reachTip(tip, neighbour, boxes, reach = 150) {
    const dx = tip.x - neighbour.x;
    const dy = tip.y - neighbour.y;
    const length = Math.hypot(dx, dy);
    if (length < 0.5) return null;
    const ux = dx / length;
    const uy = dy / length;
    const hits = [];
    for (const rect of boxes) {
        const crossings = [];
        if (ux > 0.001) crossings.push((rect.x - tip.x) / ux);
        if (ux < -0.001) crossings.push((rect.x + rect.w - tip.x) / ux);
        if (uy > 0.001) crossings.push((rect.y - tip.y) / uy);
        if (uy < -0.001) crossings.push((rect.y + rect.h - tip.y) / uy);
        for (const t of crossings) {
            if (!(t > 0.5) || t > reach) continue;
            const point = { x: tip.x + ux * t, y: tip.y + uy * t };
            if (!onBorderOf(point, rect, 0.75)) continue;
            hits.push({ t, point });
        }
    }
    if (!hits.length) return null;
    hits.sort((a, b) => a.t - b.t);
    return {
        x: ux === 0 ? tip.x : Math.round(hits[0].point.x * 100) / 100,
        y: uy === 0 ? tip.y : Math.round(hits[0].point.y * 100) / 100,
    };
}

/*
    Hand-drawn runs wander by a pixel or two and are often split into two nearly-parallel
    halves. Pull them onto one exact axis so the line reads as a single straight segment.
*/
function straighten(points, tolerance = 6) {
    const out = points.map((point) => ({ ...point }));
    for (let index = 1; index < out.length; index += 1) {
        const from = out[index - 1];
        const to = out[index];
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        if (dy && dy <= tolerance && dx >= 12) to.y = from.y;
        else if (dx && dx <= tolerance && dy >= 12) to.x = from.x;
    }
    for (let index = 1; index < out.length - 1; index += 1) {
        const a = out[index - 1];
        const b = out[index];
        const c = out[index + 1];
        if (Math.abs(a.y - b.y) < 0.5 && Math.abs(b.x - c.x) < 0.5 && Math.abs(c.y - a.y) <= tolerance) {
            b.y = a.y;
            c.y = a.y;
        } else if (Math.abs(a.x - b.x) < 0.5 && Math.abs(b.y - c.y) < 0.5 && Math.abs(c.x - a.x) <= tolerance) {
            b.x = a.x;
            c.x = a.x;
        }
    }
    return out;
}

/*
    After the ends are settled on their boxes, any run that is only slightly off axis is pulled
    flat. Interior bends move rather than the attached tips, which stay on their borders.
*/
function alignSegments(points, tolerance = 6) {
    const out = points.map((point) => ({ ...point }));
    const kinds = [];
    for (let index = 1; index < out.length; index += 1) {
        const dx = Math.abs(out[index].x - out[index - 1].x);
        const dy = Math.abs(out[index].y - out[index - 1].y);
        if (dy < 0.5) kinds.push("h");
        else if (dx < 0.5) kinds.push("v");
        else if (dy <= tolerance && dx >= 12) kinds.push("nh");
        else if (dx <= tolerance && dy >= 12) kinds.push("nv");
        else kinds.push("d");
    }
    const flat = (kind) => kind === "h" || kind === "nh";
    const upright = (kind) => kind === "v" || kind === "nv";
    for (let start = 0; start < kinds.length; start += 1) {
        const kind = kinds[start];
        if (!flat(kind) && !upright(kind)) continue;
        let end = start;
        while (end < kinds.length && (flat(kind) ? flat(kinds[end]) : upright(kinds[end]))) end += 1;
        /* A run keeps the level the drawing gave it, so it stays lined up with the artwork.
           Only interior bends move; a tip that is left off the run is slid into line later. */
        const level = flat(kind) ? out[start].y : out[start].x;
        const last = out.length - 1;
        for (let index = start; index <= end; index += 1) {
            if (index === 0 || index === last) continue;
            if (flat(kind)) out[index].y = level;
            else out[index].x = level;
        }
        start = end - 1;
    }
    return out;
}

/* Removal of duplicate points and of tiny back-and-forth jogs left by the lanes. */
function smooth(points) {
    const output = [];
    for (const point of points) {
        const previous = output[output.length - 1];
        if (previous && Math.abs(previous.x - point.x) < 0.5 && Math.abs(previous.y - point.y) < 0.5) continue;
        output.push(point);
    }
    for (let changed = true; changed; ) {
        changed = false;
        for (let index = 1; index < output.length - 1; index += 1) {
            const a = output[index - 1];
            const b = output[index];
            const c = output[index + 1];
            const vertical = Math.abs(a.x - b.x) < 0.5 && Math.abs(b.x - c.x) < 0.5;
            const horizontal = Math.abs(a.y - b.y) < 0.5 && Math.abs(b.y - c.y) < 0.5;
            if (!vertical && !horizontal) continue;
            const between = vertical ? (b.y - a.y) * (c.y - b.y) > 0 : (b.x - a.x) * (c.x - b.x) > 0;
            if (!between) {
                output.splice(index, 1);
                changed = true;
                break;
            }
        }
    }
    return output;
}

/* Drops the sub-pixel jogs the lane grid leaves behind, so runs stay straight. */
function tidy(points, tolerance = 3) {
    const output = trim(points);
    for (let guard = 0; guard < 32; guard += 1) {
        let index = -1;
        let shortest = tolerance;
        for (let i = 1; i < output.length; i += 1) {
            const length = Math.abs(output[i].x - output[i - 1].x) + Math.abs(output[i].y - output[i - 1].y);
            if (length > 0.01 && length < shortest) {
                shortest = length;
                index = i;
            }
        }
        if (index < 0 || output.length < 3) break;
        /* Keep the two ends pinned so the arrow still meets both boxes. */
        if (index === 1) output.splice(1, 1);
        else if (index === output.length - 1) output.splice(index - 1, 1);
        else output.splice(index - 1, 2);
    }
    return trim(output);
}

const trim = (points) =>
    points.filter(
        (point, index) =>
            index === 0 ||
            Math.abs(point.x - points[index - 1].x) > 0.5 ||
            Math.abs(point.y - points[index - 1].y) > 0.5,
    );

/*
    An arrow that leaves one icon and lands on the next is usually drawn at the height of
    their artworks. A hand-drawn run can sit high above both, so a level run between the
    sides of two artworks is moved onto their shared centre.
*/
const centreRun = (points, boxes) => {
    if (points.length !== 2) return points;
    const [a, b] = points;
    if (Math.abs(a.y - b.y) > 0.6) return points;
    const sideOf = (point) =>
        boxes.find(
            (rect) =>
                rect.art &&
                point.y >= rect.y &&
                point.y <= rect.y + rect.h &&
                (Math.abs(point.x - rect.x) <= 5 || Math.abs(point.x - (rect.x + rect.w)) <= 5),
        );
    const left = sideOf(a);
    const right = sideOf(b);
    if (!left || !right || left === right) return points;
    const level = (left.y + left.h / 2 + right.y + right.h / 2) / 2;
    if (Math.abs(level - a.y) < 0.6) return points;
    /* Both heads still have to meet their artwork, not the padding under it. */
    const meets = (rect) => level > rect.y && level < rect.y + rect.h;
    if (!meets(left) || !meets(right)) return points;
    return [
        { x: a.x, y: level },
        { x: b.x, y: level },
    ];
};

/*
    Two connectors entering one piece of artwork from its sides read as a pair, so they
    should meet it at the same height. The drawing stores each elbow wherever it was last
    dragged, so an L-shaped run takes the level of the arrow already meeting that artwork
    when the two disagree.
*/
const shareEntryLevel = (routed, boxes, ink) => {
    const sideArtOf = (point) =>
        boxes.find(
            (rect) =>
                rect.art &&
                point.y > rect.y &&
                point.y < rect.y + rect.h &&
                (Math.abs(point.x - rect.x) <= 6 || Math.abs(point.x - (rect.x + rect.w)) <= 6),
        );
    /* Levels that would put the run through a caption instead of beside it are no use.
       The drawing's text boxes are far taller than their ink, so the measured ink decides. */
    const inkAlong = (level, left, right) =>
        ink.some(
            (rect) =>
                level >= rect.y - 4 &&
                level <= rect.y + rect.h + 4 &&
                right > rect.x &&
                left < rect.x + rect.w,
        );
    /* The heights the drawing's own heads already use on each piece of artwork. An elbow
       run may move, so it is no donor: two elbows would otherwise trade levels. */
    const levels = new Map();
    for (const { points } of routed) {
        if (!points || points.length !== 2) continue;
        for (const tip of [points[0], points[points.length - 1]]) {
            const art = sideArtOf(tip);
            if (!art) continue;
            const seen = levels.get(art) || [];
            seen.push(tip.y);
            levels.set(art, seen);
        }
    }
    return routed.map(({ edge, points }) => {
        if (!points || points.length !== 3) return { edge, points };
        /* The head arrives on the horizontal half of the L, whatever end it sits on. */
        const [first, middle, last] = points;
        const straight = Math.abs(first.y - middle.y) < 0.6 && Math.abs(last.x - middle.x) < 0.6;
        const mirrored = Math.abs(last.y - middle.y) < 0.6 && Math.abs(first.x - middle.x) < 0.6;
        const head = straight ? first : mirrored ? last : null;
        if (!head) return { edge, points };
        const corner = middle;
        const tail = straight ? last : first;
        const art = sideArtOf(head);
        if (!art) return { edge, points };
        const shared = (levels.get(art) || []).find(
            (level) =>
                Math.abs(level - head.y) > 0.6 &&
                Math.abs(level - head.y) <= 40 &&
                /* The turn has to stay on the same side of the run it hangs from. */
                (tail.y - level) * (tail.y - head.y) > 0 &&
                !inkAlong(level, Math.min(head.x, corner.x), Math.max(head.x, corner.x)),
        );
        if (shared === undefined) return { edge, points };
        return {
            edge,
            points: points.map((point, index) =>
                index === 1 || point === head ? { x: point.x, y: shared } : point,
            ),
        };
    });
};

function edgePoints(edge, rectById, anchorById, aliasById, obstacles, bounds, boxes, containers) {
    const resolve = (id) => (id ? aliasById.get(id) || id : null);
    const fromId = resolve(edge.from);
    const toId = resolve(edge.to);
    const fromRect = fromId ? rectById.get(fromId) : null;
    const toRect = toId ? rectById.get(toId) : null;
    const via = edge.via || [];
    /* A connector with no boxes at all still needs two stored points to be drawable. */
    const freeEnds = Boolean(edge.start && edge.end);
    if (!fromRect && !toRect && via.length < 2 && !freeEnds) return null;

    /* A part anchor wins over the box anchor so a connector can land on one
       icon inside a grouped card instead of the whole card's bounding box. */
    const anchors = [];
    if (edge.partAnchors && edge.start) anchors.push({ point: edge.start });
    else if (fromRect) anchors.push({ rect: fromRect, level: anchorById.get(fromId) });
    else if (edge.start) anchors.push({ point: edge.start });
    for (const point of via) anchors.push({ point });
    if (edge.partAnchors && edge.end) anchors.push({ point: edge.end });
    else if (toRect) anchors.push({ rect: toRect, level: anchorById.get(toId) });
    else if (edge.end) anchors.push({ point: edge.end });
    if (anchors.length < 2) return null;

    const aimOf = (anchor) => (anchor && anchor.rect ? centerOf(anchor.rect) : anchor?.point);
    const ends = anchors.map((anchor, index) => {
        if (!anchor.rect) return { point: anchor.point };
        const neighbour = aimOf(anchors[index + 1]) || aimOf(anchors[index - 1]);
        if (!neighbour) return { point: centerOf(anchor.rect) };
        const side = facingSide(anchor.rect, neighbour, anchor.level);
        /* A caption can hang over or under the artwork; vertical runs meet the node past it. */
        const full = anchor.rect.full;
        const box = anchor.rect.box;
        if (!full || !box || side.direction.x !== 0) return side;
        const grown = side.direction.y > 0 ? full.y + full.h - (box.y + box.h) : full.y - box.y;
        if (Math.abs(grown) <= 0.5) return side;
        const y = side.direction.y > 0 ? full.y + full.h + INK_CLEARANCE : full.y - INK_CLEARANCE;
        return { point: { x: side.point.x, y }, direction: side.direction };
    });

    const points = [ends[0].point];
    for (let index = 1; index < ends.length; index += 1) {
        const a = ends[index - 1];
        const b = ends[index];
        /* Waypoints with no box at either end are already the drawn shape. */
        if (!a.direction && !b.direction) {
            points.push(b.point);
            continue;
        }
        const aDirection = a.direction || fallbackDirection(a.point, b.point);
        const bDirection = b.direction || fallbackDirection(b.point, a.point);
        /* Boxes that face each other across a gap read cleaner as one straight run. */
        const opposed =
            a.direction &&
            b.direction &&
            a.direction.x === -b.direction.x &&
            a.direction.y === -b.direction.y;
        const gap = Math.abs(a.point.x - b.point.x) + Math.abs(a.point.y - b.point.y);
        if (opposed && gap <= 44) {
            points.push(b.point);
            continue;
        }
        const area = {
            x: Math.min(a.point.x, b.point.x) - ROUTE_MARGIN,
            y: Math.min(a.point.y, b.point.y) - ROUTE_MARGIN,
            w: Math.abs(a.point.x - b.point.x) + ROUTE_MARGIN * 2,
            h: Math.abs(a.point.y - b.point.y) + ROUTE_MARGIN * 2,
        };
        /* Only the boxes near this run matter, which keeps the lattice small. */
        const nearby = obstacles.filter(
            (rect) =>
                rect.x < area.x + area.w &&
                rect.x + rect.w > area.x &&
                rect.y < area.y + area.h &&
                rect.y + rect.h > area.y,
        );
        const routed = edge.direct
            ? null
            : routeOrthogonal(
                  { point: a.point, direction: aDirection },
                  { point: b.point, direction: bDirection },
                  nearby.length > 90 ? obstacles : nearby,
                  bounds,
              );
        if (routed) {
            points.push(...routed.slice(1));
        } else {
            points.push(...elbow([a.point, b.point]).slice(1));
        }
    }

    let distinct = trim(points);
    if (distinct.length < 2) return null;

    /* A route the generator already joined up exactly keeps its own ends: nudging a
       tip onto a nearby caption would put a hook back in an aligned run. */
    const exact = edge.exact === true;

    /* Drawio sometimes leaves a connector tip inside or just short of its box. */
    distinct = straighten(distinct);

    /* An arrowless run with no box at either end is drawn furniture, such as a zone
       frame: its stored points are the intended shape, so it is never nudged onto a
       box the way a real connector tip is. */
    const furniture = edge.arrow === "none" && edge.startArrow === "none" && !via.length;
    if (furniture && !fromRect && !toRect) return distinct;

    /* An unanchored end is nudged onto the nearest box, then extended towards the one it aimed at. */
    const settle = (tip, neighbour) => {
        const trimmed = trimInside(tip, neighbour, boxes);
        const snapped = snapTip(trimmed, boxes);
        if (snapped === trimmed) return reachTip(trimmed, neighbour, boxes) || trimmed;
        /* Snapping a tip sideways leaves the arrowhead hooked beside its target. Carrying on
           along the run, onto the artwork it points at, reads better while that is close. */
        const run = Math.hypot(tip.x - neighbour.x, tip.y - neighbour.y);
        const straightDown = Math.abs(tip.y - neighbour.y) >= Math.abs(tip.x - neighbour.x);
        const hooked =
            run >= 12 &&
            (straightDown ? Math.abs(snapped.x - trimmed.x) > 0.5 : Math.abs(snapped.y - trimmed.y) > 0.5);
        const ahead = hooked ? reachTip(trimmed, neighbour, boxes, 40) : null;
        if (ahead && boxes.some((rect) => rect.art && onBorderOf(ahead, rect))) return ahead;
        return snapped;
    };
    if (!fromRect && !exact) {
        const settled = settle(distinct[0], distinct[1]);
        const moved = settled.x !== distinct[0].x || settled.y !== distinct[0].y;
        distinct[0] = settled;
        /* Snapping a loose tip can tilt its approach; keep the connecting run square. */
        if (moved) distinct.splice(0, 2, ...elbow([distinct[0], distinct[1]]));
    }
    if (!toRect && !exact) {
        const last = distinct.length - 1;
        const settled = settle(distinct[last], distinct[last - 1]);
        const moved = settled.x !== distinct[last].x || settled.y !== distinct[last].y;
        distinct[last] = settled;
        if (moved) {
            const tail = distinct.length - 1;
            distinct.splice(tail - 1, 2, ...elbow([distinct[tail - 1], distinct[tail]]));
        }
    }
    /* Box-to-box connectors should read as square corners, never a diagonal run. */
    if (fromRect && toRect) distinct = elbow(distinct);
    /* Collapsing short jogs can join two points that differ on both axes, so box-to-box
       runs are squared again once the cleaning is done. */
    const cleaned = fromRect && toRect ? trim(elbow(trim(tidy(smooth(trim(distinct)))))) : trim(tidy(smooth(trim(distinct))));
    /* A self-loop or a fully trimmed fragment would draw as a lone arrowhead. */
    const span = cleaned.reduce(
        (total, point, index) =>
            index === 0 ? 0 : total + Math.abs(point.x - cleaned[index - 1].x) + Math.abs(point.y - cleaned[index - 1].y),
        0,
    );
    if (cleaned.length < 2 || span <= 1) return null;
    /* An unanchored sliver is a leftover fragment of an edited connector, never real artwork. */
    if (!fromRect && !toRect && span < 24) return null;

    /* An arrowhead floating in open space reads as a mistake, so that connector is dropped. */
    const lands = (point, arrow) =>
        !arrow || arrow === "none" || boxes.some((rect) => onBorderOf(point, rect));
    if (!fromRect && !lands(cleaned[0], edge.startArrow)) return null;
    if (!toRect && !lands(cleaned[cleaned.length - 1], edge.arrow)) return null;
    /* Collapsing a short jog can leave a slanted join, so the flattening runs last. */
    const aligned = alignSegments(cleaned);
    /* A caption that spilled past its box reaches further down (or up) than the drawing's
       connector tip, which would otherwise run through the text: the tip moves out past
       the ink, staying on its own vertical run. */
    const clearInk = (index, neighbour) => {
        const tip = aligned[index];
        const beside = aligned[neighbour];
        const vertical = Math.abs(tip.x - beside.x) < 0.6;
        const horizontal = Math.abs(tip.y - beside.y) < 0.6;
        for (const [rectId, rect] of rectById) {
            if (!rect.box || !rect.full || rect.frame) continue;
            /* A grouped card holds several nodes, and the drawing routes connectors
               between them, so a tip inside it is not a tip parked under a caption. */
            if (containers && containers.has(rectId)) continue;
            /* A tip parked under the artwork drags its run through the caption sitting there,
               so it moves out to the node edge the line is heading for. */
            const inside =
                tip.x > rect.box.x + 0.5 &&
                tip.x < rect.box.x + rect.box.w - 0.5 &&
                tip.y > rect.box.y + 0.5 &&
                tip.y < rect.box.y + rect.box.h - 0.5;
            /* A side-on tip already resting on the artwork's own edge is attached where it
               belongs, so it is left there instead of being pushed off that edge (and out
               past the frame or caption that happens to enclose the node). */
            const onArtworkSide =
                horizontal && (Math.abs(tip.x - rect.x) < 1 || Math.abs(tip.x - (rect.x + rect.w)) < 1);
            if (inside && onArtworkSide) return;
            /* A caption node can carry its icon inside its own box; a tip resting on that icon
               is attached to the artwork, not parked over the caption the box exists to hold. */
            const onInnerArtwork = boxes.some(
                (art) =>
                    art.art &&
                    art.x >= rect.x - 1 &&
                    art.x + art.w <= rect.x + rect.w + 1 &&
                    art.y >= rect.y - 1 &&
                    art.y + art.h <= rect.y + rect.h + 1 &&
                    /* Icon artwork is padded out by a few units, so allow that reach. */
                    onBorderOf(tip, art, 6),
            );
            if (inside && onInnerArtwork) return;
            if (inside) {
                if (vertical) {
                    tip.y = beside.y > tip.y ? rect.box.y + rect.box.h + INK_CLEARANCE : rect.box.y - INK_CLEARANCE;
                } else {
                    tip.x = beside.x > tip.x ? rect.box.x + rect.box.w + INK_CLEARANCE : rect.box.x - INK_CLEARANCE;
                }
                return;
            }
            /* A caption that spilled past its box is ink too: a tip that stops inside
               that spill sits on the text, so it moves out to the far side of it. */
            if (vertical && tip.x >= rect.box.x - 1 && tip.x <= rect.box.x + rect.box.w + 1) {
                const spilledTo = rect.full.y + rect.full.h;
                const spilledUp = rect.full.y;
                if (tip.y > rect.box.y + rect.box.h + 0.5 && tip.y < spilledTo + 0.5) {
                    tip.y = spilledTo + INK_CLEARANCE;
                    return;
                }
                if (tip.y < rect.box.y - 0.5 && tip.y > spilledUp - 0.5) {
                    tip.y = spilledUp - INK_CLEARANCE;
                    return;
                }
            }
            const grewBelow = rect.full.y + rect.full.h > rect.box.y + rect.box.h + 0.5;
            const grewAbove = rect.full.y < rect.box.y - 0.5;
            const grewRight = rect.full.x + rect.full.w > rect.box.x + rect.box.w + 0.5;
            const grewLeft = rect.full.x < rect.box.x - 0.5;
            if (vertical && tip.x >= rect.box.x - 1 && tip.x <= rect.box.x + rect.box.w + 1) {
                if (grewBelow && Math.abs(tip.y - (rect.box.y + rect.box.h)) < 0.6) {
                    tip.y = rect.full.y + rect.full.h + INK_CLEARANCE;
                    return;
                }
                if (grewAbove && Math.abs(tip.y - rect.box.y) < 0.6) {
                    tip.y = rect.full.y - INK_CLEARANCE;
                    return;
                }
            }
            if (horizontal && tip.y >= rect.box.y - 1 && tip.y <= rect.box.y + rect.box.h + 1) {
                if (grewRight && Math.abs(tip.x - (rect.box.x + rect.box.w)) < 0.6) {
                    tip.x = rect.full.x + rect.full.w + INK_CLEARANCE;
                    return;
                }
                if (grewLeft && Math.abs(tip.x - rect.box.x) < 0.6) {
                    tip.x = rect.full.x - INK_CLEARANCE;
                    return;
                }
            }
        }
    };
    clearInk(0, 1);
    clearInk(aligned.length - 1, aligned.length - 2);
    /* Squaring a run can leave its arrowhead a few pixels off the side it settled on, so the
       head slides along that border rather than dragging the run out of line with the artwork. */
    const slide = (index, neighbour) => {
        const tip = aligned[index];
        const beside = aligned[neighbour];
        const dx = Math.abs(tip.x - beside.x);
        const dy = Math.abs(tip.y - beside.y);
        /* A head that arrives horizontally belongs on a side of the box, so it can move vertically. */
        const spots = dy > 0 && dy <= 6 && dx >= 8 ? [{ x: tip.x, y: beside.y }] : dx > 0 && dx <= 6 && dy >= 8 ? [{ x: beside.x, y: tip.y }] : [];
        if (!spots.length) return;
        const rect = boxes.find((box) => onBorderOf(tip, box));
        if (rect && !onBorderOf(spots[0], rect)) return;
        tip.x = spots[0].x;
        tip.y = spots[0].y;
    };
    slide(0, 1);
    slide(aligned.length - 1, aligned.length - 2);
    /* Walking a stub clear can leave a couple of loose pixels behind the arrowhead. */
    return trim(smooth(trim(centreRun(aligned, boxes))));
}

function fallbackDirection(from, to) {
    if (Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)) {
        return { x: to.x >= from.x ? 1 : -1, y: 0 };
    }
    return { x: 0, y: to.y >= from.y ? 1 : -1 };
}

/* Zone frames are large translucent panels that hold other nodes. Paint order used to
   put them over the connector layer, so a panel's alpha washed out every line and
   arrowhead that passed beneath it. They are backgrounds, so they render in their own
   layer below the connectors instead. */
const isBackdropPart = (part) => {
    if (part.type !== "box" || !part.fill) return false;
    const fill = String(part.fill).trim().toLowerCase();
    if (fill === "transparent" || fill === "none") return false;
    const rgba = fill.match(/^rgba?\(([^)]+)\)$/);
    if (rgba) {
        const values = rgba[1].split(",").map((value) => value.trim());
        if (values.length < 4) return false;
        const alpha = values[3].endsWith("%") ? parseFloat(values[3]) / 100 : parseFloat(values[3]);
        return Number.isFinite(alpha) && alpha < 1;
    }
    const hex = fill.match(/^#([0-9a-f]{4}|[0-9a-f]{8})$/);
    if (!hex) return false;
    const digits = hex[1];
    const alpha = digits.length === 4 ? digits.slice(3) : digits.slice(6);
    return parseInt(alpha.length === 1 ? alpha + alpha : alpha, 16) < 255;
};

const alignToJustify = (align) => (align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center");
const alignToItems = (valign) => (valign === "top" ? "flex-start" : valign === "bottom" ? "flex-end" : "center");

/* A caption that wraps to more lines than its drawing box allows spills out of the
   box and lands on the icon above it, so it is nudged down until it clears the
   artwork. The offset is measured in drawing units so it survives zooming. */
const CAPTION_CLEARANCE = 3;

/* How far a connector tip stops past a caption's ink, so the arrowhead clears the text. */
const INK_CLEARANCE = 6;

const keepCaptionsClearOfIcons = (host) => {
    if (!host) return;
    const art = [...host.querySelectorAll(".design-part--icon")].map((icon) =>
        (icon.querySelector("svg, img") || icon).getBoundingClientRect(),
    );
    host.querySelectorAll(".design-part--text").forEach((part) => {
        part.style.removeProperty("--caption-nudge");
        const label = part.firstElementChild;
        if (!label) return;
        const ink = label.getBoundingClientRect();
        if (!ink.width || !ink.height) return;
        let nudge = 0;
        for (const glyph of art) {
            const overlapX = Math.min(ink.right, glyph.right) - Math.max(ink.left, glyph.left);
            if (overlapX <= 1) continue;
            const overlapY = Math.min(ink.bottom, glyph.bottom) - Math.max(ink.top, glyph.top);
            if (overlapY <= 1) continue;
            nudge = Math.max(nudge, glyph.bottom + CAPTION_CLEARANCE - ink.top);
        }
        if (nudge <= 0.5) return;
        const drawn = part.offsetWidth ? part.getBoundingClientRect().width / part.offsetWidth : 1;
        part.style.setProperty("--caption-nudge", `${nudge / drawn}px`);
    });
};

function Part({ part }) {
    const box = {
        left: `${part.x}px`,
        top: `${part.y}px`,
        width: `${part.w}px`,
        height: `${part.h}px`,
    };

    if (part.type === "icon") {
        return (
            <div className={`design-part design-part--icon${part.icon ? " is-glyph" : ""}`} style={box}>
                {part.icon ? <DesignIcon role={part.icon} /> : <img src={assetUrl(part.src)} alt="" draggable={false} />}
            </div>
        );
    }

    const text = part.label ? (
        <span
            className="design-part-label"
            style={{
                color: part.color,
                fontSize: `${part.size}px`,
                fontWeight: part.bold ? 600 : 400,
            }}
        >
            {part.label}
        </span>
    ) : null;

    const labelStyle = {
        textAlign: part.align === "left" ? "left" : part.align === "right" ? "right" : "center",
        justifyContent: alignToJustify(part.align),
        alignItems: alignToItems(part.valign),
    };

    if (part.type === "box") {
        return (
            <div
                className={`design-part design-part--box${part.rounded ? " is-rounded" : ""}`}
                style={{
                    ...box,
                    ...labelStyle,
                    background: part.fill,
                    border: part.strokeWidth ? `${part.strokeWidth}px ${part.dashed ? "dashed" : "solid"} ${part.stroke}` : "none",
                    borderRadius: part.rounded ? "10px" : 0,
                }}
            >
                {text}
            </div>
        );
    }

    return (
        <div className="design-part design-part--text" style={{ ...box, ...labelStyle }}>
            {text}
        </div>
    );
}

export default function DesignCanvas({ design, readable = false }) {
    const hostRef = useRef(null);
    const [fit, setFit] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [panning, setPanning] = useState(false);
    const panRef = useRef(null);
    const previousScale = useRef(0);

    /*
        A drawing's declared size comes from the nodes in it, but a boundary can be drawn as
        free-standing lines that reach past the last node. Fitting the drawing to that smaller
        size pushed such an edge off the surface, so the drawing is measured in full here.
    */
    const size = useMemo(() => {
        let artworkX = 0;
        let artworkY = 0;
        for (const item of design.items) {
            artworkX = Math.max(artworkX, item.x + item.w);
            artworkY = Math.max(artworkY, item.y + item.h);
        }
        let contentX = artworkX;
        let contentY = artworkY;
        for (const edge of design.edges) {
            /* A stroke is centred on its line, so half its width hangs past the point. */
            const overhang = (edge.width || 0) / 2;
            for (const point of [edge.start, edge.end, ...(edge.via || [])]) {
                if (!point) continue;
                contentX = Math.max(contentX, point.x + overhang);
                contentY = Math.max(contentY, point.y + overhang);
            }
        }
        /* The drawing pads its nodes; content that reaches further keeps the same margin. */
        return {
            width: contentX + Math.max(0, design.width - artworkX),
            height: contentY + Math.max(0, design.height - artworkY),
        };
    }, [design]);

    const scale = readable ? fit * zoom : fit;

    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const measure = () => {
            const { width, height } = host.getBoundingClientRect();
            if (!width || !height) return;
            const next = Math.min(width / size.width, height / size.height);
            /* The modal opens fitted, so the whole drawing is in view even on a phone;
               zooming in from there is what the zoom controls are for. */
            setFit(readable ? Math.min(1, next) : next);
        };

        measure();
        keepCaptionsClearOfIcons(host);
        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", measure);
            return () => window.removeEventListener("resize", measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(host);
        return () => observer.disconnect();
    }, [size, readable]);

    /* A new drawing opens fitted, not at the previous drawing's magnification. */
    useEffect(() => setZoom(1), [design]);

    /* Captions are measured against the current scale, so they are re-checked per drawing and zoom. */
    useLayoutEffect(() => keepCaptionsClearOfIcons(hostRef.current), [design, scale]);

    /* Alt plus the wheel magnifies; a plain wheel keeps scrolling the drawing. */
    useEffect(() => {
        const host = hostRef.current;
        if (!host || !readable) return undefined;
        const onWheel = (event) => {
            /* Ctrl/⌘-wheel scales the page, which would push the dialog and its controls off screen. */
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (!event.altKey) return;
            event.preventDefault();
            setZoom((value) => clampZoom(value * (event.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP)));
        };
        host.addEventListener("wheel", onWheel, { passive: false });
        return () => host.removeEventListener("wheel", onWheel);
    }, [readable]);

    /* Keep the middle of the viewport on the same part of the drawing when the scale changes. */
    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host || !scale) return;
        const before = previousScale.current;
        previousScale.current = scale;
        if (!before || Math.abs(before - scale) < 0.0001) return;
        const ratio = scale / before;
        host.scrollLeft = (host.scrollLeft + host.clientWidth / 2) * ratio - host.clientWidth / 2;
        host.scrollTop = (host.scrollTop + host.clientHeight / 2) * ratio - host.clientHeight / 2;
    }, [scale]);

    const startPan = (event) => {
        if (!readable || zoom <= 1 || event.button !== 0) return;
        const host = hostRef.current;
        panRef.current = { x: event.clientX, y: event.clientY, left: host.scrollLeft, top: host.scrollTop };
        setPanning(true);
        host.setPointerCapture(event.pointerId);
    };

    const movePan = (event) => {
        const pan = panRef.current;
        if (!pan) return;
        const host = hostRef.current;
        host.scrollLeft = pan.left - (event.clientX - pan.x);
        host.scrollTop = pan.top - (event.clientY - pan.y);
    };

    const endPan = (event) => {
        if (!panRef.current) return;
        panRef.current = null;
        setPanning(false);
        const host = hostRef.current;
        if (host.hasPointerCapture?.(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };

    /*
        A node's box can hold a caption hanging below its artwork. Lines meet the artwork
        (the icon, or the framed boxes) so they cannot run on through that caption.
    */
    /*
        A caption often wraps to more lines than its drawing box allows, so its ink spills
        past the node and the connector runs through the extra rows. The ink is measured
        here (drawing units, after the webfont settles) and folded back into the node box
        the router and the line ends use.
    */
    const [captionInk, setCaptionInk] = useState(() => captionInkCache.get(design) || []);
    const measureCaptionInk = useCallback(() => {
        /* The scaled drawing surface, not the panning viewport that holds it. */
        const surface = hostRef.current?.querySelector(".design-surface");
        if (!surface) return;
        const frame = surface.getBoundingClientRect();
        const unit = surface.offsetWidth ? frame.width / surface.offsetWidth : 1;
        /* A surface caught mid-transition measures zero wide, and dividing by that
           hands the layout NaN boxes; the next scheduled pass measures it properly. */
        if (!Number.isFinite(unit) || unit <= 0.01) return;
        const measured = [];
        for (const part of surface.querySelectorAll(".design-part--text")) {
            const label = part.firstElementChild;
            if (!label) continue;
            const ink = label.getBoundingClientRect();
            if (ink.height / unit <= part.offsetHeight + 2) continue;
            const box = {
                x: (ink.left - frame.left) / unit,
                y: (ink.top - frame.top) / unit,
                w: ink.width / unit,
                h: ink.height / unit,
            };
            if (![box.x, box.y, box.w, box.h].every(Number.isFinite)) continue;
            measured.push(box);
        }
        captionInkCache.set(design, measured);
        setCaptionInk((previous) =>
            previous.length === measured.length &&
            previous.every(
                (box, index) =>
                    Math.abs(box.x - measured[index].x) < 0.5 &&
                    Math.abs(box.y - measured[index].y) < 0.5 &&
                    Math.abs(box.w - measured[index].w) < 0.5 &&
                    Math.abs(box.h - measured[index].h) < 0.5,
            )
                ? previous
                : measured,
        );
    }, [design]);

    useLayoutEffect(() => {
        /* Text only settles into its final line count once the webfont is in and the
           opening transition has stopped scaling the surface, so look again a few times. */
        measureCaptionInk();
        document.fonts?.ready.then(measureCaptionInk).catch(() => {});
        const frame = requestAnimationFrame(measureCaptionInk);
        const timers = [150, 400, 800].map((delay) => window.setTimeout(measureCaptionInk, delay));
        return () => {
            cancelAnimationFrame(frame);
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [design, scale, measureCaptionInk]);

    /* Nodes whose caption spills past their box grow to hold that ink. */
    const inkBounds = useMemo(() => {
        const map = new Map();
        for (const box of captionInk) {
            for (const item of design.items) {
                const overlap = Math.min(box.x + box.w, item.x + item.w) - Math.max(box.x, item.x);
                if (overlap < Math.min(box.w, item.w) * 0.5) continue;
                /* A long caption spills above its box as well as below, so any overlap counts. */
                if (Math.min(box.y + box.h, item.y + item.h) - Math.max(box.y, item.y) <= 0) continue;
                const held = map.get(item.id) || { x: item.x, y: item.y, w: item.w, h: item.h };
                const left = Math.min(held.x, box.x);
                const top = Math.min(held.y, box.y);
                const right = Math.max(held.x + held.w, box.x + box.w);
                const bottom = Math.max(held.y + held.h, box.y + box.h);
                map.set(item.id, { x: left, y: top, w: right - left, h: bottom - top });
            }
        }
        return map;
    }, [captionInk, design.items]);

    /* A zone frame holds other nodes, so it is a background panel rather than a node. */
    const frameIds = useMemo(() => {
        const ids = new Set();
        for (const outer of design.items) {
            const holds = design.items.filter(
                (inner) =>
                    inner !== outer &&
                    inner.x > outer.x &&
                    inner.y > outer.y &&
                    inner.x + inner.w < outer.x + outer.w &&
                    inner.y + inner.h < outer.y + outer.h,
            );
            if (holds.length >= 2) ids.add(outer.id);
        }
        return ids;
    }, [design.items]);

    const rectById = useMemo(() => {
        const map = new Map();
        /* Zone frames hold other nodes, so a line may legitimately run inside them. */
        const frames = frameIds;
        for (const item of design.items) {
            const icon = item.parts.find((part) => part.type === "icon");
            const framed = item.parts.filter((part) => part.type === "box" && part.strokeWidth);
            const box = { x: item.x, y: item.y, w: item.w, h: item.h };
            const full = inkBounds.get(item.id) || box;
            const frame = frames.has(item.id);
            if (icon) {
                map.set(item.id, { x: item.x + icon.x, y: item.y + icon.y, w: icon.w, h: icon.h, full, box, frame });
            } else if (framed.length) {
                const left = Math.min(...framed.map((part) => part.x));
                const top = Math.min(...framed.map((part) => part.y));
                const right = Math.max(...framed.map((part) => part.x + part.w));
                const bottom = Math.max(...framed.map((part) => part.y + part.h));
                map.set(item.id, { x: item.x + left, y: item.y + top, w: right - left, h: bottom - top, full, box, frame });
            } else {
                map.set(item.id, { ...full, full, box, frame });
            }
        }
        return map;
    }, [design.items, inkBounds, frameIds]);

    /* Where artwork sits inside its box, so lines meet icons rather than empty padding. */
    const anchorById = useMemo(() => {
        const map = new Map();
        for (const item of design.items) {
            const icon = item.parts.find((part) => part.type === "icon");
            if (icon) {
                map.set(item.id, {
                    x: item.x + icon.x + icon.w / 2,
                    y: item.y + icon.y + icon.h / 2,
                });
                continue;
            }
            const texts = item.parts.filter((part) => part.type === "text" && part.label);
            if (texts.length) {
                const left = Math.min(...texts.map((part) => part.x));
                const right = Math.max(...texts.map((part) => part.x + part.w));
                const top = Math.min(...texts.map((part) => part.y));
                const bottom = Math.max(...texts.map((part) => part.y + part.h));
                map.set(item.id, { x: item.x + (left + right) / 2, y: item.y + (top + bottom) / 2 });
                continue;
            }
            map.set(item.id, { x: item.x + item.w / 2, y: item.y + item.h / 2 });
        }
        return map;
    }, [design.items]);

    /*
        Captions that only exist as text borrow the icon that sits above them, either the
        artwork restored for them or an icon the drawing already carried.
    */
    const aliasById = useMemo(() => {
        const map = new Map();
        for (const item of design.items) {
            if (item.iconFor && !map.has(item.iconFor)) map.set(item.iconFor, item.id);
        }
        const icons = design.items.filter(
            (item) => item.parts.some((part) => part.type === "icon") && !item.parts.some((part) => part.type === "text" && part.label),
        );
        for (const item of design.items) {
            if (map.has(item.id) || !item.parts.some((part) => part.type === "text" && part.label)) continue;
            if (item.parts.some((part) => part.type === "icon")) continue;
            const above = icons
                .map((icon) => ({
                    icon,
                    gap: item.y - (icon.y + icon.h),
                    overlap: Math.min(icon.x + icon.w, item.x + item.w) - Math.max(icon.x, item.x),
                }))
                .filter(
                    (candidate) =>
                        candidate.gap >= -8 &&
                        candidate.gap <= 64 &&
                        candidate.overlap >= Math.min(candidate.icon.w, item.w) * 0.4,
                )
                .sort((a, b) => b.overlap - a.overlap || a.gap - b.gap);
            if (above.length) map.set(item.id, above[0].icon.id);
        }
        return map;
    }, [design.items]);

    /*
        Boxes are obstacles for the router, except the large zone frames: those are
        backgrounds that hold other nodes, so their interior must stay walkable.
    */
    /*
        Targets for a hand-drawn arrowhead: the artwork itself (tile, icon, caption block)
        rather than its whole node, which can carry a lot of empty padding.
    */
    const tipBoxes = useMemo(() => {
        const out = [];
        for (const item of design.items) {
            /* An arrow must not stop on a zone frame's edge: that is a panel, not a target. */
            if (frameIds.has(item.id)) continue;
            for (const part of item.parts) {
                if (part.type === "box" && part.strokeWidth) {
                    out.push({ x: item.x + part.x, y: item.y + part.y, w: part.w, h: part.h, art: true });
                } else if (part.type === "icon") {
                    out.push({ x: item.x + part.x - 4, y: item.y + part.y - 4, w: part.w + 8, h: part.h + 8, art: true });
                } else if (part.type === "text" && part.label) {
                    out.push({ x: item.x + part.x, y: item.y + part.y, w: part.w, h: part.h, art: false });
                }
            }
        }
        return out;
    }, [design.items, frameIds]);

    /* A card that carries several pieces of artwork is a group of nodes, not one
       target, so a connector is allowed to run inside it. A single node only ever
       has one icon plus its caption. */
    const containers = useMemo(() => {
        const out = new Set();
        for (const item of design.items) {
            if (item.parts.filter((part) => part.type === "icon").length >= 2) out.add(item.id);
        }
        return out;
    }, [design.items]);

    const obstacles = useMemo(() => {
        const boxes = design.items.map((item) => ({ x: item.x, y: item.y, w: item.w, h: item.h }));
        const solid = boxes.filter(
            (box) =>
                boxes.filter(
                    (other) =>
                        other !== box &&
                        other.x > box.x &&
                        other.y > box.y &&
                        other.x + other.w < box.x + box.w &&
                        other.y + other.h < box.y + box.h,
                ).length < 2,
        );
        const padded = solid.map((box) => ({
            x: box.x - OBSTACLE_PAD,
            y: box.y - OBSTACLE_PAD,
            w: box.w + OBSTACLE_PAD * 2,
            h: box.h + OBSTACLE_PAD * 2,
        }));
        return padded.concat(captionInk);
    }, [design.items, captionInk]);

    const bounds = useMemo(() => {
        let maxX = design.width;
        let maxY = design.height;
        for (const item of design.items) {
            maxX = Math.max(maxX, item.x + item.w);
            maxY = Math.max(maxY, item.y + item.h);
        }
        return { minX: 4, minY: 4, maxX: maxX - 4, maxY: maxY - 4 };
    }, [design.items, design.width, design.height]);

    const routedEdges = useMemo(
        () =>
            shareEntryLevel(
                design.edges.map((edge) => ({
                    edge,
                    points: edgePoints(edge, rectById, anchorById, aliasById, obstacles, bounds, tipBoxes, containers),
                })),
                tipBoxes,
                captionInk,
            ),
        [design.edges, rectById, anchorById, aliasById, obstacles, bounds, tipBoxes, captionInk],
    );

    /*
        Arrowheads are drawn as real triangles from each routed run rather than as SVG
        markers: marker ids are document-global, so several canvases on one page end up
        sharing an id and an edge can inherit another drawing's arrow colour.
    */
    const withHeads = useMemo(
        () =>
            routedEdges.map(({ edge, points }) => {
                const head = (tip, behind) => {
                    const dx = tip.x - behind.x;
                    const dy = tip.y - behind.y;
                    const length = Math.hypot(dx, dy) || 1;
                    const backX = tip.x - (dx / length) * ARROW_LENGTH;
                    const backY = tip.y - (dy / length) * ARROW_LENGTH;
                    const wingX = (-dy / length) * ARROW_HALF;
                    const wingY = (dx / length) * ARROW_HALF;
                    return `${tip.x},${tip.y} ${backX + wingX},${backY + wingY} ${backX - wingX},${backY - wingY}`;
                };
                /* A tip that settles by a fraction of a unit leaves a final segment far
                   shorter than the head, and the head then points along that stub instead
                   of along the run. Measure the axis from the last point that is at least
                   a head length away, so the arrow always sits on its own line. */
                const axis = (tip, start, step) => {
                    let farthest = start >= 0 && start < points.length ? points[start] : null;
                    let widest = farthest ? Math.hypot(tip.x - farthest.x, tip.y - farthest.y) : 0;
                    for (let i = start; i >= 0 && i < points.length; i += step) {
                        const point = points[i];
                        const dist = Math.hypot(tip.x - point.x, tip.y - point.y);
                        if (dist >= ARROW_LENGTH) return point;
                        if (dist > widest) {
                            widest = dist;
                            farthest = point;
                        }
                    }
                    return farthest;
                };
                const last = points && points[points.length - 1];
                const beforeLast = last ? axis(last, points.length - 2, -1) : null;
                const first = points && points[0];
                const afterFirst = first ? axis(first, 1, 1) : null;
                return {
                    edge,
                    points,
                    endHead: last && beforeLast && edge.arrow !== "none" ? head(last, beforeLast) : null,
                    startHead: first && afterFirst && edge.startArrow !== "none" ? head(first, afterFirst) : null,
                };
            }),
        [routedEdges],
    );

    const surfaceStyle = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `scale(${scale})`,
    };
    const stageStyle = {
        width: `${size.width * scale}px`,
        height: `${size.height * scale}px`,
    };

    const canvasClass = [
        "design-canvas",
        readable && zoom > 1 ? "is-pannable" : "",
        panning ? "is-panning" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="design-viewport">
            <div
                className={canvasClass}
                ref={hostRef}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
            >
                <div className="design-canvas-stage" style={stageStyle}>
                    <div className="design-surface" style={surfaceStyle}>
                        {design.items.map((item) => {
                            const backdrops = item.parts.filter(isBackdropPart);
                            if (!backdrops.length) return null;
                            return (
                                <div
                                    key={`${item.id}-backdrop`}
                                    className="design-node"
                                    style={{
                                        left: `${item.x}px`,
                                        top: `${item.y}px`,
                                        width: `${item.w}px`,
                                        height: `${item.h}px`,
                                    }}
                                >
                                    {backdrops.map((part, index) => (
                                        <Part key={`${item.id}-backdrop-${index}`} part={part} />
                                    ))}
                                </div>
                            );
                        })}

                        <svg
                            className="design-connectors"
                            viewBox={`0 0 ${size.width} ${size.height}`}
                            aria-hidden="true"
                            focusable="false"
                        >
                            {withHeads.map(({ edge, points }) =>
                                points ? (
                                    <polyline
                                        key={edge.id}
                                        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                                        fill="none"
                                        stroke={edge.color}
                                        strokeWidth={edge.width}
                                        strokeDasharray={edge.dashed ? "6 6" : undefined}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                ) : null,
                            )}
                        </svg>

                        {design.items.map((item) => (
                            <div
                                key={item.id}
                                className="design-node"
                                style={{
                                    left: `${item.x}px`,
                                    top: `${item.y}px`,
                                    width: `${item.w}px`,
                                    height: `${item.h}px`,
                                }}
                            >
                                {item.parts.map((part, index) =>
                                    isBackdropPart(part) ? null : (
                                        <Part key={`${item.id}-${index}`} part={part} />
                                    ),
                                )}
                            </div>
                        ))}

                        <svg
                            className="design-connectors design-connectors--heads"
                            viewBox={`0 0 ${size.width} ${size.height}`}
                            aria-hidden="true"
                            focusable="false"
                        >
                            {withHeads.map(({ edge, endHead, startHead }) => (
                                <g key={`${edge.id}-heads`} fill={edge.color}>
                                    {startHead ? <polygon points={startHead} /> : null}
                                    {endHead ? <polygon points={endHead} /> : null}
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

            {readable ? (
                <div className="design-zoom" role="group" aria-label="Zoom drawing">
                    <button
                        type="button"
                        className="design-zoom-btn"
                        onClick={() => setZoom((value) => clampZoom(value / ZOOM_STEP))}
                        disabled={zoom <= 1.0001}
                        aria-label="Zoom out"
                    >
                        −
                    </button>
                    <button
                        type="button"
                        className="design-zoom-value"
                        onClick={() => setZoom(1)}
                        title="Fit to window"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <button
                        type="button"
                        className="design-zoom-btn"
                        onClick={() => setZoom((value) => clampZoom(value * ZOOM_STEP))}
                        disabled={zoom >= MAX_ZOOM - 0.0001}
                        aria-label="Zoom in"
                    >
                        +
                    </button>
                </div>
            ) : null}
        </div>
    );
}
