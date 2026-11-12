// Text measuring (Poppins, estimated) and escaping. No DOM, so it runs anywhere.

export const textWidth = (s, size, bold) => s.length * size * (bold ? 0.66 : 0.58);

// Largest font size (down to `min`) at which `s` fits in `width`; null if it never does.
export function fit(s, width, max, min, bold) {
	for (let size = max; size >= min; size -= 1) if (textWidth(s, size, bold) <= width) return size;
	return null;
}

export const esc = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
