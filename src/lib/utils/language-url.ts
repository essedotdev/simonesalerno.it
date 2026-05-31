import type { NavigationConfig, SlugMapData } from '../types';

export interface LanguageUrlParams {
	pathname: string;
	search: string;
	navigation: NavigationConfig;
	slugMap: SlugMapData;
	targetLang: string;
}

/**
 * Costruisce l'URL equivalente nella lingua target a partire dal path corrente,
 * traducendo route e slug tramite navigation + slug map. Logica pura e testabile,
 * condivisa dal LanguageSelector.
 */
export function getLanguageUrl({
	pathname,
	search,
	navigation,
	slugMap,
	targetLang
}: LanguageUrlParams): string {
	const currentPath = pathname.split('/');
	const currentLang = currentPath[1];
	const route = currentPath[2];
	const slug = currentPath[3];

	// Homepage (nessuna route)
	if (!route) {
		return `/${targetLang}${search}`;
	}

	// Chiave logica della route corrente (es. 'projects' da 'progetti')
	const currentRouteKey = Object.keys(navigation[currentLang] || {}).find(
		(key) => navigation[currentLang][key] === route
	);

	if (!currentRouteKey) {
		return `/${targetLang}${search}`;
	}

	const targetRoute = navigation[targetLang]?.[currentRouteKey];
	if (!targetRoute) {
		return `/${targetLang}${search}`;
	}

	// Pagina di sezione (nessuno slug)
	if (!slug) {
		return `/${targetLang}/${targetRoute}${search}`;
	}

	// Traduzione dello slug tramite slug map
	const map = slugMap[currentRouteKey === 'projects' ? 'projects' : 'articles'];
	const slugEntry = Object.entries(map).find(([, langs]) => langs[currentLang] === slug);

	if (!slugEntry || !slugEntry[1][targetLang]) {
		// Contenuto non disponibile nella lingua target: vai alla sezione
		return `/${targetLang}/${targetRoute}${search}`;
	}

	return `/${targetLang}/${targetRoute}/${slugEntry[1][targetLang]}${search}`;
}
