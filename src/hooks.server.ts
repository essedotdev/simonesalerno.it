import { ContentLoader } from '$lib/utils/content';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname, origin } = event.url;
	const pathSegments = pathname.split('/').filter(Boolean);

	try {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');

		// Determina la lingua corrente dalla URL
		let currentLang = 'en'; // default
		if (pathSegments.length > 0) {
			const firstSegment = pathSegments[0];
			if (languages.find((l) => l.code === firstSegment)) {
				currentLang = firstSegment;
			}
		}

		// Verifica che la rotta sia una sottorotta della lingua corretta
		if (pathSegments.length >= 2) {
			const [lang, sub] = pathSegments;

			// Controlla se la lingua esiste
			const langExists = languages.find((l) => l.code === lang);
			if (langExists && navigation[lang]) {
				// Controlla se la sottorotta è valida per la lingua specificata
				const validRoutes = Object.values(navigation[lang]);
				if (!validRoutes.includes(sub)) {
					// Trova la lingua corretta per la sottorotta
					const correctLang = Object.keys(navigation).find((key) =>
						Object.values(navigation[key]).includes(sub)
					);

					// Se trova una lingua corretta, reindirizza a quella
					if (correctLang) {
						const remainingSegments = pathSegments.slice(2).join('/');
						const redirectUrl = new URL(`/${correctLang}/${sub}/${remainingSegments}`, origin);
						return Response.redirect(redirectUrl.toString(), 302);
					}
				}
			}
		}

		return await resolve(event, {
			transformPageChunk: ({ html }: { html: string }) => html.replace('%lang%', currentLang)
		});
	} catch (error) {
		console.error('Error in hooks.server.ts:', error);
		// Fallback di sicurezza con lingua di default
		return await resolve(event, {
			transformPageChunk: ({ html }: { html: string }) => html.replace('%lang%', 'en')
		});
	}
};
