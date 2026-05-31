import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildSection, buildSlugMap } from '../../scripts/generate-slug-map';

const CONTENT = fileURLToPath(new URL('../../src/lib/content', import.meta.url));

describe('generate-slug-map', () => {
	it('buildSlugMap returns projects and articles sections', () => {
		const map = buildSlugMap();
		expect(map.projects).toBeTypeOf('object');
		expect(map.articles).toBeTypeOf('object');
		expect(Object.keys(map.projects).length).toBeGreaterThan(0);
	});

	it('every entry maps a language to a non-empty slug', () => {
		const projects = buildSection('projects');
		for (const [id, langs] of Object.entries(projects)) {
			expect(Object.keys(langs).length, `${id} has no slugs`).toBeGreaterThan(0);
			for (const slug of Object.values(langs)) {
				expect(typeof slug).toBe('string');
				expect(slug.length).toBeGreaterThan(0);
			}
		}
	});

	it('only includes published items', () => {
		const projects = buildSection('projects');
		const base = join(CONTENT, 'projects');
		for (const id of Object.keys(projects)) {
			const meta = JSON.parse(readFileSync(join(base, id, 'meta.json'), 'utf-8'));
			expect(meta.published).not.toBe(false);
		}
	});

	it('is deterministic (alphabetically sorted, identical across runs)', () => {
		const a = buildSlugMap();
		const b = buildSlugMap();
		expect(JSON.stringify(a)).toBe(JSON.stringify(b));
		const keys = Object.keys(a.projects);
		expect(keys).toEqual([...keys].sort((x, y) => x.localeCompare(y)));
	});

	it('covers every published project directory on disk', () => {
		const base = join(CONTENT, 'projects');
		const onDisk = existsSync(base)
			? readdirSync(base, { withFileTypes: true })
					.filter((d) => d.isDirectory())
					.filter((d) => {
						const meta = JSON.parse(readFileSync(join(base, d.name, 'meta.json'), 'utf-8'));
						return meta.published !== false;
					})
					.map((d) => d.name)
			: [];
		const inMap = Object.keys(buildSection('projects'));
		expect(inMap.sort()).toEqual(onDisk.sort());
	});
});
