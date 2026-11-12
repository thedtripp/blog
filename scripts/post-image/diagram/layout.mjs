// Geometry: put a valid spec on the canvas and check that nothing collides. Pure; no SVG here.
import { GRID } from './spec.mjs';
import { textWidth } from './text.mjs';

export const AREA = { x: 60, y: 250, w: 1080, h: 340 };
export const NODE = { w: 240, h: 88 };
export const CANVAS = { w: 1200, h: 630, margin: 16 };
export const LABEL = { size: 19, padX: 12, h: 28 };

export const nodeRect = (n) => ({
	x: AREA.x + n.col * ((AREA.w - NODE.w) / (GRID.cols - 1)),
	y: AREA.y + n.row * ((AREA.h - NODE.h) / (GRID.rows - 1)),
	w: NODE.w,
	h: NODE.h,
});
export const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// Where the line from r's center toward `to` leaves the rectangle.
export function exitPoint(r, to) {
	const c = center(r);
	const dx = to.x - c.x;
	const dy = to.y - c.y;
	const t = Math.min(dx ? r.w / 2 / Math.abs(dx) : Infinity, dy ? r.h / 2 / Math.abs(dy) : Infinity);
	return { x: c.x + dx * t, y: c.y + dy * t };
}

// Liang-Barsky: does segment p-q touch rect r grown by `pad`?
export function segmentHitsRect(p, q, r, pad = 4) {
	const xmin = r.x - pad, xmax = r.x + r.w + pad, ymin = r.y - pad, ymax = r.y + r.h + pad;
	const dx = q.x - p.x, dy = q.y - p.y;
	let t0 = 0, t1 = 1;
	for (const [d, gap] of [[-dx, p.x - xmin], [dx, xmax - p.x], [-dy, p.y - ymin], [dy, ymax - p.y]]) {
		if (d === 0) {
			if (gap < 0) return false;
			continue;
		}
		const t = gap / d;
		if (d < 0) {
			if (t > t1) return false;
			if (t > t0) t0 = t;
		} else {
			if (t < t0) return false;
			if (t < t1) t1 = t;
		}
	}
	return t0 <= t1;
}

export const rectsOverlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const grow = (r, m) => ({ x: r.x - m, y: r.y - m, w: r.w + 2 * m, h: r.h + 2 * m });

// Label center: the edge midpoint nudged off the line, above it for flat edges and to its right for
// steep ones, so the arrow stays visible. The collision checks below still apply.
export function labelCenter(p, q, pillW) {
	const dx = q.x - p.x, dy = q.y - p.y;
	const len = Math.hypot(dx, dy) || 1;
	const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
	const steep = Math.abs(dx) < Math.abs(dy);
	let nx = dy / len, ny = -dx / len; // a unit normal
	if (steep ? nx < 0 : ny > 0) { nx = -nx; ny = -ny; }
	const gap = steep ? pillW / 2 + 8 : LABEL.h / 2 + 6;
	return { x: mid.x + nx * gap, y: mid.y + ny * gap };
}

// spec must already pass validateSpec. Returns { errors, nodes, edges }.
export function layoutDiagram(spec) {
	const errors = [];
	const nodes = spec.nodes.map((n) => ({ ...n, rect: nodeRect(n) }));
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const edges = [];
	const pills = [];
	for (const e of spec.edges) {
		const a = byId.get(e.from), b = byId.get(e.to);
		const p = exitPoint(a.rect, center(b.rect));
		const q = exitPoint(b.rect, center(a.rect));
		for (const n of nodes) {
			if (n !== a && n !== b && segmentHitsRect(p, q, n.rect)) errors.push(`edge ${e.from} -> ${e.to} passes through '${n.id}'`);
		}
		let pill = null;
		if (e.label) {
			const w = textWidth(e.label, LABEL.size, true) + 2 * LABEL.padX;
			const at = labelCenter(p, q, w);
			pill = { x: at.x - w / 2, y: at.y - LABEL.h / 2, w, h: LABEL.h, text: e.label, size: LABEL.size, style: e.style || 'solid' };
			if (pill.x < CANVAS.margin || pill.x + pill.w > CANVAS.w - CANVAS.margin || pill.y < CANVAS.margin || pill.y + pill.h > CANVAS.h - CANVAS.margin) {
				errors.push(`label '${e.label}' runs off the image`);
			}
			for (const n of nodes) {
				if (rectsOverlap(pill, grow(n.rect, 4))) errors.push(`label '${e.label}' overlaps node '${n.id}' (move the nodes further apart)`);
			}
			for (const o of pills) if (rectsOverlap(pill, o)) errors.push(`labels '${e.label}' and '${o.text}' overlap`);
			pills.push(pill);
		}
		edges.push({ from: e.from, to: e.to, p, q, style: e.style || 'solid', pill });
	}
	return { errors, nodes, edges };
}
