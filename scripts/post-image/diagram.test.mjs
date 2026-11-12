import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagram } from './diagram.mjs';

const ok = {
	nodes: [
		{ id: 'apps', label: 'Apps', col: 0, row: 1 },
		{ id: 'dns', label: 'DNS record', sub: 'Route 53', col: 1, row: 1 },
		{ id: 'old', label: 'Old: Redis OSS 7.4', sub: 'one EC2 node, no replica', col: 2, row: 0, style: 'muted' },
		{ id: 'new', label: 'New: Valkey', col: 2, row: 2 },
	],
	edges: [
		{ from: 'apps', to: 'dns' },
		{ from: 'dns', to: 'old', label: 'before' },
		{ from: 'dns', to: 'new', label: 'after', style: 'hot' },
	],
};
const clone = () => JSON.parse(JSON.stringify(ok));

test('a good spec draws', () => {
	const r = buildDiagram(ok);
	assert.deepEqual(r.errors, []);
	assert.match(r.svg, /<svg/);
});

test('text is escaped', () => {
	const s = clone();
	s.nodes[0].label = 'A <b> & C';
	assert.match(buildDiagram(s).svg, /A &lt;b&gt; &amp; C/);
});

for (const [name, mutate, expected] of [
	['too few nodes', (s) => { s.nodes = s.nodes.slice(0, 1); s.edges = []; }, /at least 2/],
	['too many nodes', (s) => { for (let i = 0; i < 3; i++) s.nodes.push({ id: `x${i}`, label: 'x', col: 0, row: i === 1 ? 0 : 2 }); }, /more than 6|share/],
	['same cell', (s) => { s.nodes[1].col = 0; }, /share col/],
	['grid out of range', (s) => { s.nodes[0].col = 3; }, /col and row/],
	['duplicate id', (s) => { s.nodes[1].id = 'apps'; }, /duplicate/],
	['unknown edge node', (s) => { s.edges[0].to = 'nope'; }, /unknown node/],
	['label too long', (s) => { s.nodes[0].label = 'A very very long node label here'; }, /too long/],
	['edge label too long', (s) => { s.edges[1].label = 'x'.repeat(30); }, /too long/],
	['unknown style', (s) => { s.edges[0].style = 'neon'; }, /unknown style/],
	['self loop', (s) => { s.edges[0].to = 'apps'; }, /loops/],
])
	test(`rejects: ${name}`, () => {
		const s = clone();
		mutate(s);
		const r = buildDiagram(s);
		assert.ok(r.errors.length, 'expected errors');
		assert.match(r.errors.join('\n'), expected);
		assert.equal(r.svg, undefined);
	});

test('rejects an edge that passes through another node', () => {
	const s = {
		nodes: [
			{ id: 'a', label: 'A', col: 0, row: 1 },
			{ id: 'b', label: 'B', col: 1, row: 1 },
			{ id: 'c', label: 'C', col: 2, row: 1 },
		],
		edges: [{ from: 'a', to: 'c' }],
	};
	assert.match(buildDiagram(s).errors.join(), /passes through 'b'/);
});

test('rejects a label that would sit on a node (adjacent rows)', () => {
	const s = {
		nodes: [
			{ id: 'a', label: 'A', col: 0, row: 0 },
			{ id: 'b', label: 'B', col: 0, row: 1 },
		],
		edges: [{ from: 'a', to: 'b', label: 'synced with something' }],
	};
	assert.ok(buildDiagram(s).errors.length);
});

test('not an object', () => {
	assert.ok(buildDiagram(null).errors.length);
});
