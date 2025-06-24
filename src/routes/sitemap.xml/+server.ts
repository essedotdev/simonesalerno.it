import { pages } from '$lib/utils';
import getDirectusInstance from '$lib/utils/directus';
import type { Language, Project } from '$lib/utils/types';
import { readItems } from '@directus/sdk';
import type { RequestHandler } from './$types';

const site = 'https://simonesalerno.it';

export const GET: RequestHandler = async ({ fetch }) => {
	const directus = getDirectusInstance(fetch);

	try {
		// Ottieni lingue, progetti e dati delle sezioni dal database
		const [languages, projects, welcome, about, contact] = await Promise.all([
			directus.request<Language[]>(readItems('languages')),
			directus.request<Project[]>(
				readItems('projects', {
					deep: {
						translations: {
							_filter: { languages_code: { _in: Object.keys(pages) } }
						}
					},
					fields: [{ translations: ['*'] }, 'link']
				})
			),
			directus.request(
				readItems('welcome', {
					deep: { translations: { _filter: { languages_code: { _in: Object.keys(pages) } } } },
					fields: [{ translations: ['date_updated'] }],
					limit: 1
				})
			),
			directus.request(
				readItems('about', {
					deep: { translations: { _filter: { languages_code: { _in: Object.keys(pages) } } } },
					fields: [{ translations: ['date_updated'] }],
					limit: 1
				})
			),
			directus.request(
				readItems('contact', {
					deep: { translations: { _filter: { languages_code: { _in: Object.keys(pages) } } } },
					fields: [{ translations: ['date_updated'] }],
					limit: 1
				})
			)
		]);

		// Genera le pagine della sitemap
		const sitemapPages = await generateSitemapPages(languages, projects, welcome, about, contact);

		const body = sitemap(sitemapPages);
		const response = new Response(body);
		response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
		response.headers.set('Content-Type', 'application/xml');
		return response;
	} catch (error) {
		console.error('Errore nella generazione della sitemap:', error);
		// Fallback alle pagine statiche
		const fallbackPages = Object.keys(pages).map((lang) => ({
			slug: lang,
			lastMod: new Date().toISOString().split('T')[0],
			priority: 1,
			changefreq: 'monthly',
			hreflang: lang
		}));

		const body = sitemap(fallbackPages);
		const response = new Response(body);
		response.headers.set('Content-Type', 'application/xml');
		return response;
	}
};

