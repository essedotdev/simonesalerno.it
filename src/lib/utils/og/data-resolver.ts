import { ContentLoader } from '../content.js';
import type { LayoutConfig } from './layouts.js';
import {
	createDetailLayoutData,
	createHomeLayoutData,
	createListingLayoutData
} from './layouts.js';
import { getDisplayImage } from './shared.js';

/**
 * Resolve OG image data using the same logic as SvelteKit routing
 * This ensures consistency with the actual page data loading
 */
export class OgDataResolver {
	private loader: ContentLoader;

	constructor() {
		this.loader = new ContentLoader();
	}

	/**
	 * Resolve layout configuration by simulating SvelteKit's route resolution
	 */
	async resolveLayout(params: {
		type: string;
		section?: string;
		title?: string;
		imageKey?: string;
		excerpt?: string;
		lang: string;
	}): Promise<LayoutConfig> {
		const { type, section, title, imageKey, excerpt, lang } = params;

		// Validate language (same as SvelteKit param validation)
		const languages = await this.loader.loadConfig('languages');
		const validLang = languages.find((l) => l.code === lang)?.code || 'it';

		// Home page - no additional data needed
		if (type === 'home') {
			return createHomeLayoutData();
		}

		// Listing pages - load the same data as +layout.server.ts
		if (type === 'listing') {
			if (!section || !['projects', 'blog'].includes(section)) {
				console.warn(`[OG] Invalid section for listing: ${section}`);
				return createHomeLayoutData();
			}

			try {
				// Use the same loadPage method as +layout.server.ts
				const pageData = await this.loader.loadPage(section as 'projects' | 'blog', validLang);

				return createListingLayoutData(
					pageData.title || (section === 'projects' ? 'Projects' : 'Blog'),
					undefined // Listing pages don't need subtitles
				);
			} catch (error) {
				console.warn(`[OG] Failed to load page data for ${section}:`, error);
				return createHomeLayoutData();
			}
		}

		// Detail pages - use the same validation as the detail page server
		if (type === 'detail') {
			if (!title?.trim()) {
				console.warn(`[OG] Missing title for detail page`);
				return createHomeLayoutData();
			}

			// Validate section if provided (same as route validation)
			if (section && !['projects', 'blog'].includes(section)) {
				console.warn(`[OG] Invalid section for detail: ${section}`);
				// Continue without section validation instead of failing
			}

			// Sanitize inputs (same limits as the original)
			const sanitizedTitle = title.slice(0, 100).trim();
			const sanitizedExcerpt = excerpt ? excerpt.slice(0, 300).trim() : undefined;

			if (!sanitizedTitle) {
				console.warn(`[OG] Title became empty after sanitization`);
				return createHomeLayoutData();
			}

			// Get cover image with same strategy
			let coverImage: string | undefined;
			try {
				coverImage = getDisplayImage(imageKey, sanitizedTitle, section);
			} catch (error) {
				console.warn(`[OG] Error getting display image:`, error);
				coverImage = undefined;
			}

			return createDetailLayoutData(sanitizedTitle, sanitizedExcerpt, coverImage);
		}

		// Fallback to home (same as SvelteKit error handling)
		console.warn(`[OG] Unknown type: ${type}, falling back to home`);
		return createHomeLayoutData();
	}
}
