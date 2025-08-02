import { getImageAsset } from '$lib/assets/image-assets';
import { logoBase64 } from '$lib/assets/logo-base64';
import { ContentLoader } from '$lib/utils/content';
import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from '@sveltejs/kit';
import satori from 'satori';

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
 * Create home page layout
 */
function createHomeLayout() {
	return {
		type: 'div',
		props: {
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				background:
					'radial-gradient(circle at 0% 90.68%, #20327e 0%, transparent 50%), radial-gradient(circle at 96.57% 2.62%, #131b49 0%, transparent 50%), radial-gradient(circle at 46.13% 45.15%, #000000 0%, transparent 50%), #0c0c0c',
				fontFamily: 'system-ui, -apple-system, sans-serif'
			},
			children: [
				{
					type: 'img',
					props: {
						src: logoBase64,
						width: 180,
						height: 180,
						style: { borderRadius: '16px' }
					}
				}
			]
		}
	};
}

/**
 * Create listing page layout
 */
function createListingLayout(title: string, subtitle?: string) {
	return {
		type: 'div',
		props: {
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				background:
					'radial-gradient(circle at 0% 90.68%, #20327e 0%, transparent 50%), radial-gradient(circle at 96.57% 2.62%, #131b49 0%, transparent 50%), radial-gradient(circle at 46.13% 45.15%, #000000 0%, transparent 50%), #0c0c0c',
				padding: '80px',
				fontFamily: 'system-ui, -apple-system, sans-serif'
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							alignItems: 'center'
						},
						children: [
							{
								type: 'img',
								props: {
									src: logoBase64,
									width: 80,
									height: 80,
									style: { borderRadius: '8px', marginRight: '24px' }
								}
							}
						]
					}
				},
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							flex: 1
						},
						children: [
							{
								type: 'h1',
								props: {
									style: {
										fontSize: '64px',
										fontWeight: 'bold',
										color: '#ffffff',
										textAlign: 'center',
										margin: '0',
										lineHeight: 1.1
									},
									children: title
								}
							},
							subtitle && {
								type: 'p',
								props: {
									style: {
										fontSize: '24px',
										color: '#a1a1aa',
										textAlign: 'center',
										margin: '16px 0 0 0',
										maxWidth: '800px'
									},
									children: subtitle
								}
							}
						].filter(Boolean)
					}
				}
			]
		}
	};
}

/**
 * Create detail page layout
 */
function createDetailLayout(title: string, excerpt?: string, coverImage?: string) {
	const hasImage = !!coverImage;

	return {
		type: 'div',
		props: {
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				background:
					'radial-gradient(circle at 0% 90.68%, #20327e 0%, transparent 50%), radial-gradient(circle at 96.57% 2.62%, #131b49 0%, transparent 50%), radial-gradient(circle at 46.13% 45.15%, #000000 0%, transparent 50%), #0c0c0c',
				fontFamily: 'system-ui, -apple-system, sans-serif'
			},
			children: hasImage
				? [
						// With image: 60/40 split
						{
							type: 'div',
							props: {
								style: {
									width: '720px',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									padding: '80px 40px 80px 80px'
								},
								children: [
									{
										type: 'h1',
										props: {
											style: {
												fontSize: '48px',
												fontWeight: 'bold',
												color: '#ffffff',
												margin: '0 0 24px 0',
												lineHeight: 1.1
											},
											children: title
										}
									},
									excerpt && {
										type: 'p',
										props: {
											style: {
												fontSize: '20px',
												color: '#a1a1aa',
												margin: '0',
												lineHeight: 1.4
											},
											children: excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt
										}
									}
								].filter(Boolean)
							}
						},
						{
							type: 'div',
							props: {
								style: {
									width: '480px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									padding: '80px 80px 80px 40px'
								},
								children: [
									{
										type: 'img',
										props: {
											src: coverImage,
											width: 400,
											height: 300,
											style: {
												borderRadius: '12px',
												objectFit: 'cover'
											}
										}
									}
								]
							}
						}
					]
				: [
						// Without image: centered
						{
							type: 'div',
							props: {
								style: {
									width: '100%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '80px'
								},
								children: [
									{
										type: 'img',
										props: {
											src: logoBase64,
											width: 120,
											height: 120,
											style: { borderRadius: '12px', marginBottom: '40px' }
										}
									},
									{
										type: 'h1',
										props: {
											style: {
												fontSize: '56px',
												fontWeight: 'bold',
												color: '#ffffff',
												textAlign: 'center',
												margin: '0 0 24px 0',
												lineHeight: 1.1,
												maxWidth: '900px'
											},
											children: title
										}
									},
									excerpt && {
										type: 'p',
										props: {
											style: {
												fontSize: '22px',
												color: '#a1a1aa',
												textAlign: 'center',
												margin: '0',
												lineHeight: 1.4,
												maxWidth: '800px'
											},
											children: excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt
										}
									}
								].filter(Boolean)
							}
						}
					]
		}
	};
}

export const GET: RequestHandler = async ({ url }) => {
	try {
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

		let layout;

		if (type === 'home') {
			layout = createHomeLayout();
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

			layout = createListingLayout(pageTitle, pageSubtitle);
		} else if (type === 'detail' && title) {
			// Get cover image
			const coverImage = await getDisplayImage(imageUrl, imageKey, title, section);

			layout = createDetailLayout(title, excerpt, coverImage);
		} else {
			// Fallback to home
			layout = createHomeLayout();
		}

		// Generate SVG using satori
		const svg = await satori(layout, {
			width: 1200,
			height: 630,
			fonts: [] // We'll use system fonts for now
		});

		// Convert SVG to PNG using resvg
		const resvg = new Resvg(svg);
		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		// Return PNG with appropriate headers
		return new Response(pngBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=86400, s-maxage=86400',
				'CDN-Cache-Control': 'max-age=86400',
				'Cloudflare-CDN-Cache-Control': 'max-age=86400'
			}
		});
	} catch (error) {
		console.error('OG Image generation error:', error);

		// Return a simple fallback image
		const fallbackSvg = `
			<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
				<rect width="1200" height="630" fill="#0c0c0c"/>
				<text x="600" y="315" text-anchor="middle" dy="0.3em" 
					  font-family="system-ui" font-size="48" fill="#ffffff">
					Open Graph Image
				</text>
			</svg>
		`;

		const resvg = new Resvg(fallbackSvg);
		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		return new Response(pngBuffer, {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
};
