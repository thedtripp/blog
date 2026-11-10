// Generate a title image for blog posts and wire it into their front matter.
//   npm run post-image -- <slug> [<slug> ...]   (slug = filename without .md)
//   npm run post-image -- --all                 (every post missing a heroImage)
//   add --force to regenerate an existing image
// Needs Google Chrome (set CHROME_PATH if it is not at the macOS default).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const unquote = (v) => {
	v = v.trim();
	if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
	if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
	return v;
};
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

// Next theme continues the rotation from the most recent post that already has one.
function nextTheme() {
	const themed = all.filter((p) => ORDER.includes(p.fm.imageTheme)).sort(byDate);
	if (!themed.length) return ORDER[0];
	return ORDER[(ORDER.indexOf(themed.at(-1).fm.imageTheme) + 1) % ORDER.length];
}

const args = process.argv.slice(2);
const force = args.includes('--force');
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
mkdirSync(outDir, { recursive: true });

for (const slug of targets) {
	const post = readPost(slug);
	const theme = ORDER.includes(post.fm.imageTheme) ? post.fm.imageTheme : nextTheme();
	const tag = post.fm.imageTag ? `<div class="tag">${escapeHtml(post.fm.imageTag)}</div>` : '';
	const html = readFileSync(join(tplDir, 'template.html'), 'utf8')
		.replace('{{RGB}}', THEMES[theme])
		.replace('{{TITLE}}', escapeHtml(post.fm.title))
		.replace('{{TAG}}', tag);
	const tmp = join(tplDir, '.render.html');
	writeFileSync(tmp, html);
	const out = join(outDir, `${slug}.png`);
	const r = spawnSync(chrome, [
		'--headless', '--disable-gpu', ...(process.env.CI ? ['--no-sandbox'] : []), '--hide-scrollbars', '--window-size=1200,630',
		'--virtual-time-budget=4000', `--screenshot=${out}`, `file://${tmp}`,
	], { stdio: 'ignore' });
	rmSync(tmp, { force: true });
	if (r.status !== 0 || !existsSync(out)) {
		console.error(`${slug}: Chrome failed to render`);
		process.exit(1);
	}
	setKeys(post, { heroImage: `../../assets/post-images/${slug}.png`, imageTheme: theme });
	// Keep the in-memory list current so the next post continues the rotation.
	all.splice(all.findIndex((p) => p.slug === slug), 1, { slug, ...readPost(slug) });
	console.log(`${slug}: ${theme} -> src/assets/post-images/${slug}.png`);
}
