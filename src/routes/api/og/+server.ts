import { OgDataResolver } from '$lib/utils/og-data-resolver';
import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import { parseOgParams } from '$lib/utils/og-shared';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		// Check if we're in Cloudflare environment
		// platform?.env is the most reliable way to detect Cloudflare Workers/Pages runtime
		if (!platform?.env) {
			return new Response('OG image generation is only available in Cloudflare environment', {
				status: 503,
				headers: { 'Content-Type': 'text/plain' }
			});
		}

		// Dynamic import of workers-og to avoid WASM issues during build
		const { ImageResponse, loadGoogleFont } = await import('workers-og');

		// Parse parameters from URL
		const params = parseOgParams(url);

		// Resolve layout configuration
		const resolver = new OgDataResolver();
		const layoutConfig = await resolver.resolveLayout(params);

		// Generate HTML layout
		const htmlLayout = generateHtmlLayout(layoutConfig);

		// Load Google Font (Geist) for better typography
		let fonts: Array<{ name: string; data: ArrayBuffer; weight: number; style: string }> = [];

		try {
			const geistFont = await loadGoogleFont({
				family: 'Geist',
				weight: 400
			});

			const geistBoldFont = await loadGoogleFont({
				family: 'Geist',
				weight: 700
			});

			fonts = [
				{
					name: 'Geist',
					data: geistFont,
					weight: 400,
					style: 'normal'
				},
				{
					name: 'Geist',
					data: geistBoldFont,
					weight: 700,
					style: 'normal'
				}
			];
		} catch (fontError) {
			console.warn('Failed to load Geist font, using system fonts:', fontError);
		}

		// Generate the image using workers-og
		const response = await new ImageResponse(htmlLayout, {
			width: 1200,
			height: 630,
			fonts: fonts.length > 0 ? fonts : undefined
		});

		// Set appropriate headers for image caching
		return new Response(response.body, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=31536000, immutable',
				'CDN-Cache-Control': 'max-age=31536000'
			}
		});
	} catch (error) {
		console.error('Error generating OG image:', error);

		// Return a simple fallback response
		return new Response('Error generating OG image', {
			status: 500,
			headers: { 'Content-Type': 'text/plain' }
		});
	}
};
