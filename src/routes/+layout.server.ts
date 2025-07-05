import { pages } from '$lib/utils';
import getDirectusInstance from '$lib/utils/directus';
import type {
	About,
	AboutTranslation,
	Article,
	Contact,
	ContactTranslation,
	Global,
	GlobalTranslation,
	Language,
	Project,
	Welcome,
	WelcomeTranslation
} from '$lib/utils/types';
import { readItems } from '@directus/sdk';
import type { LayoutServerLoad } from './$types';

export const load = (async ({
	url
}): Promise<{
	selectedLanguage: string;
	languages: Language[];
	global: GlobalTranslation;
	welcome: WelcomeTranslation;
	projects: Project[];
	articles: Article[];
	about: AboutTranslation;
	contact: ContactTranslation;
}> => {
	const directus = getDirectusInstance(fetch);
	const languageCode = url.pathname.split('/')[1];
	const isLanguageCodeValid = Object.keys(pages).includes(languageCode);
	const validLanguageCode = isLanguageCodeValid ? languageCode : 'en';

	// Configurazione comune per le richieste di contenuto
	const translationFilter = {
		_and: [{ languages_code: { _eq: validLanguageCode } }]
	};

	// Esegue tutte le richieste in parallelo
	const [languages, global, welcome, about, contact, projects, articles] = await Promise.all([
		// Richiesta delle lingue
		directus.request<Language[]>(readItems('languages')),

		// Richieste dei contenuti principali
		directus.request<Global>(
			readItems('global', {
				deep: { translations: { _filter: translationFilter } },
				fields: [{ translations: ['*'] }],
				limit: 1
			})
		),

		directus.request<Welcome>(
			readItems('welcome', {
				deep: { translations: { _filter: translationFilter } },
				fields: [{ translations: ['*'] }],
				limit: 1
			})
		),

		directus.request<About>(
			readItems('about', {
				deep: { translations: { _filter: translationFilter } },
				fields: [{ translations: ['*'] }],
				limit: 1
			})
		),

		directus.request<Contact>(
			readItems('contact', {
				deep: { translations: { _filter: translationFilter } },
				fields: [{ translations: ['*'] }],
				limit: 1
			})
		),

		// Richiesta dei progetti (con campi aggiuntivi)
		directus.request<Project[]>(
			readItems('projects', {
				deep: { translations: { _filter: translationFilter } },
				fields: ['id', { images: ['*'], translations: ['*'] }, 'link']
			})
		),

		// Richiesta degli articoli (solo pubblicati)
		directus.request<Article[]>(
			readItems('articles', {
				deep: { translations: { _filter: translationFilter } },
				fields: ['id', { translations: ['*'] }, 'featured_image', 'published_date', 'published'],
				filter: { published: { _eq: true } },
				sort: ['-published_date']
			})
		)
	]);

	console.log(projects[1].translations[0]);

	return {
		selectedLanguage: validLanguageCode,
		languages,
		global: global.translations[0],
		welcome: welcome.translations[0],
		projects,
		articles,
		about: about.translations[0],
		contact: contact.translations[0]
	};
}) satisfies LayoutServerLoad;
