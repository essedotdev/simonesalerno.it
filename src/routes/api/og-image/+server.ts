import { dev } from '$app/environment';
import { getImageAsset } from '$lib/assets/image-assets';
import { logoBase64 } from '$lib/assets/logo-base64';
import { noiseBase64 } from '$lib/assets/noise-base64';
import { ContentLoader } from '$lib/utils/content';
import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Font cache
let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/**
 * Load fonts for workers-og or fallback
 */
async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
	if (fontCache) return fontCache;

	try {
		// Check if we're in Cloudflare Workers environment
		const isCloudflareRuntime = typeof globalThis.caches !== 'undefined';

		if (!dev && isCloudflareRuntime) {
			// In production (Cloudflare), load fonts via loadGoogleFont from workers-og
			const { loadGoogleFont } = await import('workers-og');
			const [regular, bold] = await Promise.all([
				loadGoogleFont({ family: 'Inter', weight: 400 }),
				loadGoogleFont({ family: 'Inter', weight: 700 })
			]);

			fontCache = { regular, bold };
			return fontCache;
		}

		// In development or non-Cloudflare environment, load from local files
		const regular = await readFile(join(process.cwd(), 'static/fonts/Geist-Regular.ttf'));
		const bold = await readFile(join(process.cwd(), 'static/fonts/Geist-Bold.ttf'));

		fontCache = {
			regular: regular.buffer as ArrayBuffer,
			bold: bold.buffer as ArrayBuffer
		};
		return fontCache;
	} catch (error) {
		console.error('Failed to load fonts:', error);
		// Final fallback: return empty buffers (will use system fonts)
		const emptyBuffer = new ArrayBuffer(0);
		fontCache = { regular: emptyBuffer, bold: emptyBuffer };
		return fontCache;
	}
}

/**
 * Fetch external image and convert to base64
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(url, {
			signal: controller.signal,
			headers: { 'User-Agent': 'OG-Generator/1.0' }
		});

		clearTimeout(timeoutId);

		if (!response.ok) return null;

		const buffer = await response.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
		const contentType = response.headers.get('content-type') || 'image/jpeg';

		return `data:${contentType};base64,${base64}`;
	} catch {
		return null;
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
async function getDisplayImage(
	imageUrl?: string,
	imageKey?: string,
	title?: string,
	section?: string
): Promise<string | undefined> {
	// Strategy 1: Try bundled asset first
	if (imageKey) {
		const bundledImage = getImageAsset(imageKey);
		if (bundledImage) return bundledImage;
	}

	// Strategy 2: Try fetching external image
	if (imageUrl) {
		const fetchedImage = await fetchImageAsBase64(imageUrl);
		if (fetchedImage) return fetchedImage;
	}

	// Strategy 3: Create placeholder
	if (title && section && (section === 'projects' || section === 'blog')) {
		return createPlaceholder(title, section);
	}

	return undefined;
}

/**
 * Create home page layout as HTML for workers-og
 */
function createHomeLayout(): string {
	return `
		<div style="
			width: 1200px;
			height: 630px;
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: linear-gradient(135deg, #0c0c0c 0%, #131b49 50%, #20327e 100%);
			font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		">
			<!-- Noise overlay -->
			<div style="
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('${noiseBase64}');
				background-repeat: repeat;
				opacity: 0.5;
				mix-blend-mode: overlay;
			"></div>
			
			<!-- Content -->
			<div style="
				display: flex;
				align-items: center;
				gap: 24px;
				position: relative;
				z-index: 1;
			">
				<img src="${logoBase64}" width="180" height="180" style="display: block;" />
				<div style="
					display: flex;
					flex-direction: column;
					margin-bottom: 8px;
				">
					<span style="
						font-size: 72px;
						font-weight: 500;
						color: #ffffff;
						line-height: 1;
					">esse</span>
					<span style="
						font-size: 52px;
						color: #e5e5e5;
						line-height: 0.8;
						margin-top: -12px;
					">dev</span>
				</div>
			</div>
		</div>
	`;
}

/**
 * Create listing page layout as HTML for workers-og
 */
function createListingLayout(title: string, subtitle?: string): string {
	return `
		<div style="
			width: 1200px;
			height: 630px;
			position: relative;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			background: linear-gradient(135deg, #0c0c0c 0%, #131b49 50%, #20327e 100%);
			padding: 80px;
			font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		">
			<!-- Noise overlay -->
			<div style="
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('${noiseBase64}');
				background-repeat: repeat;
				opacity: 0.5;
				mix-blend-mode: overlay;
			"></div>
			
			<!-- Header -->
			<div style="
				display: flex;
				align-items: center;
				position: relative;
				z-index: 1;
			">
				<img src="${logoBase64}" width="80" height="80" style="margin-right: 24px;" />
			</div>
			
			<!-- Content -->
			<div style="
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				flex: 1;
				position: relative;
				z-index: 1;
			">
				<h1 style="
					font-size: 64px;
					font-weight: bold;
					color: #ffffff;
					text-align: center;
					margin: 0;
					line-height: 1.1;
				">${title}</h1>
				${
					subtitle
						? `
					<p style="
						font-size: 24px;
						color: #a1a1aa;
						text-align: center;
						margin: 16px 0 0 0;
						max-width: 800px;
					">${subtitle}</p>
				`
						: ''
				}
			</div>
		</div>
	`;
}

/**
 * Create detail page layout as HTML for workers-og
 */