async function generateSitemapPages(
	languages: Language[],
	projects: Project[],
	welcome: any,
	about: any,
	contact: any
) {
	const sitemapPages: Array<{
		slug: string;
		lastMod: string;
		priority: number;
		changefreq: string;
		hreflang: string;
		alternates?: Array<{ hreflang: string; href: string }>;
	}> = [];

	const currentDate = new Date().toISOString().split('T')[0];

	for (const language of languages) {
		const langCode = language.code;

		// Calcola le date di ultima modifica per la lingua corrente
		const welcomeLastMod = getLatestModificationDate([
			...welcome.translations
				.filter((t: any) => t.languages_code === langCode)
				.map((t: any) => t.date_updated)
		]);
		const aboutLastMod = getLatestModificationDate([
			...about.translations
				.filter((t: any) => t.languages_code === langCode)
				.map((t: any) => t.date_updated)
		]);
		const contactLastMod = getLatestModificationDate([
			...contact.translations
				.filter((t: any) => t.languages_code === langCode)
				.map((t: any) => t.date_updated)
		]);
		const projectsLastMod = getProjectsLastModForLanguage(projects, langCode);

		// La data più recente tra tutte le sezioni per la homepage di questa lingua
		const homepageLastMod = getLatestModificationDate([
			welcomeLastMod,
			aboutLastMod,
			contactLastMod,
			projectsLastMod
		]);

		// Pagina principale
		sitemapPages.push({
			slug: langCode,
			lastMod: homepageLastMod,
			priority: 1.0,
			changefreq: 'monthly',
			hreflang: langCode,
			alternates: languages
				.filter((l) => l.code !== langCode)
				.map((l) => ({ hreflang: l.code, href: `${site}/${l.code}` }))
		});

		// Pagine delle sezioni (projects, about)
		if (pages[langCode]) {
			const pageRoutes = pages[langCode];

			// Pagina progetti
			if (pageRoutes.projects) {
				sitemapPages.push({
					slug: `${langCode}/${pageRoutes.projects}`,
					lastMod: projectsLastMod,
					priority: 0.8,
					changefreq: 'weekly',
					hreflang: langCode,
					alternates: languages
						.filter((l) => l.code !== langCode && pages[l.code]?.projects)
						.map((l) => ({
							hreflang: l.code,
							href: `${site}/${l.code}/${pages[l.code].projects}`
						}))
				});
			}

			// Pagina about
			if (pageRoutes.about) {
				sitemapPages.push({
					slug: `${langCode}/${pageRoutes.about}`,
					lastMod: aboutLastMod,
					priority: 0.7,
					changefreq: 'monthly',
					hreflang: langCode,
					alternates: languages
						.filter((l) => l.code !== langCode && pages[l.code]?.about)
						.map((l) => ({
							hreflang: l.code,
							href: `${site}/${l.code}/${pages[l.code].about}`
						}))
				});
			}
		}

		// Pagine dei progetti individuali
		if (pages[langCode]?.projects) {
			for (const project of projects) {
				const translation = project.translations.find((t) => t.languages_code === langCode);
				// Escludi progetti con slug uguale alla route padre per evitare duplicazioni
				if (translation && translation.name !== pages[langCode].projects) {
					sitemapPages.push({
						slug: `${langCode}/${pages[langCode].projects}/${translation.name}`,
						lastMod: getProjectLastModForLanguage(project, langCode),
						priority: 0.6,
						changefreq: 'monthly',
						hreflang: langCode,
						alternates: languages
							.filter((l) => l.code !== langCode && pages[l.code]?.projects)
							.map((l) => {
								const altTranslation = project.translations.find(
									(t) => t.languages_code === l.code
								);
								return altTranslation && altTranslation.name !== pages[l.code].projects
									? {
											hreflang: l.code,
											href: `${site}/${l.code}/${pages[l.code].projects}/${altTranslation.name}`
										}
									: null;
							})
							.filter(Boolean) as Array<{ hreflang: string; href: string }>
					});
				}
			}
		}
	}

	return sitemapPages;
}

function getProjectsLastModForLanguage(projects: Project[], languageCode: string): string {
	// Trova la data di modifica più recente tra tutti i progetti per una lingua specifica
	const dates = projects
		.flatMap((project) =>
			project.translations
				.filter((t) => t.languages_code === languageCode)
				.map((t) => t.date_updated)
		)
		.filter(Boolean)
		.sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());

	return dates[0]?.split('T')[0] || new Date().toISOString().split('T')[0];
}

function getLatestModificationDate(dates: (string | undefined)[]): string {
	const validDates = dates
		.filter(Boolean)
		.sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());
	return validDates[0]?.split('T')[0] || new Date().toISOString().split('T')[0];
}

function getProjectLastModForLanguage(project: Project, languageCode: string): string {
	// Cerca la data di ultima modifica per una lingua specifica del progetto
	const dates = project.translations
		.filter((t) => t.languages_code === languageCode)
		.map((t) => t.date_updated)
		.filter(Boolean)
		.sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());

	return dates[0]?.split('T')[0] || new Date().toISOString().split('T')[0];
}

const sitemap = (
	pages: Array<{
		slug: string;
		lastMod: string;
		priority: number;
		changefreq: string;
		hreflang: string;
		alternates?: Array<{ hreflang: string; href: string }>;
	}>
) => `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/css" href="/sitemap.css"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  ${pages
		.map(
			(page) => `
  <url>
    <loc>${site}/${page.slug}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${page.lastMod}</lastmod>
    <priority>${page.priority}</priority>
    ${
			page.alternates
				?.map(
					(alt) => `
    <link
      rel="alternate"
      hreflang="${alt.hreflang}"
      href="${alt.href}"
    />`
				)
				.join('') || ''
		}
  </url>`
		)
		.join('')}
</urlset>`;
