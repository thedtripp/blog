// Shared test spec: the Valkey cutover.
export const good = () => ({
	nodes: [
		{ id: 'apps', label: 'Apps', col: 0, row: 1 },
		{ id: 'dns', label: 'DNS record', sub: 'Route 53', col: 1, row: 1 },
		{ id: 'old', label: 'Old: Redis OSS 7.4', sub: 'one EC2 node, no replica', col: 2, row: 0, style: 'muted' },
		{ id: 'new', label: 'New: Valkey', sub: 'primary + replica, TLS', col: 2, row: 2 },
	],
	edges: [
		{ from: 'apps', to: 'dns' },
		{ from: 'dns', to: 'old', label: 'before' },
		{ from: 'dns', to: 'new', label: 'after: CNAME', style: 'hot' },
		{ from: 'old', to: 'new', label: 'RedisShake', style: 'dashed' },
	],
});
