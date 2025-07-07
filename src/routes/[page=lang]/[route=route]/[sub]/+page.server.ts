import { error } from '@sveltejs/kit';
import { ContentLoader } from '$lib/utils/content';
import type { PageServerLoad } from './$types';
import type { DetailPageData } from '$lib/types';

export const load: PageServerLoad = async ({ params, parent }): Promise<DetailPageData> => {
	const lang = params.page as string;
	const route = params.route as string;
	const slug = params.sub as string;
	const loader = new ContentLoader();
	const parentData = await parent();

	// Determina il tipo di contenuto dalla route
	const routeMap = parentData.navigation[lang];
	if (!routeMap) {
		throw error(404, 'Language not found');
	}

	const isProjectsRoute = route === routeMap.projects;
	const isArticlesRoute = route === routeMap.articles;

	if (!isProjectsRoute && !isArticlesRoute) {
		throw error(404, 'Page not found');
	}

	if (isProjectsRoute) {
		const project = await loader.findContentBySlug(slug, lang, 'project');
		if (!project) {
			throw error(404, 'Project not found');
		}

		return {
			type: 'project' as const,
			content: project,
			currentLang: lang,
			availableLanguages: await loader.getAvailableLanguages('project', project.meta.id)
		};
	}

	if (isArticlesRoute) {
		const article = await loader.findContentBySlug(slug, lang, 'article');
		if (!article) {
			throw error(404, 'Article not found');
		}

		return {
			type: 'article' as const,
			content: article,
			currentLang: lang,
			availableLanguages: await loader.getAvailableLanguages('article', article.meta.id)
		};
	}

	throw error(404, 'Page not found');
};
