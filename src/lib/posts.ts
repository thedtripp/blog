import { getCollection } from 'astro:content';

// Calendar date (YYYY-MM-DD) in Pacific time, so a post dated "Nov 10" goes live on Nov 10 Pacific.
const pacificDate = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

/**
 * Posts whose pubDate has arrived. Posts dated in the future stay hidden until a build runs on or
 * after their date (the deploy workflow rebuilds daily for this). `astro dev` shows everything so
 * scheduled posts can be previewed locally. Always use this instead of calling getCollection('blog').
 */
export async function getPublishedPosts() {
	const posts = await getCollection('blog');
	if (import.meta.env.DEV) return posts;
	const today = pacificDate(new Date());
	return posts.filter((post) => pacificDate(post.data.pubDate) <= today);
}
