import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Dynamic import for workers-og to handle WASM loading
let ImageResponse: typeof import('workers-og').ImageResponse | null = null;

// Import the existing utilities
import { ContentLoader } from '../src/lib/utils/content.js';
import { OgDataResolver } from '../src/lib/utils/og-data-resolver.js';
import { generateHtmlLayout } from '../src/lib/utils/og-html-generator.js';
import { createHomeLayoutData } from '../src/lib/utils/og-layouts.js';
import { parseOgParams } from '../src/lib/utils/og-shared.js';

/**
 * Initialize workers-og with fallback for local development
 */
async function initializeWorkersOg(): Promise<boolean> {
	try {
		const workersOg = await import('workers-og');
		ImageResponse = workersOg.ImageResponse;
		console.log('✅ workers-og initialized successfully');
		return true;
	} catch (error) {
		console.warn('⚠️  workers-og failed to initialize (expected in local dev):', error.message);
		console.log('🔄 Will generate placeholder images for local development');
		return false;
	}
}

/**
 * Generate placeholder SVG image for local development
 */
function generatePlaceholderSvg(filename: string): string {
	const title = filename
		.replace('.png', '')
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#0c0c0c"/>
				<stop offset="50%" stop-color="#131b49"/>
				<stop offset="100%" stop-color="#20327e"/>
			</linearGradient>
		</defs>
		<rect width="1200" height="630" fill="url(#bg)"/>
		<text x="600" y="280" text-anchor="middle" font-family="system-ui" font-size="48" font-weight="bold" fill="white">
			${title}
		</text>
		<text x="600" y="340" text-anchor="middle" font-family="system-ui" font-size="24" fill="#e5e5e5">
			OG Image Preview
		</text>
		<text x="600" y="380" text-anchor="middle" font-family="system-ui" font-size="16" fill="#a1a1aa">
			Generated with workers-og on Cloudflare
		</text>
	</svg>`;
}

/**
 * Generate all site URLs for OG image generation (same logic as preview)
 */
async function generateSiteUrls() {
	try {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');
		const projects = await loader.loadProjects();
		const articles = await loader.loadArticles();

		const urls: Array<{
			type: string;
			section?: string;
			lang: string;
			title?: string;
			excerpt?: string;
			imageKey?: string;
			filename: string;
		}> = [];

		// Generate URLs for each language
		for (const language of languages) {
			const langCode = language.code;

			// Homepage
			urls.push({
				type: 'home',
				lang: langCode,
				filename: `home-${langCode}.png`
			});

			// Listing Pages
			if (navigation[langCode]?.projects) {
				urls.push({
					type: 'listing',
					section: 'projects',
					lang: langCode,
					title: 'Projects', // Will be resolved by OgDataResolver
					filename: `listing-projects-${langCode}.png`
				});
			}

			if (navigation[langCode]?.articles) {
				urls.push({
					type: 'listing',
					section: 'blog',
					lang: langCode,
					title: 'Blog', // Will be resolved by OgDataResolver
					filename: `listing-blog-${langCode}.png`
				});
			}

			// Individual Projects
			if (navigation[langCode]?.projects) {
				for (const project of projects) {
					const translation = project.translations[langCode];
					if (translation && translation.slug) {
						const safeSlug = translation.slug.replace(/[^a-z0-9]/g, '-');
						urls.push({
							type: 'detail',
							section: 'projects',
							lang: langCode,
							title: translation.title,
							excerpt: translation.description,
							imageKey: project.meta.og_image_key,
							filename: `detail-projects-${safeSlug}-${langCode}.png`
						});
					}
				}
			}

			// Individual Articles
			if (navigation[langCode]?.articles) {
				for (const article of articles) {
					const translation = article.translations[langCode];
					if (translation && translation.slug) {
						const safeSlug = translation.slug.replace(/[^a-z0-9]/g, '-');
						urls.push({
							type: 'detail',
							section: 'blog',
							lang: langCode,
							title: translation.title,
							excerpt: translation.excerpt,
							imageKey: article.meta.og_image_key,
							filename: `detail-blog-${safeSlug}-${langCode}.png`
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

/**
 * Generate a single OG image with fallback support
 */
async function generateOgImage(
	urlData: {
		type: string;
		section?: string;
		lang: string;
		title?: string;
		excerpt?: string;
		imageKey?: string;
		filename: string;
	},
	useWorkersOg: boolean
): Promise<void> {
	try {
		const outputPath = join('static', 'og-images', urlData.filename);

		if (useWorkersOg && ImageResponse) {
			// Use workers-og (Cloudflare environment)
			const searchParams = new URLSearchParams();
			searchParams.set('type', urlData.type);
			searchParams.set('lang', urlData.lang);
			if (urlData.section) searchParams.set('section', urlData.section);
			if (urlData.title) searchParams.set('title', urlData.title);
			if (urlData.excerpt) searchParams.set('excerpt', urlData.excerpt);
			if (urlData.imageKey) searchParams.set('imageKey', urlData.imageKey);

			const fakeUrl = new URL(`http://localhost?${searchParams.toString()}`);

			// Reuse existing logic
			const params = parseOgParams(fakeUrl);
			const resolver = new OgDataResolver();
			const layoutConfig = await resolver.resolveLayout(params);
			const htmlLayout = generateHtmlLayout(layoutConfig);

			// Generate the image using workers-og
			const response = await new ImageResponse(htmlLayout, {
				width: 1200,
				height: 630
			});

			// Save to file
			const buffer = await response.arrayBuffer();
			await writeFile(outputPath, Buffer.from(buffer));
		} else {
			// Fallback for local development
			const placeholderSvg = generatePlaceholderSvg(urlData.filename);
			await writeFile(outputPath, placeholderSvg);
		}

		console.log(`✅ Generated: ${urlData.filename}`);
	} catch (error) {
		console.error(`❌ Failed to generate ${urlData.filename}:`, error);

		// Ultimate fallback: generate simple placeholder
		try {
			const outputPath = join('static', 'og-images', urlData.filename);
			const fallbackSvg = generatePlaceholderSvg(urlData.filename);
			await writeFile(outputPath, fallbackSvg);

			console.log(`⚠️  Generated fallback for: ${urlData.filename}`);
		} catch (fallbackError) {
			console.error(`❌ Failed to generate fallback for ${urlData.filename}:`, fallbackError);
		}
	}
}

