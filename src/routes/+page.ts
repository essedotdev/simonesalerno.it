import { selectedLanguage } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async () => {
	const lang = get(selectedLanguage) || 'en';
	return redirect(302, `/${lang}`);
}) satisfies PageLoad;
