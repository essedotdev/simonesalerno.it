import { describe, expect, it } from 'vitest';
import { ContentLoader } from '../../src/lib/utils/content';

// I test girano sui contenuti reali del progetto (src/lib/content), risolti via
// import.meta.glob. Le asserzioni sono strutturali per non essere fragili al
// cambiare dei contenuti.

const loader = new ContentLoader();

describe('ContentLoader - config', () => {
	it('loadConfig("languages") returns en and it', async () => {
		const langs = await loader.loadConfig('languages');
		expect(Array.isArray(langs)).toBe(true);
		expect(langs.some((l) => l.code === 'en')).toBe(true);
		expect(langs.some((l) => l.code === 'it')).toBe(true);
	});

	it('loadConfig caches the result (same reference on second call)', async () => {
		const a = await loader.loadConfig('languages');
		const b = await loader.loadConfig('languages');
		expect(a).toBe(b);
	});

	it('loadConfig("navigation") returns a per-language route map', async () => {
		const nav = await loader.loadConfig('navigation');
		expect(nav.en).toBeDefined();
		expect(nav.it).toBeDefined();
		expect(nav.en.projects).toBe('projects');
		expect(nav.it.projects).toBe('progetti');
	});
});

describe('ContentLoader - projects', () => {
	it('loadProjects("en") returns published projects with the en translation only', async () => {
		const projects = await loader.loadProjects('en');
		expect(projects.length).toBeGreaterThan(0);
		for (const p of projects) {
			expect(p.meta.published).toBe(true);
			expect(p.translations.en).toBeDefined();
			expect(p.translations.it).toBeUndefined();
		}
	});

	it('loadProjects() without lang loads all languages', async () => {
		const projects = await loader.loadProjects();
		expect(projects.length).toBeGreaterThan(0);
		// almeno un progetto ha entrambe le lingue
		expect(projects.some((p) => p.translations.en && p.translations.it)).toBe(true);
	});

	it('loadProjects() is sorted by created_date descending', async () => {
		const projects = await loader.loadProjects('en');
		const dates = projects.map((p) => new Date(p.meta.created_date).getTime());
		const sorted = [...dates].sort((a, b) => b - a);
		expect(dates).toEqual(sorted);
	});
});

describe('ContentLoader - articles', () => {
	it('loadArticles("en") returns published articles with the en translation', async () => {
		const articles = await loader.loadArticles('en');
		expect(articles.length).toBeGreaterThan(0);
		for (const a of articles) {
			expect(a.meta.published).toBe(true);
			expect(a.translations.en).toBeDefined();
		}
	});
});

describe('ContentLoader - slug map (derivata dai contenuti)', () => {
	it('loadSlugMap() returns projects and articles maps', async () => {
		const map = await loader.loadSlugMap();
		expect(map.projects).toBeDefined();
		expect(map.articles).toBeDefined();
	});

	it('ogni slug nella map combacia con la traduzione, per ogni lingua (niente drift)', async () => {
		const map = await loader.loadSlugMap();
		const projects = await loader.loadProjects(); // tutte le lingue
		// L'indice copre esattamente i progetti pubblicati
		expect(Object.keys(map.projects).length).toBe(projects.length);
		for (const p of projects) {
			for (const [lang, t] of Object.entries(p.translations)) {
				// La map e' DERIVATA dalle traduzioni: gli slug devono combaciare sempre
				expect(map.projects[p.meta.id]?.[lang]).toBe(t.slug);
			}
		}
	});

	it('loadSlugMap() is cached', async () => {
		const a = await loader.loadSlugMap();
		const b = await loader.loadSlugMap();
		expect(a).toBe(b);
	});
});

describe('ContentLoader - lookups', () => {
	it('findContentBySlug resolves a real project slug', async () => {
		const projects = await loader.loadProjects('en');
		const sample = projects[0];
		const slug = sample.translations.en!.slug;
		const found = await loader.findContentBySlug(slug, 'en', 'project');
		expect(found?.meta.id).toBe(sample.meta.id);
	});

	it('findContentBySlug returns undefined for an unknown slug', async () => {
		const found = await loader.findContentBySlug('does-not-exist-xyz', 'en', 'project');
		expect(found).toBeUndefined();
	});

	it('getAvailableLanguages returns the langs a project is translated into', async () => {
		const projects = await loader.loadProjects();
		const sample = projects[0];
		const langs = await loader.getAvailableLanguages('project', sample.meta.id);
		expect(langs).toContain('en');
	});

	it('contentExists reflects findContentBySlug', async () => {
		const projects = await loader.loadProjects('en');
		const slug = projects[0].translations.en!.slug;
		expect(await loader.contentExists(slug, 'en', 'project')).toBe(true);
		expect(await loader.contentExists('nope-xyz', 'en', 'project')).toBe(false);
	});
});

describe('ContentLoader - route helpers', () => {
	it('isValidRoute validates against navigation', async () => {
		expect(await loader.isValidRoute('projects', 'en')).toBe(true);
		expect(await loader.isValidRoute('progetti', 'it')).toBe(true);
		expect(await loader.isValidRoute('nonexistent', 'en')).toBe(false);
	});

	it('isValidLanguage validates language codes', async () => {
		expect(await loader.isValidLanguage('en')).toBe(true);
		expect(await loader.isValidLanguage('it')).toBe(true);
		expect(await loader.isValidLanguage('xx')).toBe(false);
	});

	it('getRouteType maps localized routes to logical type', async () => {
		expect(await loader.getRouteType('projects', 'en')).toBe('projects');
		expect(await loader.getRouteType('blog', 'en')).toBe('blog');
		expect(await loader.getRouteType('progetti', 'it')).toBe('projects');
		expect(await loader.getRouteType('about', 'en')).toBeNull();
	});
});