/**
 * Main function to generate all OG images
 */
async function generateAllOgImages(): Promise<void> {
	console.log('🎨 Starting OG image generation...');

	// Initialize workers-og and check if it's available
	const workersOgAvailable = await initializeWorkersOg();

	// Ensure output directory exists
	const ogImagesDir = join('static', 'og-images');
	if (!existsSync(ogImagesDir)) {
		await mkdir(ogImagesDir, { recursive: true });
		console.log(`📁 Created directory: ${ogImagesDir}`);
	}

	// Generate all site URLs
	const urls = await generateSiteUrls();
	console.log(`📋 Found ${urls.length} pages to generate OG images for`);

	// Generate default/fallback image (home)
	if (workersOgAvailable && ImageResponse) {
		const homeConfig = createHomeLayoutData();
		const homeHtml = generateHtmlLayout(homeConfig);
		const defaultResponse = await new ImageResponse(homeHtml, {
			width: 1200,
			height: 630
		});
		await writeFile(
			join(ogImagesDir, 'default.png'),
			Buffer.from(await defaultResponse.arrayBuffer())
		);
	} else {
		const defaultSvg = generatePlaceholderSvg('default.png');
		await writeFile(join(ogImagesDir, 'default.png'), defaultSvg);
	}
	console.log('✅ Generated: default.png (fallback)');

	// Generate images for all URLs
	let successCount = 0;
	let failureCount = 0;

	for (const urlData of urls) {
		try {
			await generateOgImage(urlData, workersOgAvailable);
			successCount++;
		} catch (error) {
			console.error(`Failed to generate ${urlData.filename}:`, error);
			failureCount++;
		}
	}

	console.log('\n🎯 OG Image generation complete!');
	console.log(`✅ Success: ${successCount}`);
	console.log(`❌ Failures: ${failureCount}`);
	console.log(`📁 Images saved to: ${ogImagesDir}`);

	if (!workersOgAvailable) {
		console.log('\n⚠️  Note: Placeholder images generated for local development');
		console.log('🚀 Real OG images will be generated on Cloudflare build');
	}
}

// Run the generator
generateAllOgImages().catch((error) => {
	console.error('❌ OG image generation failed:', error);
	process.exit(1);
});
