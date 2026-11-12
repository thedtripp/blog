import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, numbersIn, verifySpec } from './verify.mjs';
import { buildDiagram } from './index.mjs';
import { good } from './fixtures.mjs';

const BODY = `They moved roughly 53 million keys from [one node](https://x.y) to a **Multi-AZ** cluster.
The source was Redis OSS 7.4, newer than the 7.2.4 fork point. Replication used RedisShake — in PSYNC mode.
Clients didn’t change; “Route 53” did.`;

const spec = (over = {}) => ({
	nodes: [
		{ id: 'a', label: 'Redis OSS 7.4', src: 'The source was Redis OSS 7.4' },
		{ id: 'b', label: 'Route 53', src: ['Clients didn\'t change', '"Route 53" did'] },
	],
	edges: [{ from: 'a', to: 'b', label: 'PSYNC', src: 'RedisShake - in PSYNC mode' }],
	...over,
});

test('normalize: markdown, quotes, dashes, case, whitespace', () => {
	assert.equal(normalize('A  [link](http://x)\n**B** “q” ’s — d'), `a link b "q" 's - d`);
});
test('numbersIn keeps decimals, drops a leading v and trailing punctuation', () => {
	assert.deepEqual(numbersIn('v2.6.0, 1.25 ms. 90%'), ['2.6.0', '1.25', '90']);
});
test('numbersIn ignores digits inside names', () => {
	assert.deepEqual(numbersIn('one EC2 node, R5.4xlarge, r7g, Gen5, S3'), []);
	assert.deepEqual(numbersIn('Redis OSS 7.4 on EC2'), ['7.4']);
});
test('a fully quoted spec passes (curly quotes, dashes and markdown are tolerated)', () => {
	assert.deepEqual(verifySpec(spec(), BODY), []);
});
test('a quote that is not in the post fails', () => {
	const s = spec();
	s.nodes[0].src = 'The source was Redis OSS 8.0 on a single node';
	assert.match(verifySpec(s, BODY).join(), /quote is not in the post/);
});
test('a label number that is not in its quote fails', () => {
	const s = spec();
	s.nodes[0].label = 'Redis OSS 7.2';
	assert.match(verifySpec(s, BODY).join(), /number 7\.2 is not in its quote/);
});
test('numbers may come from any of the listed quotes', () => {
	const s = spec();
	s.nodes[0] = { id: 'a', label: 'Redis OSS 7.4', sub: 'fork 7.2.4', src: ['The source was Redis OSS 7.4', 'newer than the 7.2.4 fork point'] };
	assert.deepEqual(verifySpec(s, BODY), []);
});
test('missing src fails for nodes and edges', () => {
	const s = spec();
	delete s.nodes[1].src;
	delete s.edges[0].src;
	const e = verifySpec(s, BODY).join('\n');
	assert.match(e, /node 'b' needs a "src"/);
	assert.match(e, /edge a -> b needs a "src"/);
});
test('a too-short quote fails (a single word proves nothing)', () => {
	const s = spec();
	s.nodes[0].src = 'Redis';
	assert.match(verifySpec(s, BODY).join(), /needs a "src"/);
});
test('quoting something that only appears in the front matter does not count', () => {
	const s = spec();
	s.nodes[0].src = 'the description line';
	assert.ok(verifySpec(s, BODY).length);
});
test('buildDiagram verifies only when given the body', () => {
	const g = good(); // no src anywhere
	assert.deepEqual(buildDiagram(g).errors, []);
	assert.ok(buildDiagram(g, { body: 'anything at all here' }).errors.length);
});
test('buildDiagram with a real body and sources draws', () => {
	const g = { nodes: [{ id: 'a', label: 'A', col: 0, row: 1, src: 'The source was Redis OSS 7.4' }, { id: 'b', label: 'B', col: 2, row: 1, src: 'Clients didn\'t change' }], edges: [{ from: 'a', to: 'b', src: 'RedisShake — in PSYNC mode' }] };
	const r = buildDiagram(g, { body: BODY });
	assert.deepEqual(r.errors, []);
	assert.match(r.svg, /<svg/);
});
