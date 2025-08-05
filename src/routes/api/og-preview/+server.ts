import { ContentLoader } from '$lib/utils/content';
import { OgDataResolver } from '$lib/utils/og-data-resolver';
import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import { parseOgParams } from '$lib/utils/og-shared';
import type { RequestHandler } from '@sveltejs/kit';

// Generate all site URLs for testing (same logic as sitemap)
async function generateSiteUrls() {
	try {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');
		const projects = await loader.loadProjects();
		const articles = await loader.loadArticles();

		const urls: Array<{
			href: string;
			title: string;
			category: string;
			type: string;
			section?: string;
			lang: string;
			contentTitle?: string;
			excerpt?: string;
			imageKey?: string;
		}> = [];

		// Generate URLs for each language
		for (const language of languages) {
			const langCode = language.code;
			const baseUrl = '/api/og-preview';

			// Homepage
			urls.push({
				href: `${baseUrl}?type=home&lang=${langCode}`,
				title: `Homepage ${langCode.toUpperCase()}`,
				category: 'Home Pages',
				type: 'home',
				lang: langCode
			});

			// Listing Pages
			if (navigation[langCode]?.projects) {
				urls.push({
					href: `${baseUrl}?type=listing&section=projects&lang=${langCode}`,
					title: `Projects ${langCode.toUpperCase()}`,
					category: 'Listing Pages',
					type: 'listing',
					section: 'projects',
					lang: langCode
				});
			}

			if (navigation[langCode]?.articles) {
				urls.push({
					href: `${baseUrl}?type=listing&section=blog&lang=${langCode}`,
					title: `Blog ${langCode.toUpperCase()}`,
					category: 'Listing Pages',
					type: 'listing',
					section: 'blog',
					lang: langCode
				});
			}

			// Individual Projects
			if (navigation[langCode]?.projects) {
				for (const project of projects) {
					const translation = project.translations[langCode];
					if (translation && translation.slug) {
						const params = new URLSearchParams({
							type: 'detail',
							section: 'projects',
							lang: langCode,
							title: translation.title || 'Untitled Project'
						});

						if (translation.description) {
							params.set('excerpt', translation.description);
						}

						if (project.meta.og_image_key) {
							params.set('imageKey', project.meta.og_image_key);
						}

						urls.push({
							href: `${baseUrl}?${params.toString()}`,
							title: `${translation.title || 'Untitled'} (${langCode.toUpperCase()})`,
							category: 'Project Details',
							type: 'detail',
							section: 'projects',
							lang: langCode,
							contentTitle: translation.title,
							excerpt: translation.description,
							imageKey: project.meta.og_image_key
						});
					}
				}
			}

			// Individual Articles
			if (navigation[langCode]?.articles) {
				for (const article of articles) {
					const translation = article.translations[langCode];
					if (translation && translation.slug) {
						const params = new URLSearchParams({
							type: 'detail',
							section: 'blog',
							lang: langCode,
							title: translation.title || 'Untitled Article'
						});

						if (translation.excerpt) {
							params.set('excerpt', translation.excerpt);
						}

						if (article.meta.og_image_key) {
							params.set('imageKey', article.meta.og_image_key);
						}

						urls.push({
							href: `${baseUrl}?${params.toString()}`,
							title: `${translation.title || 'Untitled'} (${langCode.toUpperCase()})`,
							category: 'Article Details',
							type: 'detail',
							section: 'blog',
							lang: langCode,
							contentTitle: translation.title,
							excerpt: translation.excerpt,
							imageKey: article.meta.og_image_key
						});
					}
				}
			}
		}

		return urls;
	} catch (error) {
		console.error('Error generating site URLs:', error);
		return [];
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse parameters and generate layout using the new resolver
		const params = parseOgParams(url);
		const resolver = new OgDataResolver();
		const layoutConfig = await resolver.resolveLayout(params);

		// Generate HTML layout (same as what gets converted to PNG)
		const htmlLayout = generateHtmlLayout(layoutConfig);

		// Generate all site URLs for testing
		const siteUrls = await generateSiteUrls();

		// Group URLs by category
		const groupedUrls = siteUrls.reduce(
			(acc, urlItem) => {
				if (!acc[urlItem.category]) {
					acc[urlItem.category] = [];
				}
				acc[urlItem.category].push(urlItem);
				return acc;
			},
			{} as Record<string, typeof siteUrls>
		);

		// Check if current URL matches any site URL
		const currentUrl = url.toString();
		const matchingUrl = siteUrls.find((urlItem) => currentUrl.endsWith(urlItem.href));

		// Return as HTML page for browser preview
		const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>OG Image Preview - ${params.type}</title>
	<style>
		body {
			margin: 0;
			padding: 20px;
			background: #111;
			font-family: system-ui;
			color: white;
			line-height: 1.6;
		}
		.info {
			margin-bottom: 20px;
			padding: 15px;
			background: #222;
			border-radius: 8px;
			font-size: 14px;
		}
		.test-links {
			margin-bottom: 30px;
			padding: 20px;
			background: #1a1a1a;
			border-radius: 8px;
			border: 1px solid #333;
			max-height: 60vh;
			overflow-y: auto;
		}
		.test-links h3 {
			margin: 0 0 15px 0;
			color: #4ade80;
			font-size: 18px;
			position: sticky;
			top: 0;
			background: #1a1a1a;
			padding: 10px 0;
			border-bottom: 1px solid #333;
		}
		.test-category {
			margin-bottom: 20px;
		}
		.test-category h4 {
			margin: 0 0 10px 0;
			color: #94a3b8;
			font-size: 16px;
		}
		.test-links a {
			display: inline-block;
			margin: 5px 10px 5px 0;
			padding: 8px 12px;
			background: #3b82f6;
			color: white;
			text-decoration: none;
			border-radius: 6px;
			font-size: 13px;
			transition: background-color 0.2s;
		}
		.test-links a:hover {
			background: #2563eb;
		}
		.test-links a.current {
			background: #10b981;
		}
		.preview-container {
			display: inline-block;
			border: 2px solid #333;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
		}
		.note {
			margin-top: 20px;
			padding: 15px;
			background: #374151;
			border-radius: 8px;
			font-size: 13px;
			color: #d1d5db;
		}
		.stats {
			margin-bottom: 10px;
			font-size: 12px;
			color: #9ca3af;
		}
	</style>
</head>
<body>
	<div class="test-links">
		<h3>🧪 Real Site OG Image Tests</h3>
		<div class="stats">
			Total URLs: ${siteUrls.length} | Generated from actual site content
		</div>
		
		${Object.entries(groupedUrls)
			.map(
				([category, urls]) => `
		<div class="test-category">
			<h4>${category} (${urls.length})</h4>
			${urls
				.map(
					(urlItem) => `
			<a href="${urlItem.href}" ${matchingUrl?.href === urlItem.href ? 'class="current"' : ''}>
				${urlItem.title}
			</a>`
				)
				.join('')}
		</div>`
			)
			.join('')}
	</div>

	<div class="info">
		<strong>📋 Current Preview</strong><br>
		Type: <code>${params.type}</code> | Section: <code>${params.section || 'none'}</code> | Title: <code>${params.title || 'none'}</code><br>
		Lang: <code>${params.lang}</code> | Image Key: <code>${params.imageKey || 'none'}</code><br>
		<small>This preview shows exactly what would be generated for OG images. All URLs above are real pages from your site.</small>
	</div>
	
	<div class="preview-container">
		${htmlLayout}
	</div>
	
	<div class="note">
		<strong>✅ Simplified OG System:</strong> The complex og-image endpoint has been removed. This preview now shows all real site URLs.<br>
		<strong>🔧 Development:</strong> All URLs are generated from actual site content (projects, articles, navigation).
	</div>
</body>
</html>
		`;

		return new Response(previewHtml, {
			headers: {
				'Content-Type': 'text/html',
				'Cache-Control': 'no-cache'
			}
		});
	} catch (error) {
		console.error('[OG Preview] Error:', error);

		return new Response(
			`
<!DOCTYPE html>
<html>
<head><title>OG Preview Error</title></head>
<body style="font-family: system-ui; padding: 20px; background: #111; color: white;">
	<h1>Preview Error</h1>
	<pre>${error}</pre>
</body>
</html>
		`,
			{
				headers: { 'Content-Type': 'text/html' }
			}
		);
	}
};
