import type { Language, NavigationConfig } from '../types';

/**
 * Funzioni pure per la logica di routing i18n, condivise da layout, hooks e
 * getLanguageUrl. Prendono navigation/languages come argomenti (niente I/O), così
 * sono testabili in isolamento e usabili sia lato server sia lato client. Sono
 * l'unica fonte di queste regole: niente reimplementazioni inline sparse.
 *
 * Terminologia: una "route" è il segmento localizzato nell'URL (es. `progetti`),
 * la "route key" è la chiave logica in navigation (es. `projects`), la "section"
 * è l'etichetta usata da titoli e OG (`projects` | `blog`).
 */

/** Vero se `lang` è un codice lingua supportato. */
export function isValidLanguage(lang: string | undefined, languages: Language[]): boolean {
	if (!lang) return false;
	return languages.some((l) => l.code === lang);
}

/**
 * Sceglie la lingua dall'header Accept-Language: ritorna la prima lingua supportata
 * per q-value decrescente, altrimenti `fallback`. Pura e testabile; usata dalla root
 * per indirizzare "/" alla versione giusta.
 */
export function preferredLanguage(
	acceptLanguage: string | null | undefined,
	supported: string[],
	fallback: string
): string {
	if (!acceptLanguage) return fallback;

	const ranked = acceptLanguage
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const qParam = params.find((p) => p.trim().startsWith('q='));
			const q = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
			return { base: tag.trim().toLowerCase().split('-')[0], q: Number.isNaN(q) ? 0 : q };
		})
		.filter((l) => l.base)
		.sort((a, b) => b.q - a.q);

	return ranked.find((l) => supported.includes(l.base))?.base ?? fallback;
}

/**
 * Chiave logica di una route localizzata in una data lingua (es. `progetti` -> `projects`),
 * oppure null se la route non esiste in quella lingua.
 */
export function routeKeyOf(
	route: string | undefined,
	lang: string,
	navigation: NavigationConfig
): string | null {
	if (!route) return null;
	const map = navigation[lang];
	if (!map) return null;
	return Object.keys(map).find((key) => map[key] === route) ?? null;
}

/** Vero se `route` è una route valida nella lingua `lang`. */
export function isValidRouteForLang(
	route: string,
	lang: string,
	navigation: NavigationConfig
): boolean {
	return routeKeyOf(route, lang, navigation) !== null;
}

/**
 * Cerca `route` in tutte le lingue e ritorna la chiave logica con la lingua in cui
 * è stata trovata, oppure null. Utile quando non si conosce la lingua di origine
 * (es. redirect di una route nella lingua sbagliata).
 */
export function findRouteKeyAnyLang(
	route: string,
	navigation: NavigationConfig
): { key: string; lang: string } | null {
	for (const lang of Object.keys(navigation)) {
		const key = routeKeyOf(route, lang, navigation);
		if (key) return { key, lang };
	}
	return null;
}

/** Traduce una route key nella route localizzata della lingua target, o null. */
export function translateRoute(
	routeKey: string,
	targetLang: string,
	navigation: NavigationConfig
): string | null {
	return navigation[targetLang]?.[routeKey] ?? null;
}

/**
 * Sezione di contenuto di una route, usata da titoli pagina e nomi delle OG.
 * `projects` -> 'projects', `articles` -> 'blog'. Null per route non di sezione.
 */
export function sectionOf(
	route: string | undefined,
	lang: string,
	navigation: NavigationConfig
): 'projects' | 'blog' | null {
	const key = routeKeyOf(route, lang, navigation);
	if (key === 'projects') return 'projects';
	if (key === 'articles') return 'blog';
	return null;
}
