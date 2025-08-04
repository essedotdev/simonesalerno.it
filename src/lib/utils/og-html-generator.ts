import { logoBase64 } from '$lib/assets/logo-base64';
import { OG_CONSTANTS, getCommonBackgroundElements, type LayoutConfig } from './og-layouts';

/**
 * Create base container with common background and styling
 */
function createBaseContainer(children: string, additionalStyles = ''): string {
	const { noise } = getCommonBackgroundElements();
	return `
		<div style="
			width: ${OG_CONSTANTS.WIDTH}px;
			height: ${OG_CONSTANTS.HEIGHT}px;
			position: relative;
			background: linear-gradient(135deg, ${OG_CONSTANTS.COLORS.GRADIENT.START} 0%, ${OG_CONSTANTS.COLORS.GRADIENT.MID} 50%, ${OG_CONSTANTS.COLORS.GRADIENT.END} 100%);
			font-family: '${OG_CONSTANTS.FONTS.FAMILY}';
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
 * Create home page layout as HTML for workers-og
 */
export function createHomeHtml(): string {
	const content = `
		<div style="
			display: flex;
			align-items: center;
			gap: 24px;
			position: relative;
			z-index: 1;
		">
			<img src="${logoBase64}" width="180" height="180" style="display: block;" />
			<div style="
				display: flex;
				flex-direction: column;
				margin-bottom: 8px;
			">
				<span style="
					font-size: 72px;
					font-weight: 500;
					color: ${OG_CONSTANTS.COLORS.TEXT.PRIMARY};
					line-height: 1;
				">esse</span>
				<span style="
					font-size: 52px;
					color: ${OG_CONSTANTS.COLORS.TEXT.SECONDARY};
					line-height: 0.8;
					margin-top: -12px;
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
	`
	);
}

/**
 * Create listing page layout as HTML for workers-og
 */
export function createListingHtml(title: string, subtitle?: string): string {
	const content = `
		<div style="
			display: flex;
			align-items: center;
			position: relative;
			z-index: 1;
		">
			<img src="${logoBase64}" width="80" height="80" style="margin-right: 24px;" />
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
				font-size: 64px;
				font-weight: bold;
				color: ${OG_CONSTANTS.COLORS.TEXT.PRIMARY};
				text-align: center;
				margin: 0;
				line-height: 1.1;
			">${title}</h1>
			${
				subtitle
					? `
				<p style="
					font-size: 24px;
					color: ${OG_CONSTANTS.COLORS.TEXT.MUTED};
					text-align: center;
					margin: 16px 0 0 0;
					max-width: 800px;
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
		padding: 80px;
	`
	);
}

/**
 * Create detail page layout as HTML for workers-og
 */
export function createDetailHtml(title: string, excerpt?: string, coverImage?: string): string {
	const hasImage = !!coverImage;

	if (hasImage) {
		// With image: 60/40 split
		const content = `
			<div style="
				width: 720px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 80px 40px 80px 80px;
				position: relative;
				z-index: 1;
			">
				<h1 style="
					font-size: 48px;
					font-weight: bold;
					color: ${OG_CONSTANTS.COLORS.TEXT.PRIMARY};
					margin: 0 0 24px 0;
					line-height: 1.1;
				">${title}</h1>
				${
					excerpt
						? `
					<p style="
						font-size: 20px;
						color: ${OG_CONSTANTS.COLORS.TEXT.MUTED};
						margin: 0;
						line-height: 1.4;
					">${excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt}</p>
				`
						: ''
				}
			</div>
			
			<div style="
				width: 480px;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 80px 80px 80px 40px;
				position: relative;
				z-index: 1;
			">
				<img src="${coverImage}" width="400" height="300" style="
					border-radius: 12px;
					object-fit: cover;
				" />
			</div>
		`;

		return createBaseContainer(content, 'display: flex;');
	} else {
		// Without image: centered
		const content = `
			<div style="
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				position: relative;
				z-index: 1;
			">
				<img src="${logoBase64}" width="120" height="120" style="margin-bottom: 40px;" />
				<h1 style="
					font-size: 56px;
					font-weight: bold;
					color: ${OG_CONSTANTS.COLORS.TEXT.PRIMARY};
					text-align: center;
					margin: 0 0 24px 0;
					line-height: 1.1;
					max-width: 900px;
				">${title}</h1>
				${
					excerpt
						? `
					<p style="
						font-size: 22px;
						color: ${OG_CONSTANTS.COLORS.TEXT.MUTED};
						text-align: center;
						margin: 0;
						line-height: 1.4;
						max-width: 800px;
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
			padding: 80px;
		`
		);
	}
}

/**
 * Generate HTML layout based on type and data
 */
export function generateHtmlLayout(config: LayoutConfig): string {
	switch (config.type) {
		case 'home':
			return createHomeHtml();
		case 'listing':
			return createListingHtml(config.title || 'Page', config.subtitle);
		case 'detail':
			return createDetailHtml(config.title || 'Article', config.excerpt, config.coverImage);
		default:
			return createHomeHtml();
	}
}
