// Source check: every box and arrow must quote the post it came from. Pure; no drawing here.
//
// Each node and edge carries `src`, a verbatim quote from the post body. We check that the quote is
// really in the post and that every number shown in the label is in that quote. This proves the
// diagram's claims are grounded in the text; it can't prove an arrow means what its quote says, which
// is the agent's second-pass check (see the linkedin-posts skill).

const MIN_QUOTE = 12;

// Compare text the way a reader would: no markdown, one kind of quote and dash, one space, no case.
export function normalize(s) {
	return String(s)
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
		.replace(/[*_`#>]/g, '')
		.replace(/[‘’‚‛]/g, "'")
		.replace(/[“”„‟]/g, '"')
		.replace(/[‐‑‒–—―]/g, '-')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

// Numbers as written ("53", "1.25", "90%", "v2.6.0"). Digits inside names (EC2, r7g, Gen5) are not
// numbers, a leading "v" is ignored, and trailing punctuation is dropped.
export const numbersIn = (s) =>
	(String(s).match(/(?<![A-Za-z\d.])v?\d[\d.,]*/g) || []).map((n) => n.replace(/^v/, '').replace(/[.,]+$/, ''));

export function verifySpec(spec, body) {
	const errors = [];
	const post = normalize(body);
	// src is one quote or a list of quotes; each must be in the post, and together they must hold every number.
	const check = (what, texts, src) => {
		const quotes = (Array.isArray(src) ? src : [src]).filter((q) => q != null);
		if (!quotes.length || quotes.some((q) => typeof q !== 'string' || q.trim().length < MIN_QUOTE)) {
			errors.push(`${what} needs a "src" quote from the post (at least ${MIN_QUOTE} characters each)`);
			return;
		}
		const found = [];
		for (const q of quotes) {
			const nq = normalize(q);
			if (post.includes(nq)) found.push(nq);
			else errors.push(`${what}: the quote is not in the post: "${q.slice(0, 60)}"`);
		}
		if (found.length < quotes.length) return;
		const have = new Set(found.flatMap(numbersIn));
		for (const n of texts.flatMap(numbersIn)) if (!have.has(n)) errors.push(`${what}: the number ${n} is not in its quote`);
	};
	for (const n of spec.nodes || []) check(`node '${n.id}'`, [n.label, n.sub || ''], n.src);
	for (const e of spec.edges || []) check(`edge ${e.from} -> ${e.to}`, [e.label || ''], e.src);
	return errors;
}
