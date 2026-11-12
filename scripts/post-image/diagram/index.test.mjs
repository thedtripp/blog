import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagram } from './index.mjs';
import { good } from './fixtures.mjs';

test('good spec -> svg, no errors', () => {
	const r = buildDiagram(good());
	assert.deepEqual(r.errors, []);
	assert.match(r.svg, /^<svg/);
});
test('spec errors stop before layout', () => {
	const g = good();
	g.nodes[0].col = 9;
	const r = buildDiagram(g);
	assert.ok(r.errors.length);
	assert.equal(r.svg, undefined);
});
test('layout errors stop before render', () => {
	const g = { nodes: [{ id: 'a', label: 'A', col: 0, row: 1 }, { id: 'b', label: 'B', col: 1, row: 1 }, { id: 'c', label: 'C', col: 2, row: 1 }], edges: [{ from: 'a', to: 'c' }] };
	const r = buildDiagram(g);
	assert.match(r.errors.join(), /passes through/);
	assert.equal(r.svg, undefined);
});
