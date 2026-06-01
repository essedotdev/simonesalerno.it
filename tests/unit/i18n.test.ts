import { describe, expect, it } from 'vitest';
import {
	findRouteKeyAnyLang,
	isValidLanguage,
	isValidRouteForLang,
	preferredLanguage,
	routeKeyOf,
	sectionOf,
	translateRoute
} from '../../src/lib/utils/i18n';
import type { Language, NavigationConfig } from '../../src/lib/types';

const languages: Language[] = [
	{ code: 'en', name: 'English' },
	{ code: 'it', name: 'Italiano' }
];

const navigation: NavigationConfig = {
	en: { projects: 'projects', about: 'about', articles: 'blog' },
	it: { projects: 'progetti', about: 'informazioni', articles: 'blog' }
};

describe('isValidLanguage', () => {
	it('accetta i codici supportati, rifiuta gli altri e undefined', () => {
		expect(isValidLanguage('en', languages)).toBe(true);
		expect(isValidLanguage('it', languages)).toBe(true);
		expect(isValidLanguage('xx', languages)).toBe(false);
		expect(isValidLanguage(undefined, languages)).toBe(false);
	});
});

describe('routeKeyOf', () => {
	it('mappa una route localizzata alla sua chiave logica', () => {
		expect(routeKeyOf('projects', 'en', navigation)).toBe('projects');
		expect(routeKeyOf('progetti', 'it', navigation)).toBe('projects');
		expect(routeKeyOf('blog', 'it', navigation)).toBe('articles');
	});

	it('ritorna null per route o lingua sconosciute', () => {
		expect(routeKeyOf('nope', 'en', navigation)).toBeNull();
		expect(routeKeyOf('projects', 'xx', navigation)).toBeNull();
	});
});

describe('isValidRouteForLang', () => {
	it('valida una route dentro una lingua', () => {
		expect(isValidRouteForLang('progetti', 'it', navigation)).toBe(true);
		// route inglese sotto la lingua it: non valida
		expect(isValidRouteForLang('projects', 'it', navigation)).toBe(false);
		expect(isValidRouteForLang('nonexistent', 'en', navigation)).toBe(false);
	});
});

describe('findRouteKeyAnyLang', () => {
	it('trova chiave e lingua di origine di una route', () => {
		expect(findRouteKeyAnyLang('progetti', navigation)).toEqual({ key: 'projects', lang: 'it' });
		expect(findRouteKeyAnyLang('projects', navigation)).toEqual({ key: 'projects', lang: 'en' });
	});

	it('ritorna null se nessuna lingua ha quella route', () => {
		expect(findRouteKeyAnyLang('nope', navigation)).toBeNull();
	});
});

describe('translateRoute', () => {
	it('traduce una chiave logica nella route della lingua target', () => {
		expect(translateRoute('projects', 'it', navigation)).toBe('progetti');
		expect(translateRoute('projects', 'en', navigation)).toBe('projects');
	});

	it('ritorna null per chiave o lingua sconosciute', () => {
		expect(translateRoute('projects', 'xx', navigation)).toBeNull();
		expect(translateRoute('nope', 'en', navigation)).toBeNull();
	});
});

describe('sectionOf', () => {
	it('mappa la route projects alla sezione projects', () => {
		expect(sectionOf('projects', 'en', navigation)).toBe('projects');
		expect(sectionOf('progetti', 'it', navigation)).toBe('projects');
	});

	it('mappa la route articles alla sezione blog', () => {
		expect(sectionOf('blog', 'en', navigation)).toBe('blog');
		expect(sectionOf('blog', 'it', navigation)).toBe('blog');
	});

	it('ritorna null per route che non sono di sezione', () => {
		expect(sectionOf('about', 'en', navigation)).toBeNull();
	});
});

describe('preferredLanguage', () => {
	const supported = ['en', 'it'];

	it('sceglie la prima lingua supportata per q-value', () => {
		expect(preferredLanguage('it-IT,it;q=0.9,en;q=0.8', supported, 'en')).toBe('it');
		expect(preferredLanguage('en-US,en;q=0.9,it;q=0.8', supported, 'en')).toBe('en');
	});

	it('ignora i tag regionali (it-CH -> it)', () => {
		expect(preferredLanguage('it-CH', supported, 'en')).toBe('it');
	});

	it('usa il fallback se nessuna lingua è supportata o header assente', () => {
		expect(preferredLanguage('fr-FR,de;q=0.8', supported, 'en')).toBe('en');
		expect(preferredLanguage('', supported, 'en')).toBe('en');
		expect(preferredLanguage(null, supported, 'en')).toBe('en');
		expect(preferredLanguage(undefined, supported, 'en')).toBe('en');
	});

	it('rispetta i q-value anche fuori ordine', () => {
		expect(preferredLanguage('en;q=0.3, it;q=0.9', supported, 'en')).toBe('it');
	});
});
