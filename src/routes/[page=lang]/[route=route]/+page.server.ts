import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const lang = params.page as string;
	const route = params.route as string;
	const parentData = await parent();

	// Get route map for current language
	const routeMap = parentData.navigation[lang];
	if (!routeMap) {
		throw error(404, 'Language not found');
	}

	// Check if this is a valid list route
	const isProjectsRoute = route === routeMap.projects;
	const isArticlesRoute = route === routeMap.articles;

	if (!isProjectsRoute && !isArticlesRoute) {
		throw error(404, 'Page not found');
	}

	// Return page type for the component to render
	return {
		pageType: isProjectsRoute ? 'projects' : 'articles',
		currentLang: lang
	};
};
