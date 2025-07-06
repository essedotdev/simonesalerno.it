import { ContentLoader } from '$lib/utils/content';

let cachedRoutes: string[] | null = null;

// ⚠️ IMPORTANTE: Questo viene eseguito durante il BUILD PROCESS.
// Il build fallirà se 'navigation.json' non è accessibile, garantendo
// l'integrità della configurazione di routing.
export async function match(param: string): Promise<boolean> {
	if (!cachedRoutes) {
		const loader = new ContentLoader();
		const navigation = await loader.loadConfig('navigation');
		cachedRoutes = Object.values(navigation).flatMap((lang) => Object.values(lang));
	}
	return cachedRoutes.includes(param);
}
