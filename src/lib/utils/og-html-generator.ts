import { logoBase64 } from '../assets/logo-base64.js';
import {
	OG_CONSTANTS,
	OG_BANNER_CONSTANTS,
	getCommonBackgroundElements,
	type LayoutConfig
} from './og-layouts';

/**
 * Create base container with common background and styling
 */
function createBaseContainer(children: string, additionalStyles = '', isBanner = false): string {
	const { noise } = getCommonBackgroundElements();
	const constants = isBanner ? OG_BANNER_CONSTANTS : OG_CONSTANTS;

	return `
		<div style="
			width: ${constants.WIDTH}px;
			height: ${constants.HEIGHT}px;
			position: relative;
			background: linear-gradient(135deg, ${constants.COLORS.GRADIENT.START} 0%, ${constants.COLORS.GRADIENT.MID} 50%, ${constants.COLORS.GRADIENT.END} 100%);
			font-family: '${constants.FONTS.FAMILY}';
			${additionalStyles}
		">
			<div style="
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: url('${noise.src}');
				background-repeat: repeat;
				opacity: ${noise.opacity};
				mix-blend-mode: ${noise.blendMode};
				display: flex;
			"></div>
			${children}
		</div>
	`;
}

/**
 * Create home page layout as HTML for OG preview
 */
export function createHomeHtml(isBanner = false): string {
	// Scale sizes for banner format (3168x792 vs 1200x630)
	const scaleFactor = isBanner ? 2.6 : 1;
	const logoSize = Math.round(180 * scaleFactor);
	const primaryFontSize = Math.round(72 * scaleFactor);
	const secondaryFontSize = Math.round(52 * scaleFactor);
	const gap = Math.round(24 * scaleFactor);
	const marginTop = Math.round(-12 * scaleFactor);

	const constants = isBanner ? OG_BANNER_CONSTANTS : OG_CONSTANTS;

	const content = `
		<div style="
			display: flex;
			align-items: center;
			gap: ${gap}px;
			position: relative;
			z-index: 1;
		">
			<img src="${logoBase64}" width="${logoSize}" height="${logoSize}" style="display: block;" />
			<div style="
				display: flex;
				flex-direction: column;
				margin-bottom: 8px;
			">
				<span style="
					font-size: ${primaryFontSize}px;
					font-weight: 500;
					color: ${constants.COLORS.TEXT.PRIMARY};
					line-height: 1;
				">esse</span>
				<span style="
					font-size: ${secondaryFontSize}px;
					color: ${constants.COLORS.TEXT.SECONDARY};
					line-height: 0.8;
					margin-top: ${marginTop}px;
				">dev</span>
			</div>
		</div>
	`;

	return createBaseContainer(
		content,
		`
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	`,
		isBanner
	);
}

/**
 * Create listing page layout as HTML for OG preview
 */
export function createListingHtml(title: string, subtitle?: string, isBanner = false): string {
	const scaleFactor = isBanner ? 2.6 : 1;
	const logoSize = Math.round(80 * scaleFactor);
	const titleFontSize = Math.round(64 * scaleFactor);
	const subtitleFontSize = Math.round(24 * scaleFactor);
	const logoMargin = Math.round(24 * scaleFactor);
	const padding = Math.round(80 * scaleFactor);
	const subtitleMargin = Math.round(16 * scaleFactor);
	const maxWidth = Math.round(800 * scaleFactor);

	const constants = isBanner ? OG_BANNER_CONSTANTS : OG_CONSTANTS;

	const content = `
		<div style="
			display: flex;
			align-items: center;
			position: relative;
			z-index: 1;
		">
			<img src="${logoBase64}" width="${logoSize}" height="${logoSize}" style="margin-right: ${logoMargin}px;" />
		</div>

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
				font-size: ${titleFontSize}px;
				font-weight: bold;
				color: ${constants.COLORS.TEXT.PRIMARY};
				text-align: center;
				margin: 0;
				line-height: 1.1;
			">${title}</h1>
			${
				subtitle
					? `
				<p style="
					font-size: ${subtitleFontSize}px;
					color: ${constants.COLORS.TEXT.MUTED};
					text-align: center;
					margin: ${subtitleMargin}px 0 0 0;
					max-width: ${maxWidth}px;
				">${subtitle}</p>
			`
					: ''
			}
		</div>
	`;

	return createBaseContainer(
		content,
		`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: ${padding}px;
	`,
		isBanner
	);
}

