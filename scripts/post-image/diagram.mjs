// Diagram cards for post images: validate a small JSON spec and draw it as SVG.
//
// Spec (front matter `imageDiagram`, one line of JSON):
//   {"nodes":[{"id":"apps","label":"Apps","sub":"optional","col":0,"row":1,"style":"solid|muted"}],
//    "edges":[{"from":"apps","to":"dns","label":"optional","style":"solid|dashed|hot"}]}
// Nodes sit on a 3 x 3 grid (col 0-2, row 0-2). Edges are straight arrows. Everything is checked
// before drawing; any problem is returned in `errors` and the caller falls back to the normal card.

export const AREA = { x: 60, y: 250, w: 1080, h: 340 };
export const NODE = { w: 260, h: 88 };
const LIMITS = { nodes: 6, edges: 8, label: 22, sub: 30, edgeLabel: 18 };
const PILL_H = 28;

const textWidth = (s, size, bold) => s.length * size * (bold ? 0.66 : 0.58);
// Largest font size (down to `min`) at which `s` fits in `width`; null if it never does.
function fit(s, width, max, min, bold) {
	for (let size = max; size >= min; size -= 1) if (textWidth(s, size, bold) <= width) return size;
	return null;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function nodeRect(n) {
	const x = AREA.x + n.col * ((AREA.w - NODE.w) / 2);
	const y = AREA.y + n.row * ((AREA.h - NODE.h) / 2);
	return { x, y, w: NODE.w, h: NODE.h };
}
const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// Where the line from `r`'s center toward `to` leaves the rectangle.
function exitPoint(r, to) {
	const c = center(r);
	const dx = to.x - c.x, dy = to.y - c.y;
	const t = Math.min(dx ? r.w / 2 / Math.abs(dx) : Infinity, dy ? r.h / 2 / Math.abs(dy) : Infinity);
	return { x: c.x + dx * t, y: c.y + dy * t };
}

function segmentHitsRect(p, q, r, pad = 4) {
	// Liang-Barsky clip of segment pq against rect r grown by pad.
	const xmin = r.x - pad, xmax = r.x + r.w + pad, ymin = r.y - pad, ymax = r.y + r.h + pad;
	let t0 = 0, t1 = 1;
	const dx = q.x - p.x, dy = q.y - p.y;
	for (const [pp, qq] of [[-dx, p.x - xmin], [dx, xmax - p.x], [-dy, p.y - ymin], [dy, ymax - p.y]]) {
		if (pp === 0) { if (qq < 0) return false; continue; }
		const t = qq / pp;
		if (pp < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
		else { if (t < t0) return false; if (t < t1) t1 = t; }
	}
	return t0 <= t1;
}
const rectsOverlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function buildDiagram(spec) {
	const errors = [];
	if (!spec || typeof spec !== 'object') return { errors: ['spec is not an object'] };
	const nodes = Array.isArray(spec.nodes) ? spec.nodes : [];
	const edges = Array.isArray(spec.edges) ? spec.edges : [];
	if (nodes.length < 2) errors.push('needs at least 2 nodes');
	if (nodes.length > LIMITS.nodes) errors.push(`more than ${LIMITS.nodes} nodes`);
	if (edges.length > LIMITS.edges) errors.push(`more than ${LIMITS.edges} edges`);

	const byId = new Map();
	const cells = new Set();
	for (const n of nodes) {
		if (!n || typeof n.id !== 'string' || !n.id) { errors.push('a node has no id'); continue; }
		if (byId.has(n.id)) errors.push(`duplicate node id '${n.id}'`);
		byId.set(n.id, n);
		if (typeof n.label !== 'string' || !n.label) errors.push(`node '${n.id}' has no label`);
		else if (n.label.length > LIMITS.label || fit(n.label, NODE.w - 24, 26, 18, true) === null) errors.push(`node '${n.id}' label too long`);
		if (n.sub != null && (typeof n.sub !== 'string' || n.sub.length > LIMITS.sub || fit(n.sub, NODE.w - 24, 19, 14, false) === null)) errors.push(`node '${n.id}' sub text too long`);
		if (!Number.isInteger(n.col) || n.col < 0 || n.col > 2 || !Number.isInteger(n.row) || n.row < 0 || n.row > 2) errors.push(`node '${n.id}' needs col and row from 0 to 2`);
		else if (cells.has(`${n.col},${n.row}`)) errors.push(`two nodes share col ${n.col}, row ${n.row}`);
		else cells.add(`${n.col},${n.row}`);
		if (n.style != null && !['solid', 'muted'].includes(n.style)) errors.push(`node '${n.id}' has unknown style '${n.style}'`);
	}
	for (const e of edges) {
		if (!byId.has(e?.from) || !byId.has(e?.to)) errors.push(`edge ${e?.from} -> ${e?.to} names an unknown node`);
		else if (e.from === e.to) errors.push(`edge ${e.from} loops to itself`);
		if (e?.label != null && (typeof e.label !== 'string' || e.label.length > LIMITS.edgeLabel)) errors.push(`edge ${e.from} -> ${e.to} label too long`);
		if (e?.style != null && !['solid', 'dashed', 'hot'].includes(e.style)) errors.push(`edge ${e.from} -> ${e.to} has unknown style '${e.style}'`);
	}
	if (errors.length) return { errors };

	const rects = new Map(nodes.map((n) => [n.id, nodeRect(n)]));
	const lines = [];
	const pills = [];
	for (const e of edges) {
		const a = rects.get(e.from), b = rects.get(e.to);
		const p = exitPoint(a, center(b)), q = exitPoint(b, center(a));
		for (const n of nodes) {
			if (n.id === e.from || n.id === e.to) continue;
			if (segmentHitsRect(p, q, rects.get(n.id))) errors.push(`edge ${e.from} -> ${e.to} passes through '${n.id}'`);
		}
		if (e.label) {
			const size = 19;
			const w = textWidth(e.label, size, true) + 24;
			const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
			const pill = { x: mid.x - w / 2, y: mid.y - PILL_H / 2, w, h: PILL_H, text: e.label, size, style: e.style };
			for (const n of nodes) if (rectsOverlap(pill, { x: rects.get(n.id).x - 4, y: rects.get(n.id).y - 4, w: NODE.w + 8, h: NODE.h + 8 })) errors.push(`label '${e.label}' overlaps node '${n.id}' (move the nodes further apart)`);
			for (const o of pills) if (rectsOverlap(pill, o)) errors.push(`labels '${e.label}' and '${o.text}' overlap`);
			pills.push(pill);
		}
		lines.push({ p, q, style: e.style || 'solid' });
	}
	if (errors.length) return { errors };

	const stroke = { solid: '#fff', dashed: 'rgba(255,255,255,.85)', hot: '#ffd54a' };
	let svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" font-family="Poppins,sans-serif"><defs>`;
	for (const [k, c] of Object.entries({ solid: '#fff', dashed: 'rgba(255,255,255,.85)', hot: '#ffd54a' })) {
		svg += `<marker id="m-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`;
	}
	svg += `</defs>`;
	for (const l of lines) {
		const dash = l.style === 'solid' ? '' : ` stroke-dasharray="${l.style === 'hot' ? '10 7' : '4 8'}"`;
		svg += `<line x1="${l.p.x.toFixed(1)}" y1="${l.p.y.toFixed(1)}" x2="${l.q.x.toFixed(1)}" y2="${l.q.y.toFixed(1)}" stroke="${stroke[l.style]}" stroke-width="${l.style === 'hot' ? 5 : 4}"${dash} marker-end="url(#m-${l.style})"/>`;
	}
	for (const n of nodes) {
		const r = rects.get(n.id), muted = n.style === 'muted';
		const fill = muted ? 'rgba(255,255,255,.14)' : '#fff', ink = muted ? '#fff' : '#111', subInk = muted ? 'rgba(255,255,255,.9)' : '#333';
		svg += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="14" fill="${fill}"${muted ? ' stroke="#fff" stroke-width="3"' : ''}/>`;
		const c = center(r);
		const ls = fit(n.label, NODE.w - 24, 26, 18, true);
		if (n.sub) {
			const ss = fit(n.sub, NODE.w - 24, 19, 14, false);
			svg += `<text x="${c.x}" y="${c.y - 6}" text-anchor="middle" font-size="${ls}" font-weight="800" fill="${ink}">${esc(n.label)}</text>`;
			svg += `<text x="${c.x}" y="${c.y + 24}" text-anchor="middle" font-size="${ss}" font-weight="500" fill="${subInk}">${esc(n.sub)}</text>`;
		} else {
			svg += `<text x="${c.x}" y="${c.y + ls * 0.35}" text-anchor="middle" font-size="${ls}" font-weight="800" fill="${ink}">${esc(n.label)}</text>`;
		}
	}
	for (const p of pills) {
		const hot = p.style === 'hot';
		svg += `<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h}" rx="14" fill="rgba(20,2,8,.85)"/>`;
		svg += `<text x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h / 2 + p.size * 0.35).toFixed(1)}" text-anchor="middle" font-size="${p.size}" font-weight="800" fill="${hot ? '#ffd54a' : '#fff'}">${esc(p.text)}</text>`;
	}
	return { errors: [], svg: svg + '</svg>' };
}
