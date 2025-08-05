/**
 * Utility to map routes to their corresponding OG image filenames
 * This generates the same logic as the build script but for runtime usage
 */

/**
 * Generate OG image filename based on route parameters
 */
export function getOgImageFilename(params: {
	type?: string;
	section?: string;
	lang?: string;
	slug?: string;
}): string {
	const { type = 'home', section, lang = 'it', slug } = params;

	// Home page
	if (type === 'home') {
		return `home-${lang}.png`;
	}

	// Listing pages
	if (type === 'listing' && section) {
		return `listing-${section}-${lang}.png`;
	}

	// Detail pages
	if (type === 'detail' && section && slug) {
		const safeSlug = slug.replace(/[^a-z0-9]/g, '-');
		return `detail-${section}-${safeSlug}-${lang}.png`;
	}

	// Fallback to default
	return 'default.png';
}

/**
 * Get OG image URL for the current route
 */
export function getOgImageUrl(
	baseUrl: string,
	routeId: string | null,
	params: Record<string, string>
): string {
	let ogParams: {
		type?: string;
		section?: string;
		lang?: string;
		slug?: string;
	} = {};

	// Map SvelteKit routes to OG image parameters
	switch (routeId) {
		case '/[page=lang]':
			// Home page
			ogParams = {
				type: 'home',
				lang: params.page || 'it'
			};
			break;

		case '/[page=lang]/[route=route]':
			// Listing pages (projects/blog)
			ogParams = {
				type: 'listing',
				lang: params.page || 'it'
			};
			
			// Determine section based on route
			// You'll need to map your navigation routes here
			// For now, using generic mapping - you can enhance this
			if (params.route === 'progetti' || params.route === 'projects') {
				ogParams.section = 'projects';
			} else if (params.route === 'blog' || params.route === 'articoli') {
				ogParams.section = 'blog';
			}
			break;

		case '/[page=lang]/[route=route]/[sub]':
			// Detail pages
			ogParams = {
				type: 'detail',
				lang: params.page || 'it',
				slug: params.sub
			};
			
			// Determine section based on route
			if (params.route === 'progetti' || params.route === 'projects') {
				ogParams.section = 'projects';
			} else if (params.route === 'blog' || params.route === 'articoli') {
				ogParams.section = 'blog';
			}
			break;

		default:
			// Fallback for any other routes (error pages, etc.)
			ogParams = {
				type: 'home',
				lang: params.page || 'it'
			};
			break;
	}

	const filename = getOgImageFilename(ogParams);
	return `${baseUrl}/og-images/${filename}`;
}

/**
 * Enhanced version that uses navigation config to determine sections
 */
export function getOgImageUrlWithNavigation(
	baseUrl: string,
	routeId: string | null,
	params: Record<string, string>,
	navigation?: Record<string, Record<string, string>>
): string {
	let ogParams: {
		type?: string;
		section?: string;
		lang?: string;
		slug?: string;
	} = {};

	const lang = params.page || 'it';
	const route = params.route;

	switch (routeId) {
		case '/[page=lang]':
			ogParams = { type: 'home', lang };
			break;

		case '/[page=lang]/[route=route]':
			ogParams = { type: 'listing', lang };
			
			// Use navigation config to determine section
			if (navigation?.[lang]) {
				const navRoutes = navigation[lang];
				if (route === navRoutes.projects) {
					ogParams.section = 'projects';
				} else if (route === navRoutes.articles) {
					ogParams.section = 'blog';
				}
			}
			break;

		case '/[page=lang]/[route=route]/[sub]':
			ogParams = { type: 'detail', lang, slug: params.sub };
			
			// Use navigation config to determine section
			if (navigation?.[lang]) {
				const navRoutes = navigation[lang];
				if (route === navRoutes.projects) {
					ogParams.section = 'projects';
				} else if (route === navRoutes.articles) {
					ogParams.section = 'blog';
				}
			}
			break;

		default:
			ogParams = { type: 'home', lang };
			break;
	}

	const filename = getOgImageFilename(ogParams);
	return `${baseUrl}/og-images/${filename}`;
}
