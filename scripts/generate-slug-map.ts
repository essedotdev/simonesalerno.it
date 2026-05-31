import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = join(import.meta.dirname, '..', 'src/lib/content');
const OUTPUT_FILE = join(CONTENT_DIR, 'slug-map.json');

interface SlugEntry {
	slug: string;
}

function readJsonFile(filePath: string): Record<string, unknown> {
	const content = readFileSync(filePath, 'utf-8');
	return JSON.parse(content) as Record<string, unknown>;
}

function buildSection(type: 'projects' | 'articles'): Record<string, Record<string, string>> {
	const dir = join(CONTENT_DIR, type);
	if (!existsSync(dir)) return {};

	const section: Record<string, Record<string, string>> = {};

	const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name)
	);
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const itemPath = join(dir, entry.name);
		const metaPath = join(itemPath, 'meta.json');

		if (!existsSync(metaPath)) continue;

		const meta = readJsonFile(metaPath);
		if (meta.published === false) continue;

		section[entry.name] = {};

		for (const file of readdirSync(itemPath).sort()) {
			if (!file.endsWith('.json') || file === 'meta.json') continue;
			const lang = file.replace('.json', '');
			const translation = readJsonFile(join(itemPath, file));
			const slugEntry = translation as unknown as SlugEntry;
			if (!slugEntry.slug) continue;

			section[entry.name][lang] = slugEntry.slug;
		}
	}

	return section;
}

function generate(): void {
	console.log('Generating slug map...');

	const slugMap = {
		projects: buildSection('projects'),
		articles: buildSection('articles')
	};

	writeFileSync(OUTPUT_FILE, JSON.stringify(slugMap, null, 2) + '\n');

	const projectCount = Object.values(slugMap.projects).reduce(
		(acc, slugs) => acc + Object.keys(slugs).length,
		0
	);
	const articleCount = Object.values(slugMap.articles).reduce(
		(acc, slugs) => acc + Object.keys(slugs).length,
		0
	);

	console.log(
		`Wrote slug-map.json with ${projectCount} project slugs and ${articleCount} article slugs`
	);
}

generate();
