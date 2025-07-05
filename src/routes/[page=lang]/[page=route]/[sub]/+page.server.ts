import { pages } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	// Ottieni lingua e route correnti dalla URL
	const pathParts = url.pathname.split('/');
	const currentLang = pathParts[1];
	const currentRoute = pathParts[2];
	const slug = pathParts[3];

	// Verifica se la route corrente è "projects", "progetti", "articles" in base alla lingua
	const isProjectsRoute = currentRoute === pages[currentLang]?.projects;
	const isArticlesRoute = currentRoute === pages[currentLang]?.articles;

	// Se non siamo in una route supportata, lanciamo un errore 404
	if (!isProjectsRoute && !isArticlesRoute) {
		error(404, {
			message: 'Not Found'
		});
	}

	// Ottieni i dati dal parent
	const parentData = await parent();

	if (isProjectsRoute) {
		// Cerca il progetto
		const project = parentData.projects.find((p) => p.translations[0].slug === slug);

		if (!project) {
			error(404, {
				message: 'Project Not Found'
			});
		}

		return {
			currentLang,
			slug,
			project,
			type: 'project'
		};
	} else if (isArticlesRoute) {
		// Cerca l'articolo
		const article = parentData.articles.find((a) => a.translations[0].slug === slug);

		if (!article) {
			error(404, {
				message: 'Article Not Found'
			});
		}

		return {
			currentLang,
			slug,
			article,
			type: 'article'
		};
	}

	// Fallback (non dovrebbe mai essere raggiunto)
	error(404, {
		message: 'Not Found'
	});
};
