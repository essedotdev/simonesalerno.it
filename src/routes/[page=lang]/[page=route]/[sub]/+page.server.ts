import { pages, translation } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
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

	// Verify project exists
	const data = get(translation);
	const project = data.projects.find((project) => project.translations[0].name === projectName);

	if (!project) {
		error(404, {
			message: 'Project Not Found'
		});
	}

	return { project };
};
