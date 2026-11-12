// Spec validation: is the JSON well-formed and does its text fit? Pure; knows nothing about drawing.
//
//   {"nodes":[{"id":"apps","label":"Apps","sub":"optional","col":0,"row":1,"style":"solid|muted"}],
//    "edges":[{"from":"apps","to":"dns","label":"optional","style":"solid|dashed|hot"}],
//    "note":"optional footnote, e.g. who measured the numbers"}
// Nodes sit on a 3 x 3 grid (col 0-2, row 0-2). Edges are straight arrows.
import { fit } from './text.mjs';

export const GRID = { cols: 3, rows: 3 };
export const LIMITS = { nodes: 6, edges: 8, edgeLabel: 18, note: 70 };
export const NODE_STYLES = ['solid', 'muted'];
export const EDGE_STYLES = ['solid', 'dashed', 'hot'];
export const NODE_TEXT = { width: 216, label: { max: 26, min: 18 }, sub: { max: 19, min: 14 } };

const inGrid = (v, n) => Number.isInteger(v) && v >= 0 && v < n;

export function validateSpec(spec) {
	const errors = [];
	if (!spec || typeof spec !== 'object') return ['spec is not an object'];
	const nodes = Array.isArray(spec.nodes) ? spec.nodes : [];
	const edges = Array.isArray(spec.edges) ? spec.edges : [];
	if (nodes.length < 2) errors.push('needs at least 2 nodes');
	if (nodes.length > LIMITS.nodes) errors.push(`more than ${LIMITS.nodes} nodes`);
	if (edges.length > LIMITS.edges) errors.push(`more than ${LIMITS.edges} edges`);

	if (spec.note != null && (typeof spec.note !== 'string' || spec.note.length > LIMITS.note)) errors.push(`note must be text of at most ${LIMITS.note} characters`);

	const ids = new Set();
	const cells = new Set();
	for (const n of nodes) {
		if (!n || typeof n.id !== 'string' || !n.id) {
			errors.push('a node has no id');
			continue;
		}
		if (ids.has(n.id)) errors.push(`duplicate node id '${n.id}'`);
		ids.add(n.id);
		const { label, sub } = NODE_TEXT;
		if (typeof n.label !== 'string' || !n.label) errors.push(`node '${n.id}' has no label`);
		else if (fit(n.label, NODE_TEXT.width, label.max, label.min, true) === null) errors.push(`node '${n.id}' label too long`);
		if (n.sub != null && (typeof n.sub !== 'string' || fit(n.sub, NODE_TEXT.width, sub.max, sub.min, false) === null)) {
			errors.push(`node '${n.id}' sub text too long`);
		}
		if (!inGrid(n.col, GRID.cols) || !inGrid(n.row, GRID.rows)) errors.push(`node '${n.id}' needs col and row from 0 to 2`);
		else if (cells.has(`${n.col},${n.row}`)) errors.push(`two nodes share col ${n.col}, row ${n.row}`);
		else cells.add(`${n.col},${n.row}`);
		if (n.style != null && !NODE_STYLES.includes(n.style)) errors.push(`node '${n.id}' has unknown style '${n.style}'`);
	}
	for (const e of edges) {
		const name = `edge ${e?.from} -> ${e?.to}`;
		if (!ids.has(e?.from) || !ids.has(e?.to)) errors.push(`${name} names an unknown node`);
		else if (e.from === e.to) errors.push(`edge ${e.from} loops to itself`);
		if (e?.label != null && (typeof e.label !== 'string' || e.label.length > LIMITS.edgeLabel)) errors.push(`${name} label too long`);
		if (e?.style != null && !EDGE_STYLES.includes(e.style)) errors.push(`${name} has unknown style '${e.style}'`);
	}
	return errors;
}
