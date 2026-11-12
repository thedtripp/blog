import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutDiagram } from './layout.mjs';
import { renderSvg, THEME } from './render.mjs';
import { good } from './fixtures.mjs';

const svg = () => renderSvg(layoutDiagram(good()));

test('renders one rect per node, one line per edge, one pill per label', () => {
	const s = svg();
	assert.equal((s.match(/<line /g) || []).length, 4);
	assert.equal((s.match(/rx="14"/g) || []).length, 4 + 3);
	assert.match(s, /after: CNAME/);
});
test('defines an arrow marker for every edge style', () => {
	for (const k of Object.keys(THEME.edge)) assert.match(svg(), new RegExp(`id="m-${k}"`));
});
test('muted node has an outline, solid does not', () => {
	assert.match(svg(), /fill="rgba\(255,255,255,.14\)" stroke="#fff"/);
});
test('text is escaped', () => {
	const g = good();
	g.nodes[0].label = 'A <b> & C';
	assert.match(renderSvg(layoutDiagram(g)), /A &lt;b&gt; &amp; C/);
});
test('dashed edges are drawn with a dash pattern', () => {
	assert.match(svg(), /stroke-dasharray="14 9"/);
});
