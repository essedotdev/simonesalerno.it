import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	ArticleMetaSchema,
	ArticleTranslationSchema,
	pageSchemas,
	ProjectMetaSchema,
	ProjectTranslationSchema
} from '../../src/lib/schemas/content';

const CONTENT = fileURLToPath(new URL('../../src/lib/content', import.meta.url));

function readJson(path: string): unknown {
	return JSON.parse(readFileSync(path, 'utf-8'));
}

function eachItem(type: 'projects' | 'articles'): { dir: string; files: string[] }[] {
	const base = join(CONTENT, type);
	if (!existsSync(base)) return [];
	return readdirSync(base, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => ({
			dir: join(base, d.name),
			files: readdirSync(join(base, d.name)).filter((f) => f.endsWith('.json'))
		}));
}

// La suite replica il gate di validate-content con gli schemi RUNTIME
// (src/lib/schemas/content.ts), garantendo che runtime e dati reali siano allineati.

describe('runtime schemas validate real project content', () => {
	for (const { dir, files } of eachItem('projects')) {
		for (const file of files) {
			const schema = file === 'meta.json' ? ProjectMetaSchema : ProjectTranslationSchema;
			it(`projects/${dir.split('/').pop()}/${file}`, () => {
				const result = schema.safeParse(readJson(join(dir, file)));
				expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
			});
		}
	}
});

describe('runtime schemas validate real article content', () => {
	for (const { dir, files } of eachItem('articles')) {
		for (const file of files) {
			const schema = file === 'meta.json' ? ArticleMetaSchema : ArticleTranslationSchema;
			it(`articles/${dir.split('/').pop()}/${file}`, () => {
				const result = schema.safeParse(readJson(join(dir, file)));
				expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
			});
		}
	}
});

describe('runtime schemas validate real page content', () => {
	const pagesDir = join(CONTENT, 'pages');
	for (const page of existsSync(pagesDir) ? readdirSync(pagesDir) : []) {
		const schema = pageSchemas[page as keyof typeof pageSchemas];
		if (!schema) continue;
		for (const file of readdirSync(join(pagesDir, page)).filter((f) => f.endsWith('.json'))) {
			it(`pages/${page}/${file}`, () => {
				const result = schema.safeParse(readJson(join(pagesDir, page, file)));
				expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
			});
		}
	}
});

describe('featuredImagePlaceholder is a boolean flag (regression)', () => {
	const baseMeta = {
		id: 'x',
		images: [],
		featured_image: 'x.jpg',
		published: true,
		status: 'completed' as const,
		created_date: '2025-01-01',
		updated_date: '2025-01-01'
	};

	it('accepts a boolean', () => {
		expect(
			ProjectMetaSchema.safeParse({ ...baseMeta, featuredImagePlaceholder: true }).success
		).toBe(true);
	});

	it('rejects a string', () => {
		expect(
			ProjectMetaSchema.safeParse({ ...baseMeta, featuredImagePlaceholder: 'nope' }).success
		).toBe(false);
	});
});
