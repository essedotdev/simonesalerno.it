import { pages } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, params }) => {
	// Ottieni lingua e route correnti dalla URL
	const pathParts = url.pathname.split('/');
	const currentLang = pathParts[1];
	const currentRoute = pathParts[2];

	// Verifica se la route corrente è "projects" o "progetti" in base alla lingua
	const isProjectsRoute = currentRoute === pages[currentLang]?.projects;

	// Se non siamo in una route di tipo projects, lanciamo un errore 404
	if (!isProjectsRoute) {
		error(404, {
			message: 'Not Found'
		});
	}
};
