import { dev } from '$app/environment';
import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import { generateLayoutConfig, parseOgParams } from '$lib/utils/og-shared';
import type { RequestHandler } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Font cache with TTL
let fontCache: {
	regular: ArrayBuffer;
	bold: ArrayBuffer;
	timestamp: number;
} | null = null;
const FONT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Load fonts for workers-og
 */
async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
	// Check if cache is valid
	if (fontCache && Date.now() - fontCache.timestamp < FONT_CACHE_TTL) {
		return { regular: fontCache.regular, bold: fontCache.bold };
	}

	try {
		// In production (Cloudflare), load fonts via loadGoogleFont from workers-og
		if (!dev) {
			const { loadGoogleFont } = await import('workers-og');
			const [regular, bold] = await Promise.all([
				loadGoogleFont({ family: 'Geist', weight: 400 }),
				loadGoogleFont({ family: 'Geist', weight: 700 })
			]);

			fontCache = { regular, bold, timestamp: Date.now() };
			return fontCache;
		}

		// In development, load from local files
		const regular = await readFile(join(process.cwd(), 'static/fonts/Geist-Regular.ttf'));
		const bold = await readFile(join(process.cwd(), 'static/fonts/Geist-Bold.ttf'));

		fontCache = {
			regular: regular.buffer as ArrayBuffer,
			bold: bold.buffer as ArrayBuffer,
			timestamp: Date.now()
		};
		return { regular: fontCache.regular, bold: fontCache.bold };
	} catch (error) {
		console.error('Failed to load fonts:', error);
		// Final fallback: return empty buffers (will use system fonts)
		const emptyBuffer = new ArrayBuffer(0);
		const fallbackFonts = { regular: emptyBuffer, bold: emptyBuffer };

		// Cache the fallback for a shorter time
		fontCache = {
			...fallbackFonts,
			timestamp: Date.now()
		};
		return fallbackFonts;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse parameters and generate layout using shared functions
		const params = parseOgParams(url);
		const layoutConfig = await generateLayoutConfig(params);

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
				// Fallback to SVG in production if workers-og fails
				return new Response(
					`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" stop-color="#0c0c0c"/>
								<stop offset="50%" stop-color="#131b49"/>
								<stop offset="100%" stop-color="#20327e"/>
							</linearGradient>
						</defs>
						<rect width="1200" height="630" fill="url(#bg)"/>
						<text x="600" y="300" text-anchor="middle" dy="0.3em" 
							  font-family="Geist, system-ui, -apple-system, sans-serif" font-size="36" fill="#ffffff">
							${params.title || 'Simone Salerno'}
						</text>
						<text x="600" y="350" text-anchor="middle" dy="0.3em" 
							  font-family="Geist, system-ui, -apple-system, sans-serif" font-size="24" fill="#e5e5e5">
							OG Image Generation Fallback
						</text>
					</svg>`,
					{
						headers: {
							'Content-Type': 'image/svg+xml',
							'Cache-Control': 'public, max-age=3600'
						}
					}
				);
			}
		}

		// In development, return a simple fallback message
		return new Response(
			`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
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
					Development Mode - Use /api/og-preview for testing
				</text>
			</svg>`,
			{
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'no-cache'
				}
			}
		);
	} catch (error) {
		console.error('[OG Image] Fatal error:', error);

		// Return error response
		return new Response(JSON.stringify({ error: 'Fatal OG image generation error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
