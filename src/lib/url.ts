// Join the deployed base path with an internal path, guaranteeing exactly one slash between
// them regardless of whether BASE_URL or path itself already has a leading/trailing slash.
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const rest = path.replace(/^\//, '');
	return `${base}/${rest}`;
}
