import { dev } from '$app/environment';
import { getImageAsset } from '$lib/assets/image-assets';
import { ContentLoader } from '$lib/utils/content';
import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import {
	createDetailLayoutData,
	createHomeLayoutData,
	createListingLayoutData
} from '$lib/utils/og-layouts';
import { generateSvgLayout } from '$lib/utils/og-svg-generator';
import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Font cache
let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/**
 * Load Geist fonts for workers-og
 */
async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
	if (fontCache) return fontCache;

	try {
		// Always load Geist fonts from local files (consistent across environments)
		const regular = await readFile(join(process.cwd(), 'static/fonts/Geist-Regular.ttf'));
		const bold = await readFile(join(process.cwd(), 'static/fonts/Geist-Bold.ttf'));

		fontCache = {
			regular: regular.buffer as ArrayBuffer,
			bold: bold.buffer as ArrayBuffer
		};
		return fontCache;
	} catch (error) {
		console.error('Failed to load Geist fonts:', error);
		// Final fallback: return empty buffers (will use system fonts)
		const emptyBuffer = new ArrayBuffer(0);
		fontCache = { regular: emptyBuffer, bold: emptyBuffer };
		return fontCache;
	}
}

/**
 * Create placeholder image with initials
 */
function createPlaceholder(title: string, section: 'projects' | 'blog'): string {
	const colors = {
		projects: { start: '#3b82f6', end: '#1d4ed8' },
		blog: { start: '#10b981', end: '#059669' }
	};

	const { start, end } = colors[section];
	const initials = title
		.split(' ')
		.map((word) => word[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	const svg = `
		<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="placeholderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="${start}"/>
					<stop offset="100%" stop-color="${end}"/>
				</linearGradient>
			</defs>
			<rect width="400" height="300" fill="url(#placeholderGrad)" rx="8"/>
			<text x="200" y="150" text-anchor="middle" dy="0.3em" 
				  font-family="system-ui" font-size="72" font-weight="bold" fill="white">
				${initials}
			</text>
		</svg>
	`;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get display image with fallback strategy
 */
function getDisplayImage(imageKey?: string, title?: string, section?: string): string | undefined {
	// Strategy 1: Try bundled asset first
	if (imageKey) {
		const bundledImage = getImageAsset(imageKey);
		if (bundledImage) return bundledImage;
	}

	// Strategy 2: Create placeholder as fallback
	if (title && section && (section === 'projects' || section === 'blog')) {
		return createPlaceholder(title, section);
	}

	return undefined;
}
export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse and validate query parameters
		const type = url.searchParams.get('type') || 'home';
		const section = url.searchParams.get('section') || undefined;
		const title = url.searchParams.get('title') || undefined;
		const imageKey = url.searchParams.get('imageKey') || undefined; // Key for bundled images
		const excerpt = url.searchParams.get('excerpt') || undefined;
		const lang = url.searchParams.get('lang') || 'it';

		// Validate type parameter
		const validTypes = ['home', 'listing', 'detail'] as const;
		if (!validTypes.includes(type as (typeof validTypes)[number])) {
			console.error(`[OG Image] Invalid type parameter: ${type}`);
			// Fallback to home instead of throwing
		}

		// Validate section parameter when needed
		if (type === 'listing' && section && !['projects', 'blog'].includes(section)) {
			console.error(`[OG Image] Invalid section parameter: ${section}`);
		}

		// Initialize content loader
		const contentLoader = new ContentLoader();

		// Generate layout configuration
		let layoutConfig;

		if (type === 'home') {
			layoutConfig = createHomeLayoutData();
		} else if (type === 'listing' && section) {
			// Load page content for title
			let pageTitle = section === 'projects' ? 'Projects' : 'Blog';
			const pageSubtitle = '';

			try {
				if (section === 'projects' || section === 'blog') {
					const pageData = await contentLoader.loadPage(section, lang);
					pageTitle = pageData.title || pageTitle;
					// Skip description for now since it's not available on all page types
				}
			} catch (error) {
				console.warn('Could not load page data:', error);
			}

			layoutConfig = createListingLayoutData(pageTitle, pageSubtitle);
		} else if (type === 'detail' && title) {
			// Get cover image
			const coverImage = getDisplayImage(imageKey, title, section);

			layoutConfig = createDetailLayoutData(title, excerpt, coverImage);
		} else {
			// Fallback to home
			layoutConfig = createHomeLayoutData();
		}

		// Try to use workers-og in production environment
		if (!dev) {
			try {
				const { ImageResponse } = await import('workers-og');
				const fonts = await loadFonts();

				const htmlLayout = generateHtmlLayout(layoutConfig);

				return new ImageResponse(htmlLayout, {
					width: 1200,
					height: 630,
					fonts: [
						{
							name: 'Geist',
							data: fonts.regular,
							weight: 400,
							style: 'normal'
						},
						{
							name: 'Geist',
							data: fonts.bold,
							weight: 700,
							style: 'normal'
						}
					],
					headers: {
						'Cache-Control': 'public, max-age=86400'
					}
				});
			} catch (workersOgError) {
				console.error('[OG Image] workers-og failed:', workersOgError);
				// Fall through to SVG fallback
			}
		}

		// Development fallback or workers-og failed: return SVG
		const svgLayout = generateSvgLayout(layoutConfig);

		return new Response(svgLayout, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (error) {
		console.error('[OG Image] Fatal error:', error);

		// Final fallback SVG
		const finalFallbackSvg = `
			<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#0c0c0c"/>
						<stop offset="50%" stop-color="#131b49"/>
						<stop offset="100%" stop-color="#20327e"/>
					</linearGradient>
				</defs>
				<rect width="1200" height="630" fill="url(#bg)"/>
				<text x="600" y="315" text-anchor="middle" dy="0.3em" 
					  font-family="Geist, system-ui, -apple-system, sans-serif" font-size="48" fill="#ffffff">
					Open Graph Image
				</text>
			</svg>
		`;

		return new Response(finalFallbackSvg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
};
