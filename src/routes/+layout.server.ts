import { ContentLoader } from '$lib/utils/content';
import type { LayoutServerLoad } from './$types';
import type { LayoutData, WelcomeContent, AboutContent, ContactContent } from '$lib/types';

export const load: LayoutServerLoad = async ({ url }): Promise<LayoutData> => {
	const loader = new ContentLoader();
	const pathParts = url.pathname.split('/');
	const lang = pathParts[1] || 'en';

	// Verifica che la lingua sia valida
	const languages = await loader.loadConfig('languages');
	const validLang = languages.find((l) => l.code === lang)?.code || 'en';

	// Carica configurazione
	const navigation = await loader.loadConfig('navigation');

	// Carica contenuti
	const global = await loader.loadGlobal(validLang);
	const welcome = (await loader.loadPage('welcome', validLang)) as WelcomeContent;
	const about = (await loader.loadPage('about', validLang)) as AboutContent;
	const contact = (await loader.loadPage('contact', validLang)) as ContactContent;
	const projectsPage = await loader.loadPage('projects', validLang);
	const blogPage = await loader.loadPage('blog', validLang);

	// Carica collezioni solo per la lingua corrente
	const projects = await loader.loadProjects(validLang);
	const articles = await loader.loadArticles(validLang);

	// Carica mappa slug leggera per il language switcher
	const slugMap = await loader.loadSlugMap();

	return {
		selectedLanguage: validLang,
		languages,
		navigation,
		global,
		welcome,
		about,
		contact,
		projectsPage,
		blogPage,
		projects,
		articles,
		slugMap
	};
};
