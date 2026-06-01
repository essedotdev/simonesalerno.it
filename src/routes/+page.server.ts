import { redirect } from '@sveltejs/kit';
import { ContentLoader } from '$lib/utils/content';
import { preferredLanguage } from '$lib/utils/i18n';
import type { PageServerLoad } from './$types';

// La root "/" sceglie la lingua dal browser (Accept-Language), con fallback en.
// Le pagine vere vivono sotto /<lang>; questo redirect serve solo a chi arriva su "/".
export const load = (async ({ request }) => {
	const languages = await new ContentLoader().loadConfig('languages');
	const codes = languages.map((l) => l.code);
	const lang = preferredLanguage(request.headers.get('accept-language'), codes, 'en');
	redirect(302, `/${lang}`);
}) satisfies PageServerLoad;
