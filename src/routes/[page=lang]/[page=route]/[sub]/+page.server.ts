import { pages } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	// Ottieni lingua e route correnti dalla URL
	const pathParts = url.pathname.split('/');
	const currentLang = pathParts[1];
	const currentRoute = pathParts[2];
	const projectName = pathParts[3];

	// Verifica se la route corrente è "projects" o "progetti" in base alla lingua
	const isProjectsRoute = currentRoute === pages[currentLang]?.projects;

	// Se non siamo in una route di tipo projects, lanciamo un errore 404
	if (!isProjectsRoute) {
		error(404, {
			message: 'Not Found'
		});
	}

	// Ottieni i dati dal parent per verificare che il progetto esista
	const parentData = await parent();
	const project = parentData.projects.find((p) => p.translations[0].name === projectName);

	// Se il progetto non esiste, restituisci 404
	if (!project) {
		error(404, {
			message: 'Project Not Found'
		});
	}

	return {
		currentLang,
		projectName,
		project
	};
};
