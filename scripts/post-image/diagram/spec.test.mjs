import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSpec } from './spec.mjs';
import { good } from './fixtures.mjs';

test('a good spec has no errors', () => assert.deepEqual(validateSpec(good()), []));
test('not an object', () => assert.ok(validateSpec(null).length));

for (const [name, mutate, expected] of [
	['too few nodes', (s) => { s.nodes = s.nodes.slice(0, 1); s.edges = []; }, /at least 2/],
	['too many nodes', (s) => { for (let i = 0; i < 3; i++) s.nodes.push({ id: `x${i}`, label: 'x', col: 0, row: [0, 2, 0][i] }); }, /more than 6/],
	['too many edges', (s) => { s.edges = Array(9).fill(s.edges[0]); }, /more than 8 edges/],
	['same cell', (s) => { s.nodes[1].col = 0; }, /share col/],
	['grid out of range', (s) => { s.nodes[0].col = 3; }, /col and row/],
	['non-integer grid', (s) => { s.nodes[0].row = 0.5; }, /col and row/],
	['duplicate id', (s) => { s.nodes[1].id = 'apps'; }, /duplicate/],
	['node without id', (s) => { delete s.nodes[1].id; }, /no id/],
	['node without label', (s) => { s.nodes[0].label = ''; }, /no label/],
	['unknown edge node', (s) => { s.edges[0].to = 'nope'; }, /unknown node/],
	['label too long', (s) => { s.nodes[0].label = 'A very very long node label here'; }, /label too long/],
	['sub too long', (s) => { s.nodes[1].sub = 'x'.repeat(60); }, /sub text too long/],
	['edge label too long', (s) => { s.edges[1].label = 'x'.repeat(30); }, /label too long/],
	['unknown node style', (s) => { s.nodes[0].style = 'neon'; }, /unknown style/],
	['unknown edge style', (s) => { s.edges[0].style = 'neon'; }, /unknown style/],
	['self loop', (s) => { s.edges[0].to = 'apps'; }, /loops/],
])
	test(`rejects: ${name}`, () => {
		const s = good();
		mutate(s);
		assert.match(validateSpec(s).join('\n'), expected);
	});
