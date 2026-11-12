import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREA, NODE, center, exitPoint, labelCenter, layoutDiagram, nodeRect, rectsOverlap, segmentHitsRect } from './layout.mjs';
import { good } from './fixtures.mjs';

test('grid cells map inside the area, corners hit the edges', () => {
	const tl = nodeRect({ col: 0, row: 0 }), br = nodeRect({ col: 2, row: 2 });
	assert.equal(tl.x, AREA.x);
	assert.equal(tl.y, AREA.y);
	assert.equal(br.x + br.w, AREA.x + AREA.w);
	assert.equal(br.y + br.h, AREA.y + AREA.h);
});
test('exitPoint lies on the rectangle border', () => {
	const r = { x: 0, y: 0, w: 100, h: 50 };
	assert.deepEqual(exitPoint(r, { x: 500, y: 25 }), { x: 100, y: 25 });
	assert.deepEqual(exitPoint(r, { x: 50, y: -500 }), { x: 50, y: 0 });
});
test('segmentHitsRect', () => {
	const r = { x: 100, y: 100, w: 50, h: 50 };
	assert.equal(segmentHitsRect({ x: 0, y: 125 }, { x: 300, y: 125 }, r), true);
	assert.equal(segmentHitsRect({ x: 0, y: 0 }, { x: 300, y: 10 }, r), false);
	assert.equal(segmentHitsRect({ x: 0, y: 125 }, { x: 90, y: 125 }, r, 0), false);
});
test('rectsOverlap', () => {
	assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }), true);
	assert.equal(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 }), false);
});
test('a good spec lays out with no errors, edges end on node borders', () => {
	const r = layoutDiagram(good());
	assert.deepEqual(r.errors, []);
	assert.equal(r.edges.length, 4);
	assert.ok(r.edges[1].pill && !r.edges[0].pill);
});
test('an edge through another node is an error', () => {
	const s = { nodes: [{ id: 'a', label: 'A', col: 0, row: 1 }, { id: 'b', label: 'B', col: 1, row: 1 }, { id: 'c', label: 'C', col: 2, row: 1 }], edges: [{ from: 'a', to: 'c' }] };
	assert.match(layoutDiagram(s).errors.join(), /passes through 'b'/);
});
test('a label too wide for a short edge is an error', () => {
	const s = { nodes: [{ id: 'a', label: 'A', col: 0, row: 0 }, { id: 'b', label: 'B', col: 1, row: 0 }], edges: [{ from: 'a', to: 'b', label: 'x'.repeat(18) }] };
	assert.match(layoutDiagram(s).errors.join(), /overlaps node/);
});
test('a short label fits between adjacent rows', () => {
	const s = { nodes: [{ id: 'a', label: 'A', col: 0, row: 0 }, { id: 'b', label: 'B', col: 0, row: 1 }], edges: [{ from: 'a', to: 'b', label: 'sync' }] };
	assert.deepEqual(layoutDiagram(s).errors, []);
});
test('two labels on top of each other are an error', () => {
	const s = { nodes: [{ id: 'a', label: 'A', col: 0, row: 1 }, { id: 'b', label: 'B', col: 2, row: 1 }], edges: [{ from: 'a', to: 'b', label: 'one' }, { from: 'b', to: 'a', label: 'two' }] };
	assert.match(layoutDiagram(s).errors.join(), /labels 'two' and 'one' overlap|overlap/);
});
test('node size and center helpers agree', () => {
	const c = center(nodeRect({ col: 1, row: 1 }));
	assert.equal(c.x, AREA.x + AREA.w / 2);
	assert.equal(nodeRect({ col: 0, row: 0 }).w, NODE.w);
});
test('labels sit beside the line, not on it', () => {
	const flat = labelCenter({ x: 0, y: 100 }, { x: 200, y: 100 }, 100);
	assert.ok(flat.y < 100, 'flat edge: label above');
	const steep = labelCenter({ x: 100, y: 0 }, { x: 100, y: 200 }, 100);
	assert.ok(steep.x > 100, 'vertical edge: label to the right');
	const down = labelCenter({ x: 0, y: 0 }, { x: 200, y: 100 }, 100);
	assert.ok(down.y < 50, 'diagonal edge: label on the upper side');
});
test('a label pushed off the canvas is an error', () => {
	const s = { nodes: [{ id: 'a', label: 'A', col: 2, row: 0 }, { id: 'b', label: 'B', col: 2, row: 2 }], edges: [{ from: 'a', to: 'b', label: 'x'.repeat(18) }] };
	assert.match(layoutDiagram(s).errors.join(), /runs off the image/);
});
