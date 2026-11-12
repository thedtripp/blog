// Drawing: turn a computed layout into an SVG string. All colors and sizes live in THEME.
import { NODE_TEXT } from './spec.mjs';
import { center } from './layout.mjs';
import { esc, fit } from './text.mjs';

export const THEME = {
	edge: {
		solid: { color: '#fff', width: 4, dash: '' },
		dashed: { color: '#fff', width: 4, dash: '14 9' },
		hot: { color: '#ffd54a', width: 5, dash: '10 7' },
	},
	node: {
		solid: { fill: '#fff', ink: '#111', subInk: '#333', stroke: '' },
		muted: { fill: 'rgba(255,255,255,.14)', ink: '#fff', subInk: 'rgba(255,255,255,.9)', stroke: '#fff' },
	},
	pill: { fill: 'rgba(20,2,8,.85)', ink: '#fff', hotInk: '#ffd54a' },
};

const nodeSvg = (n) => {
	const t = THEME.node[n.style || 'solid'];
	const { x, y, w, h } = n.rect;
	const c = center(n.rect);
	const ls = fit(n.label, NODE_TEXT.width, NODE_TEXT.label.max, NODE_TEXT.label.min, true);
	let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${t.fill}"${t.stroke ? ` stroke="${t.stroke}" stroke-width="3"` : ''}/>`;
	if (n.sub) {
		const ss = fit(n.sub, NODE_TEXT.width, NODE_TEXT.sub.max, NODE_TEXT.sub.min, false);
		s += `<text x="${c.x}" y="${c.y - 6}" text-anchor="middle" font-size="${ls}" font-weight="800" fill="${t.ink}">${esc(n.label)}</text>`;
		s += `<text x="${c.x}" y="${c.y + 24}" text-anchor="middle" font-size="${ss}" font-weight="500" fill="${t.subInk}">${esc(n.sub)}</text>`;
	} else {
		s += `<text x="${c.x}" y="${c.y + ls * 0.35}" text-anchor="middle" font-size="${ls}" font-weight="800" fill="${t.ink}">${esc(n.label)}</text>`;
	}
	return s;
};

const edgeSvg = (e) => {
	const t = THEME.edge[e.style];
	const dash = t.dash ? ` stroke-dasharray="${t.dash}"` : '';
	return `<line x1="${e.p.x.toFixed(1)}" y1="${e.p.y.toFixed(1)}" x2="${e.q.x.toFixed(1)}" y2="${e.q.y.toFixed(1)}" stroke="${t.color}" stroke-width="${t.width}"${dash} marker-end="url(#m-${e.style})"/>`;
};

const pillSvg = (p) => {
	const ink = p.style === 'hot' ? THEME.pill.hotInk : THEME.pill.ink;
	return (
		`<rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h}" rx="14" fill="${THEME.pill.fill}"/>` +
		`<text x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h / 2 + p.size * 0.35).toFixed(1)}" text-anchor="middle" font-size="${p.size}" font-weight="800" fill="${ink}">${esc(p.text)}</text>`
	);
};

export function renderSvg({ nodes, edges }) {
	const markers = Object.entries(THEME.edge)
		.map(([k, t]) => `<marker id="m-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${t.color}"/></marker>`)
		.join('');
	return (
		`<svg width="1200" height="630" viewBox="0 0 1200 630" font-family="Poppins,sans-serif"><defs>${markers}</defs>` +
		edges.map(edgeSvg).join('') +
		nodes.map(nodeSvg).join('') +
		edges.filter((e) => e.pill).map((e) => pillSvg(e.pill)).join('') +
		'</svg>'
	);
}
