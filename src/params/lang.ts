import { ContentLoader } from '$lib/utils/content';

let cachedLanguages: string[] | null = null;

// ⚠️ IMPORTANTE: Questo viene eseguito durante il BUILD PROCESS.
// Il build fallirà se 'languages.json' non è accessibile, garantendo
// che il sito non venga mai deployato con una configurazione invalida.
export async function match(param: string): Promise<boolean> {
	if (!cachedLanguages) {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		cachedLanguages = languages.map((l) => l.code);
	}
	return cachedLanguages.includes(param);
}
