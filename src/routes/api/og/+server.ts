import { OgDataResolver } from '$lib/utils/og-data-resolver';
import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import { parseOgParams } from '$lib/utils/og-shared';
import { dev } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		// In development, redirect to og-preview
		if (dev) {
			const previewUrl = new URL('/api/og-preview', url.origin);
			previewUrl.search = url.search;

			return new Response(
				`<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>OG Image Development</title>
	<style>
		body { 
			font-family: system-ui, sans-serif; 
			max-width: 800px; 
			margin: 50px auto; 
			padding: 20px;
			background: #f5f5f5;
		}
		.card {
			background: white;
			border-radius: 8px;
			padding: 30px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		}
		.button {
			display: inline-block;
			background: #0070f3;
			color: white;
			padding: 12px 24px;
			text-decoration: none;
			border-radius: 6px;
			margin-top: 20px;
		}
		.code {
			background: #f0f0f0;
			padding: 15px;
			border-radius: 4px;
			font-family: monospace;
			margin: 15px 0;
			word-break: break-all;
		}
	</style>
</head>
<body>
	<div class="card">
		<h1>🎨 OG Image Development Mode</h1>
		<p>You're in development mode. OG images are generated dynamically only in production (Cloudflare).</p>
		
		<h3>📋 Current Request:</h3>
		<div class="code">${url.toString()}</div>
		
		<h3>🖼️ Preview this OG image:</h3>
		<a href="${previewUrl.toString()}" class="button" target="_blank">
			👀 View OG Preview
		</a>
		
		<h3>ℹ️ Development Info:</h3>
		<ul>
			<li><strong>Local:</strong> Use <code>/api/og-preview</code> to see OG image previews</li>
			<li><strong>Production:</strong> This endpoint generates real PNG images with workers-og</li>
			<li><strong>Meta tags:</strong> Will work automatically in production</li>
		</ul>
	</div>
</body>
</html>`,
				{
					status: 200,
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				}
			);
		}

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
