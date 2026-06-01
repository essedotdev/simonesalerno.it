import { error } from '@sveltejs/kit';
import { ContentLoader } from '$lib/utils/content';
import { escapeHtml } from '$lib/utils/og/escape';
import type { RequestHandler } from './$types';

const site = 'https://simonesalerno.it';

// Feed RSS degli articoli per lingua (/en/rss.xml, /it/rss.xml). Gli articoli sono
// già ordinati per published_date desc dal ContentLoader.
export const GET: RequestHandler = async ({ params }) => {
	const lang = params.page as string;
	const loader = new ContentLoader();

	const languages = await loader.loadConfig('languages');
	if (!languages.some((l) => l.code === lang)) {
		throw error(404, 'Language not found');
	}

	const navigation = await loader.loadConfig('navigation');
	const global = await loader.loadGlobal(lang);
	const articles = await loader.loadArticles(lang);
	const blogRoute = navigation[lang]?.articles ?? 'blog';
	const blogUrl = `${site}/${lang}/${blogRoute}`;

	const items = articles
		.map((article) => {
			const t = article.translations[lang];
			if (!t?.slug) return '';
			const url = `${blogUrl}/${t.slug}`;
			const pubDate = new Date(article.meta.published_date).toUTCString();
			const description = t.meta_description || t.excerpt || '';
			return `
    <item>
      <title>${escapeHtml(t.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(description)}</description>
    </item>`;
		})
		.join('');

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(global.title)}</title>
    <link>${blogUrl}</link>
    <description>${escapeHtml(global.description)}</description>
    <language>${lang}</language>
    <atom:link href="${site}/${lang}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=0, s-maxage=3600'
		}
	});
};