function createDetailLayout(title: string, excerpt?: string, coverImage?: string): string {
	const hasImage = !!coverImage;

	if (hasImage) {
		// With image: 60/40 split
		return `
			<div style="
				width: 1200px;
				height: 630px;
				position: relative;
				display: flex;
				background: linear-gradient(135deg, #0c0c0c 0%, #131b49 50%, #20327e 100%);
				font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			">
				<!-- Noise overlay -->
				<div style="
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-image: url('${noiseBase64}');
					background-repeat: repeat;
					opacity: 0.5;
					mix-blend-mode: overlay;
				"></div>
				
				<!-- Text content -->
				<div style="
					width: 720px;
					display: flex;
					flex-direction: column;
					justify-content: center;
					padding: 80px 40px 80px 80px;
					position: relative;
					z-index: 1;
				">
					<h1 style="
						font-size: 48px;
						font-weight: bold;
						color: #ffffff;
						margin: 0 0 24px 0;
						line-height: 1.1;
					">${title}</h1>
					${
						excerpt
							? `
						<p style="
							font-size: 20px;
							color: #a1a1aa;
							margin: 0;
							line-height: 1.4;
						">${excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt}</p>
					`
							: ''
					}
				</div>
				
				<!-- Image -->
				<div style="
					width: 480px;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 80px 80px 80px 40px;
					position: relative;
					z-index: 1;
				">
					<img src="${coverImage}" width="400" height="300" style="
						border-radius: 12px;
						object-fit: cover;
					" />
				</div>
			</div>
		`;
	} else {
		// Without image: centered
		return `
			<div style="
				width: 1200px;
				height: 630px;
				position: relative;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				background: linear-gradient(135deg, #0c0c0c 0%, #131b49 50%, #20327e 100%);
				padding: 80px;
				font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			">
				<!-- Noise overlay -->
				<div style="
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-image: url('${noiseBase64}');
					background-repeat: repeat;
					opacity: 0.5;
					mix-blend-mode: overlay;
				"></div>
				
				<!-- Content -->
				<div style="
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					position: relative;
					z-index: 1;
				">
					<img src="${logoBase64}" width="120" height="120" style="margin-bottom: 40px;" />
					<h1 style="
						font-size: 56px;
						font-weight: bold;
						color: #ffffff;
						text-align: center;
						margin: 0 0 24px 0;
						line-height: 1.1;
						max-width: 900px;
					">${title}</h1>
					${
						excerpt
							? `
						<p style="
							font-size: 22px;
							color: #a1a1aa;
							text-align: center;
							margin: 0;
							line-height: 1.4;
							max-width: 800px;
						">${excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt}</p>
					`
							: ''
					}
				</div>
			</div>
		`;
	}
}
export const GET: RequestHandler = async ({ url }) => {
	try {
		console.log('[OG Image] Starting generation with workers-og...');
		console.log('[OG Image] Environment:', dev ? 'development' : 'production');

		// Check if we're in Cloudflare Workers environment
		const isCloudflareRuntime = typeof globalThis.caches !== 'undefined';

		// Parse query parameters
		const type = url.searchParams.get('type') || 'home';
		const section = url.searchParams.get('section') || undefined;
		const title = url.searchParams.get('title') || undefined;
		const imageUrl = url.searchParams.get('image') || undefined;
		const imageKey = url.searchParams.get('imageKey') || undefined; // Key for bundled images
		const excerpt = url.searchParams.get('excerpt') || undefined;
		const lang = url.searchParams.get('lang') || 'it';

		// Initialize content loader
		const contentLoader = new ContentLoader();

		let htmlLayout: string;

		if (type === 'home') {
			htmlLayout = createHomeLayout();
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

			htmlLayout = createListingLayout(pageTitle, pageSubtitle);
		} else if (type === 'detail' && title) {
			// Get cover image
			const coverImage = await getDisplayImage(imageUrl, imageKey, title, section);

			htmlLayout = createDetailLayout(title, excerpt, coverImage);
		} else {
			// Fallback to home
			htmlLayout = createHomeLayout();
		}

		// Try to use workers-og in Cloudflare environment
		if (!dev && isCloudflareRuntime) {
			try {
				console.log('[OG Image] Using workers-og for image generation');
				const { ImageResponse } = await import('workers-og');
				const fonts = await loadFonts();

				return new ImageResponse(htmlLayout, {
					width: 1200,
					height: 630,
					fonts: [
						{
							name: 'Inter',
							data: fonts.regular,
							weight: 400,
							style: 'normal'
						},
						{
							name: 'Inter',
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
		console.log('[OG Image] Using SVG fallback');
		const fallbackSvg = `
			<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#0c0c0c"/>
						<stop offset="50%" stop-color="#131b49"/>
						<stop offset="100%" stop-color="#20327e"/>
					</linearGradient>
				</defs>
				<rect width="1200" height="630" fill="url(#bg)"/>
				<text x="600" y="300" text-anchor="middle" dy="0.3em" 
					  font-family="Inter, system-ui, -apple-system, sans-serif" font-size="48" fill="#ffffff">
					${title || 'Open Graph Image'}
				</text>
				<text x="600" y="360" text-anchor="middle" dy="0.3em" 
					  font-family="Inter, system-ui, -apple-system, sans-serif" font-size="24" fill="#a1a1aa">
					${excerpt ? excerpt.slice(0, 100) + '...' : 'Generated by workers-og fallback'}
				</text>
			</svg>
		`;

		return new Response(fallbackSvg, {
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
					  font-family="Inter, system-ui, -apple-system, sans-serif" font-size="48" fill="#ffffff">
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
