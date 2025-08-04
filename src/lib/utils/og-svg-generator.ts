import { logoBase64 } from '$lib/assets/logo-base64';
import { OG_CONSTANTS, getCommonBackgroundElements, type LayoutConfig } from './og-layouts';

/**
 * Split text into multiple lines for SVG text elements
 */
function splitTextForSvg(text: string, maxLength: number = 80): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let currentLine = '';

	for (const word of words) {
		if ((currentLine + ' ' + word).length <= maxLength) {
			currentLine = currentLine ? currentLine + ' ' + word : word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return lines.slice(0, 3); // Max 3 lines for layout
}

/**
 * Escape XML special characters for SVG
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Create multiline text elements for SVG
 */
function createMultilineText(
	lines: string[],
	x: number,
	startY: number,
	lineHeight: number,
	fontSize: number,
	fill: string,
	textAnchor: string = 'start',
	fontFamily: string = OG_CONSTANTS.FONTS.FAMILY
): string {
	return lines
		.map(
			(line, index) =>
				`<text x="${x}" y="${startY + index * lineHeight}" text-anchor="${textAnchor}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}">${escapeXml(line)}</text>`
		)
		.join('\n\t');
}

/**
 * Create SVG background with gradient and noise
 */
function createSvgBackground(): string {
	const { gradient, noise } = getCommonBackgroundElements();

	return `<defs>
		<linearGradient id="${gradient.id}" x1="0%" y1="0%" x2="100%" y2="100%">
			${gradient.colors
				.map((color) => `<stop offset="${color.offset}" stop-color="${color.color}"/>`)
				.join('\n\t\t\t')}
		</linearGradient>
		<pattern id="noise" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
			<image href="${noise.src}" x="0" y="0" width="100" height="100" opacity="${noise.opacity}"/>
		</pattern>
	</defs>
	<rect width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" fill="url(#${gradient.id})"/>
	<rect width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" fill="url(#noise)" opacity="0.3"/>`;
}

/**
 * Create home page SVG layout
 */
export function createHomeSvg(): string {
	const centerX = OG_CONSTANTS.WIDTH / 2;
	const centerY = OG_CONSTANTS.HEIGHT / 2;

	return `<svg width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" xmlns="http://www.w3.org/2000/svg">
	${createSvgBackground()}
	
	<!-- Logo and brand text group, centered -->
	<g transform="translate(${centerX}, ${centerY})">
		<!-- Logo positioned to the left -->
		<image href="${logoBase64}" x="-114" y="-90" width="180" height="180"/>
		
		<!-- Brand text positioned to the right -->
		<text x="78" y="-20" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="72" font-weight="500" fill="${OG_CONSTANTS.COLORS.TEXT.PRIMARY}">esse</text>
		<text x="78" y="32" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="52" fill="${OG_CONSTANTS.COLORS.TEXT.SECONDARY}">dev</text>
	</g>
</svg>`;
}

/**
 * Create listing page SVG layout
 */
export function createListingSvg(title: string, subtitle?: string): string {
	const safeTitle = escapeXml(title);
	const safeSubtitle = subtitle ? escapeXml(subtitle) : '';
	const centerX = OG_CONSTANTS.WIDTH / 2;
	const centerY = OG_CONSTANTS.HEIGHT / 2;

	return `<svg width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" xmlns="http://www.w3.org/2000/svg">
	${createSvgBackground()}
	
	<!-- Top logo -->
	<image href="${logoBase64}" x="80" y="80" width="80" height="80"/>
	
	<!-- Centered content -->
	<g transform="translate(${centerX}, ${centerY})">
		<text x="0" y="-20" text-anchor="middle" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="64" font-weight="bold" fill="${OG_CONSTANTS.COLORS.TEXT.PRIMARY}">${safeTitle}</text>
		${subtitle ? `<text x="0" y="30" text-anchor="middle" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="24" fill="${OG_CONSTANTS.COLORS.TEXT.MUTED}">${safeSubtitle}</text>` : ''}
	</g>
</svg>`;
}

/**
 * Create detail page SVG layout
 */
export function createDetailSvg(title: string, excerpt?: string, coverImage?: string): string {
	const safeTitle = escapeXml(title);
	const hasImage = !!coverImage;

	if (hasImage) {
		// With image: 60/40 split layout
		const centerY = OG_CONSTANTS.HEIGHT / 2;
		let excerptElements = '';

		if (excerpt) {
			const safeExcerpt = escapeXml(excerpt);
			const lines = splitTextForSvg(safeExcerpt, 60);
			excerptElements = createMultilineText(
				lines,
				80,
				centerY + 20,
				24,
				20,
				OG_CONSTANTS.COLORS.TEXT.MUTED
			);
		}

		return `<svg width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" xmlns="http://www.w3.org/2000/svg">
	${createSvgBackground()}
	
	<!-- Left content area (720px) -->
	<text x="80" y="${centerY - 30}" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="48" font-weight="bold" fill="${OG_CONSTANTS.COLORS.TEXT.PRIMARY}">${safeTitle}</text>
	${excerptElements}
	
	<!-- Right image area (480px) -->
	<image href="${coverImage}" x="760" y="${centerY - 150}" width="400" height="300" style="border-radius: 12px;" preserveAspectRatio="xMidYMid slice"/>
</svg>`;
	} else {
		// Without image: centered layout
		const centerX = OG_CONSTANTS.WIDTH / 2;
		const centerY = OG_CONSTANTS.HEIGHT / 2;
		let excerptElements = '';

		if (excerpt) {
			const safeExcerpt = escapeXml(excerpt);
			const lines = splitTextForSvg(safeExcerpt, 70);
			excerptElements = createMultilineText(
				lines,
				centerX,
				centerY + 40,
				26,
				22,
				OG_CONSTANTS.COLORS.TEXT.MUTED,
				'middle'
			);
		}

		return `<svg width="${OG_CONSTANTS.WIDTH}" height="${OG_CONSTANTS.HEIGHT}" xmlns="http://www.w3.org/2000/svg">
	${createSvgBackground()}
	
	<!-- Centered content -->
	<g transform="translate(${centerX}, ${centerY})">
		<!-- Logo -->
		<image href="${logoBase64}" x="-60" y="-160" width="120" height="120"/>
		
		<!-- Title -->
		<text x="0" y="-20" text-anchor="middle" font-family="${OG_CONSTANTS.FONTS.FAMILY}" font-size="56" font-weight="bold" fill="${OG_CONSTANTS.COLORS.TEXT.PRIMARY}">${safeTitle}</text>
	</g>
	
	<!-- Excerpt text positioned absolutely -->
	${excerptElements}
</svg>`;
	}
}

/**
 * Generate SVG layout based on type and data
 */
export function generateSvgLayout(config: LayoutConfig): string {
	switch (config.type) {
		case 'home':
			return createHomeSvg();
		case 'listing':
			return createListingSvg(config.title || 'Page', config.subtitle);
		case 'detail':
			return createDetailSvg(config.title || 'Article', config.excerpt, config.coverImage);
		default:
			return createHomeSvg();
	}
}
