import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, fit, textWidth } from './text.mjs';

test('textWidth grows with length and size, bold is wider', () => {
	assert.ok(textWidth('abcd', 20, false) > textWidth('abc', 20, false));
	assert.ok(textWidth('abc', 24, false) > textWidth('abc', 20, false));
	assert.ok(textWidth('abc', 20, true) > textWidth('abc', 20, false));
});
test('fit picks the largest size that fits, or null', () => {
	assert.equal(fit('Hi', 500, 26, 18, true), 26);
	const s = fit('x'.repeat(12), 160, 26, 14, true);
	assert.ok(s < 26 && s >= 14);
	assert.equal(fit('x'.repeat(100), 160, 26, 14, true), null);
});
test('esc escapes markup', () => assert.equal(esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;'));
