import { getImageAsset } from '$lib/assets/image-assets';
import { ContentLoader } from '$lib/utils/content';
import {
	createDetailLayoutData,
	createHomeLayoutData,
	createListingLayoutData,
	type LayoutConfig
} from './og-layouts';

/**
 * Parameters for OG image generation
 */
export interface OgImageParams {
	type: string;
	section?: string;
	title?: string;
	imageKey?: string;
	excerpt?: string;
	lang: string;
}

/**
 * Parse URL search parameters into OgImageParams
 */
export function parseOgParams(url: URL): OgImageParams {
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
				${initials}
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

/**
 * Generate layout configuration from parameters
 */
export async function generateLayoutConfig(params: OgImageParams): Promise<LayoutConfig> {
	const { type, section, title, imageKey, excerpt, lang } = params;

	// Validate type parameter
	const validTypes = ['home', 'listing', 'detail'] as const;
	if (!validTypes.includes(type as (typeof validTypes)[number])) {
		console.warn(`[OG] Invalid type parameter: ${type}, falling back to 'home'`);
		return createHomeLayoutData();
	}

	// Validate section parameter when needed
	if (type === 'listing' && section && !['projects', 'blog'].includes(section)) {
		console.warn(`[OG] Invalid section parameter: ${section}, falling back to 'home'`);
		return createHomeLayoutData();
	}

	// Validate language parameter
	if (!['it', 'en'].includes(lang)) {
		console.warn(`[OG] Invalid language parameter: ${lang}, falling back to 'it'`);
		params.lang = 'it';
	}

	if (type === 'home') {
		return createHomeLayoutData();
	}

	if (type === 'listing' && section) {
		// Use provided title first, fallback to loading from content
		let pageTitle = title || (section === 'projects' ? 'Projects' : 'Blog');
		const pageSubtitle = '';

		// If no title was provided, try to load from content
		if (!title) {
			try {
				if (section === 'projects' || section === 'blog') {
					const contentLoader = new ContentLoader();
					const pageData = await contentLoader.loadPage(section, lang);
					pageTitle = pageData.title || pageTitle;
				}
			} catch (error) {
				console.warn(`[OG] Could not load page data for ${section}:`, error);
			}
		}

		return createListingLayoutData(pageTitle, pageSubtitle);
	}

	if (type === 'detail' && title) {
		// Sanitize title and excerpt
		const sanitizedTitle = title.slice(0, 100); // Limit title length
		const sanitizedExcerpt = excerpt ? excerpt.slice(0, 300) : undefined; // Limit excerpt length

		// Get cover image
		const coverImage = getDisplayImage(imageKey, sanitizedTitle, section);
		return createDetailLayoutData(sanitizedTitle, sanitizedExcerpt, coverImage);
	}

	// Fallback to home for any unrecognized configuration
	console.warn(
		`[OG] No valid configuration found for params:`,
		params,
		`- falling back to home layout`
	);
	return createHomeLayoutData();
}
