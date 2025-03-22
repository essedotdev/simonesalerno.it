import { selectedLanguage } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async () => {
	return redirect(302, `/${get(selectedLanguage)}`);
}) satisfies PageLoad;
