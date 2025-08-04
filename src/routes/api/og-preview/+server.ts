import { generateHtmlLayout } from '$lib/utils/og-html-generator';
import { generateLayoutConfig, parseOgParams } from '$lib/utils/og-shared';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse parameters and generate layout using shared functions
		const params = parseOgParams(url);
		const layoutConfig = await generateLayoutConfig(params);

		// Generate HTML layout (same as what gets converted to PNG)
		const htmlLayout = generateHtmlLayout(layoutConfig);

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
		}
		.test-links h3 {
			margin: 0 0 15px 0;
			color: #4ade80;
			font-size: 18px;
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
	</style>
</head>
<body>
	<div class="test-links">
		<h3>🧪 Test Links - OG Image Layouts</h3>
		
		<div class="test-category">
			<h4>Home Layouts</h4>
			<a href="?type=home&lang=it" ${params.type === 'home' && params.lang === 'it' ? 'class="current"' : ''}>Home IT</a>
			<a href="?type=home&lang=en" ${params.type === 'home' && params.lang === 'en' ? 'class="current"' : ''}>Home EN</a>
		</div>
		
		<div class="test-category">
			<h4>Listing Pages</h4>
			<a href="?type=listing&section=projects&lang=it" ${params.type === 'listing' && params.section === 'projects' && params.lang === 'it' ? 'class="current"' : ''}>Projects IT</a>
			<a href="?type=listing&section=projects&lang=en" ${params.type === 'listing' && params.section === 'projects' && params.lang === 'en' ? 'class="current"' : ''}>Projects EN</a>
			<a href="?type=listing&section=blog&lang=it" ${params.type === 'listing' && params.section === 'blog' && params.lang === 'it' ? 'class="current"' : ''}>Blog IT</a>
			<a href="?type=listing&section=blog&lang=en" ${params.type === 'listing' && params.section === 'blog' && params.lang === 'en' ? 'class="current"' : ''}>Blog EN</a>
		</div>
		
		<div class="test-category">
			<h4>Detail Pages (without image)</h4>
			<a href="?type=detail&title=Test%20Project%20Title&section=projects&lang=it&excerpt=Questo%20è%20un%20progetto%20di%20test%20per%20verificare%20il%20layout%20delle%20OG%20images%20senza%20immagine%20di%20copertina.">Project Detail IT</a>
			<a href="?type=detail&title=Test%20Article%20Title&section=blog&lang=en&excerpt=This%20is%20a%20test%20article%20to%20verify%20the%20OG%20image%20layout%20without%20cover%20image.">Article Detail EN</a>
		</div>
		
		<div class="test-category">
			<h4>Detail Pages (with image)</h4>
			<a href="?type=detail&title=Il%20Mio%20Nuovo%20Laboratorio&section=blog&lang=it&imageKey=ilMioNuovoLaboratorioFeatured&excerpt=Descrizione%20del%20nuovo%20setup%20del%20laboratorio%20con%20tutte%20le%20tecnologie%20moderne.">Lab Article (with image)</a>
			<a href="?type=detail&title=Long%20Title%20That%20Should%20Be%20Truncated%20Properly%20In%20The%20Layout&section=projects&lang=en&excerpt=This%20is%20a%20very%20long%20excerpt%20that%20should%20be%20truncated%20properly%20in%20the%20OG%20image%20layout%20to%20ensure%20it%20fits%20nicely%20within%20the%20boundaries%20and%20doesn't%20overflow.">Long Title Test</a>
		</div>
	</div>

	<div class="info">
		<strong>📋 Current Preview</strong><br>
		Type: <code>${params.type}</code> | Section: <code>${params.section || 'none'}</code> | Title: <code>${params.title || 'none'}</code><br>
		Lang: <code>${params.lang}</code> | Image Key: <code>${params.imageKey || 'none'}</code><br>
		<small>This preview shows exactly what gets converted to PNG in production.</small>
	</div>
	
	<div class="preview-container">
		${htmlLayout}
	</div>
	
	<div class="note">
		<strong>💡 Production URL:</strong> Replace <code>/api/og-preview</code> with <code>/api/og-image</code> to get the actual PNG image.<br>
		<strong>🔧 Development:</strong> The main OG endpoint returns SVG fallback in dev mode. Use this preview for testing layouts.
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
