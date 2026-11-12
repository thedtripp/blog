// Generate a title image for blog posts and wire it into their front matter.
//   npm run post-image -- <slug> [<slug> ...]   (slug = filename without .md)
//   npm run post-image -- --all                 (every post missing a heroImage)
//   add --force to regenerate an existing image; --preview=<dir> renders there without touching posts
// Needs Google Chrome (set CHROME_PATH if it is not at the macOS default).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDiagram } from './post-image/diagram/index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = join(root, 'src/content/blog');
const outDir = join(root, 'src/assets/post-images');
const tplDir = join(root, 'scripts/post-image');
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // CI: google-chrome

// Alternating overlay colors, in rotation order (purple matches the main site).
const THEMES = {
	purple: '25,3,80',
	blue: '3,22,80',
	green: '3,60,30',
	red: '85,5,18',
};
const ORDER = Object.keys(THEMES);

// Avatar expressions available in scripts/post-image/avatars/. A post picks one with `imageExpression`.
const EXPRESSIONS = readdirSync(join(root, 'scripts/post-image/avatars')).map((f) => f.replace(/\.jpg$/, ''));
const DEFAULT_EXPRESSION = 'smug';

const unquote = (v) => {
	v = v.trim();
	if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
	if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
	return v;
};
// Highlight the first number in the headline.
const withNumber = (html) => html.replace(/(\S*\d\S*)/, '<span class="num">$1</span>');
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readPost(slug) {
	const path = join(postsDir, `${slug}.md`);
	const text = readFileSync(path, 'utf8');
	const m = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!m) throw new Error(`${slug}: no front matter`);
	const fm = {};
	for (const line of m[1].split('\n')) {
		const k = line.match(/^(\w+):\s*(.*)$/);
		if (k) fm[k[1]] = unquote(k[2]);
	}
	return { path, text, fm, fmBlock: m[1] };
}

function setKeys(post, kv) {
	let block = post.fmBlock;
	for (const [k, v] of Object.entries(kv)) {
		const line = `${k}: '${v}'`;
		const re = new RegExp(`^${k}:.*$`, 'm');
		block = re.test(block) ? block.replace(re, line) : `${block}\n${line}`;
	}
	writeFileSync(post.path, post.text.replace(post.fmBlock, block));
}

const slugs = readdirSync(postsDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const all = slugs.map((s) => ({ slug: s, ...readPost(s) }));
const byDate = (a, b) => new Date(a.fm.pubDate) - new Date(b.fm.pubDate);

// Pick a theme for `slug` that differs from its neighbors by date (the nearest earlier and later posts
// that already have a theme), preferring the next color in rotation after the earlier neighbor.
function nextTheme(slug) {
	const sorted = [...all].sort((a, b) => byDate(a, b) || a.slug.localeCompare(b.slug));
	const i = sorted.findIndex((p) => p.slug === slug);
	const themed = (p) => ORDER.includes(p.fm.imageTheme);
	const prev = sorted.slice(0, i).reverse().find(themed);
	const next = sorted.slice(i + 1).find(themed);
	const avoid = new Set([prev?.fm.imageTheme, next?.fm.imageTheme]);
	const start = prev ? ORDER.indexOf(prev.fm.imageTheme) + 1 : 0;
	for (let k = 0; k < ORDER.length; k++) {
		const candidate = ORDER[(start + k) % ORDER.length];
		if (!avoid.has(candidate)) return candidate;
	}
	return ORDER[start % ORDER.length];
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const previewArg = args.find((a) => a.startsWith('--preview='));
const previewDir = previewArg ? resolve(previewArg.slice(10)) : null; // render here; leave front matter alone
let targets = args.filter((a) => !a.startsWith('--'));
if (args.includes('--all')) {
	targets = all.filter((p) => force || !p.fm.heroImage).sort(byDate).map((p) => p.slug);
}
if (!targets.length) {
	console.log('Nothing to do. Usage: npm run post-image -- <slug> | --all [--force]');
	process.exit(0);
}
if (!existsSync(chrome)) {
	console.error(`Chrome not found at ${chrome}. Set CHROME_PATH.`);
	process.exit(1);
}
mkdirSync(previewDir || outDir, { recursive: true });

for (const slug of targets) {
	const post = readPost(slug);
	const theme = ORDER.includes(post.fm.imageTheme) ? post.fm.imageTheme : nextTheme(slug);
	const tag = post.fm.imageTag ? `<div class="tag">${escapeHtml(post.fm.imageTag)}</div>` : '';
	const expression = EXPRESSIONS.includes(post.fm.imageExpression) ? post.fm.imageExpression : DEFAULT_EXPRESSION;
	if (post.fm.imageExpression && expression !== post.fm.imageExpression) {
		console.warn(`${slug}: unknown imageExpression '${post.fm.imageExpression}', using ${DEFAULT_EXPRESSION}`);
	}
	// Optional diagram card. Off unless the post has `imageDiagram`; any problem falls back to the normal card.
	let diagramSvg = null;
	let diagramNote = '';
	if (post.fm.imageDiagram) {
		let result;
		try {
			result = buildDiagram(JSON.parse(post.fm.imageDiagram));
		} catch (e) {
			result = { errors: [`imageDiagram is not valid JSON (${e.message})`] };
		}
		if (result.errors.length) console.warn(`${slug}: diagram not used, falling back to the normal card:\n  - ${result.errors.join('\n  - ')}`);
		else {
			diagramSvg = result.svg;
			diagramNote = result.note ? `<div class="note">${escapeHtml(result.note)}</div>` : '';
		}
	}
	const headline = withNumber(escapeHtml(post.fm.imageHeadline || post.fm.title));
	const html = readFileSync(join(tplDir, diagramSvg ? 'template-diagram.html' : 'template.html'), 'utf8')
		.replace('{{AVATAR}}', `avatars/${expression}.jpg`)
		.replace('{{RGB}}', THEMES[theme])
		.replace('{{TITLE}}', () => headline)
		.replace('{{TAG}}', () => tag)
		.replace('{{DIAGRAM}}', () => diagramSvg || '')
		.replace('{{NOTE}}', () => diagramNote);
	const tmp = join(tplDir, '.render.html');
	writeFileSync(tmp, html);
	const out = join(previewDir || outDir, `${slug}.png`);
	const r = spawnSync(chrome, [
		'--headless', '--disable-gpu', ...(process.env.CI ? ['--no-sandbox'] : []), '--hide-scrollbars', '--window-size=1200,630',
		'--virtual-time-budget=4000', `--screenshot=${out}`, `file://${tmp}`,
	], { stdio: 'ignore' });
	rmSync(tmp, { force: true });
	if (r.status !== 0 || !existsSync(out)) {
		console.error(`${slug}: Chrome failed to render`);
		process.exit(1);
	}
	if (previewDir) {
		console.log(`${slug}: preview -> ${out}`);
		continue;
	}
	setKeys(post, { heroImage: `../../assets/post-images/${slug}.png`, imageTheme: theme });
	// Keep the in-memory list current so the next post continues the rotation.
	all.splice(all.findIndex((p) => p.slug === slug), 1, { slug, ...readPost(slug) });
	console.log(`${slug}: ${theme} -> src/assets/post-images/${slug}.png`);
}
