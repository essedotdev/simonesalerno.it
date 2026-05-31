import { describe, expect, it } from 'vitest';
import { getLanguageUrl } from '../../src/lib/utils/language-url';

const navigation = {
	en: { projects: 'projects', about: 'about', articles: 'blog' },
	it: { projects: 'progetti', about: 'informazioni', articles: 'blog' }
};

const slugMap = {
	projects: { budokan: { en: 'budokan', it: 'budokan' } },
	articles: { lab: { en: 'my-new-laboratory', it: 'il-mio-nuovo-laboratorio' } }
};

function url(pathname: string, targetLang: string, search = '') {
	return getLanguageUrl({ pathname, search, navigation, slugMap, targetLang });
}

describe('getLanguageUrl', () => {
	it('homepage maps to target language root', () => {
		expect(url('/en', 'it')).toBe('/it');
	});

	it('preserves search params on the homepage', () => {
		expect(url('/en', 'it', '?ref=x')).toBe('/it?ref=x');
	});

	it('translates the route on a section page', () => {
		expect(url('/en/projects', 'it')).toBe('/it/progetti');
		expect(url('/it/progetti', 'en')).toBe('/en/projects');
	});

	it('keeps a shared route key (articles -> blog in both langs)', () => {
		expect(url('/en/blog', 'it')).toBe('/it/blog');
	});

	it('translates the slug on a project detail (same slug both langs)', () => {
		expect(url('/en/projects/budokan', 'it')).toBe('/it/progetti/budokan');
	});

	it('translates the slug on an article detail (different slug)', () => {
		expect(url('/en/blog/my-new-laboratory', 'it')).toBe('/it/blog/il-mio-nuovo-laboratorio');
		expect(url('/it/blog/il-mio-nuovo-laboratorio', 'en')).toBe('/en/blog/my-new-laboratory');
	});

	it('preserves search params on a detail page', () => {
		expect(url('/en/projects/budokan', 'it', '?x=1')).toBe('/it/progetti/budokan?x=1');
	});

	it('falls back to target root for an unrecognized route', () => {
		expect(url('/en/random', 'it')).toBe('/it');
	});

	it('falls back to the section when the slug is not translatable', () => {
		expect(url('/en/projects/unknown-slug', 'it')).toBe('/it/progetti');
	});
});
