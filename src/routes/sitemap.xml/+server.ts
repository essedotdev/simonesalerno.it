import { ContentLoader } from '$lib/utils/content';
import type { RequestHandler } from './$types';
import type { SitemapPage } from '$lib/types';

const site = 'https://simonesalerno.it';

export const GET: RequestHandler = async () => {
	try {
		const loader = new ContentLoader();

		// Carica configurazione e contenuti
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');
		const projects = await loader.loadProjects();
		const articles = await loader.loadArticles();

		const sitemapPages: SitemapPage[] = [];

		// Pagine principali per ogni lingua
		for (const language of languages) {
			const langCode = language.code;

			// Homepage
			sitemapPages.push({
				slug: langCode,
				lastMod: new Date().toISOString().split('T')[0],
				priority: 1.0,
				changefreq: 'monthly',
				hreflang: langCode,
				alternates: languages.map((l) => ({
					hreflang: l.code,
					href: `${site}/${l.code}`
				}))
			});

			// Progetti individuali
			if (navigation[langCode]?.projects) {
				for (const project of projects) {
					const translation = project.translations[langCode];
					if (translation && translation.slug) {
						sitemapPages.push({
							slug: `${langCode}/${navigation[langCode].projects}/${translation.slug}`,
							lastMod:
								project.meta.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0],
							priority: 0.8,
							changefreq: 'monthly',
							hreflang: langCode,
							alternates: languages
								.map((l) => {
									const altTranslation = project.translations[l.code];
									return altTranslation && altTranslation.slug && navigation[l.code]?.projects
										? {
												hreflang: l.code,
												href: `${site}/${l.code}/${navigation[l.code].projects}/${altTranslation.slug}`
											}
										: null;
								})
								.filter(Boolean) as Array<{ hreflang: string; href: string }>
						});
					}
				}
			}

			// Articoli individuali
			if (navigation[langCode]?.articles) {
				for (const article of articles) {
					const translation = article.translations[langCode];
					if (translation && translation.slug) {
						sitemapPages.push({
							slug: `${langCode}/${navigation[langCode].articles}/${translation.slug}`,
							lastMod:
								article.meta.updated_date?.split('T')[0] ||
								article.meta.published_date?.split('T')[0] ||
								new Date().toISOString().split('T')[0],
							priority: 0.6,
							changefreq: 'monthly',
							hreflang: langCode,
							alternates: languages
								.map((l) => {
									const altTranslation = article.translations[l.code];
									return altTranslation && altTranslation.slug && navigation[l.code]?.articles
										? {
												hreflang: l.code,
												href: `${site}/${l.code}/${navigation[l.code].articles}/${altTranslation.slug}`
											}
										: null;
								})
								.filter(Boolean) as Array<{ hreflang: string; href: string }>
						});
					}
				}
			}
		}

		const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/css" href="/sitemap.css"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  ${sitemapPages
		.map(
			(page) => `
  <url>
    <loc>${site}/${page.slug}</loc>
    <lastmod>${page.lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
    ${
			page.alternates
				?.map(
					(alt) => `
    <xhtml:link
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

		const response = new Response(sitemap);
		response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
		response.headers.set('Content-Type', 'application/xml');
		return response;
	} catch (error) {
		console.error('Error generating sitemap:', error);

		// Fallback sitemap
		const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/en</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${site}/it</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

		const response = new Response(fallbackSitemap);
		response.headers.set('Content-Type', 'application/xml');
		return response;
	}
};
