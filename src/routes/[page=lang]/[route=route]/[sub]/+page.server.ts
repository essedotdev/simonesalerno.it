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
			currentLang: lang
		};
	}

	if (isArticlesRoute) {
		const article = await loader.findContentBySlug(slug, lang, 'article');
		if (!article) {
			throw error(404, 'Article not found');
		}

		// Articoli simili: quelli con più tag in comune (raw), max 3.
		const currentTags = new Set(article.translations[lang]?.tags ?? []);
		const related = (await loader.loadArticles(lang))
			.filter((a) => a.meta.id !== article.meta.id)
			.map((a) => ({
				article: a,
				shared: (a.translations[lang]?.tags ?? []).filter((tag) => currentTags.has(tag)).length
			}))
			.filter((entry) => entry.shared > 0)
			.sort((x, y) => y.shared - x.shared)
			.slice(0, 3)
			.map((entry) => entry.article);

		return {
			type: 'article' as const,
			content: article,
			currentLang: lang,
			related
		};
	}

	throw error(404, 'Page not found');
};