/**
 * Create detail page layout as HTML for OG preview
 */
export function createDetailHtml(
	title: string,
	excerpt?: string,
	coverImage?: string,
	isBanner = false
): string {
	const scaleFactor = isBanner ? 2.6 : 1;
	const constants = isBanner ? OG_BANNER_CONSTANTS : OG_CONSTANTS;
	const hasImage = !!coverImage;

	if (hasImage) {
		// With image: 60/40 split
		const textWidth = Math.round(720 * scaleFactor);
		const imageWidth = Math.round(480 * scaleFactor);
		const padding1 = Math.round(80 * scaleFactor);
		const padding2 = Math.round(40 * scaleFactor);
		const titleFontSize = Math.round(48 * scaleFactor);
		const excerptFontSize = Math.round(20 * scaleFactor);
		const titleMargin = Math.round(24 * scaleFactor);
		const imageSize = Math.round(400 * scaleFactor);
		const imageHeight = Math.round(300 * scaleFactor);
		const borderRadius = Math.round(12 * scaleFactor);

		const content = `
			<div style="
				width: ${textWidth}px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: ${padding1}px ${padding2}px ${padding1}px ${padding1}px;
				position: relative;
				z-index: 1;
			">
				<h1 style="
					font-size: ${titleFontSize}px;
					font-weight: bold;
					color: ${constants.COLORS.TEXT.PRIMARY};
					margin: 0 0 ${titleMargin}px 0;
					line-height: 1.1;
				">${title}</h1>
				${
					excerpt
						? `
					<p style="
						font-size: ${excerptFontSize}px;
						color: ${constants.COLORS.TEXT.MUTED};
						margin: 0;
						line-height: 1.4;
					">${excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt}</p>
				`
						: ''
				}
			</div>

			<div style="
				width: ${imageWidth}px;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: ${padding1}px ${padding1}px ${padding1}px ${padding2}px;
				position: relative;
				z-index: 1;
			">
				<img src="${coverImage}" width="${imageSize}" height="${imageHeight}" style="
					border-radius: ${borderRadius}px;
					object-fit: cover;
				" />
			</div>
		`;

		return createBaseContainer(content, 'display: flex;', isBanner);
	} else {
		// Without image: centered
		const logoSize = Math.round(120 * scaleFactor);
		const logoMargin = Math.round(40 * scaleFactor);
		const titleFontSize = Math.round(56 * scaleFactor);
		const excerptFontSize = Math.round(22 * scaleFactor);
		const titleMargin = Math.round(24 * scaleFactor);
		const maxWidth1 = Math.round(900 * scaleFactor);
		const maxWidth2 = Math.round(800 * scaleFactor);
		const padding = Math.round(80 * scaleFactor);

		const content = `
			<div style="
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				position: relative;
				z-index: 1;
			">
				<img src="${logoBase64}" width="${logoSize}" height="${logoSize}" style="margin-bottom: ${logoMargin}px;" />
				<h1 style="
					font-size: ${titleFontSize}px;
					font-weight: bold;
					color: ${constants.COLORS.TEXT.PRIMARY};
					text-align: center;
					margin: 0 0 ${titleMargin}px 0;
					line-height: 1.1;
					max-width: ${maxWidth1}px;
				">${title}</h1>
				${
					excerpt
						? `
					<p style="
						font-size: ${excerptFontSize}px;
						color: ${constants.COLORS.TEXT.MUTED};
						text-align: center;
						margin: 0;
						line-height: 1.4;
						max-width: ${maxWidth2}px;
					">${excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt}</p>
				`
						: ''
				}
			</div>
		`;

		return createBaseContainer(
			content,
			`
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: ${padding}px;
		`,
			isBanner
		);
	}
}

/**
 * Generate HTML layout based on type and data
 */
export function generateHtmlLayout(config: LayoutConfig, isBanner = false): string {
	switch (config.type) {
		case 'home':
			return createHomeHtml(isBanner);
		case 'listing':
			return createListingHtml(config.title || 'Page', config.subtitle, isBanner);
		case 'detail':
			return createDetailHtml(
				config.title || 'Article',
				config.excerpt,
				config.coverImage,
				isBanner
			);
		default:
			return createHomeHtml(isBanner);
	}
}
