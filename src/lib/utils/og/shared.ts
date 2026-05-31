import { getImageAsset } from '$lib/assets/image-assets.js';
import { escapeHtml } from './escape.js';

/**
 * Parse URL search parameters for OG image generation
 */
export function parseOgParams(url: URL) {
	return {
		type: url.searchParams.get('type') || 'home',
		section: url.searchParams.get('section') || undefined,
		title: url.searchParams.get('title') || undefined,
		imageKey: url.searchParams.get('imageKey') || undefined,
		excerpt: url.searchParams.get('excerpt') || undefined,
		lang: url.searchParams.get('lang') || 'it'
		// Note: 'v' parameter is ignored, used only for cache busting
	};
}

/**
 * Create placeholder image with initials
 */
export function createPlaceholder(title: string, section: 'projects' | 'blog'): string {
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
				${escapeHtml(initials)}
			</text>
		</svg>
	`;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get display image with fallback strategy
 */
export function getDisplayImage(
	imageKey?: string,
	title?: string,
	section?: string
): string | undefined {
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
