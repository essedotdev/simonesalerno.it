import scrollConfig from '../content/config/scroll.json';
import type { ScrollConfig } from '../types';

const config: ScrollConfig = scrollConfig;

/**
 * Handles smooth scrolling to anchor links with configurable offsets
 */
export function handleAnchorClick(event: MouseEvent) {
	const link = event.currentTarget as HTMLAnchorElement;
	const anchorId = new URL(link.href).hash;

	if (anchorId.startsWith('#')) {
		const id = anchorId.replace('#', '');
		const anchor = document.getElementById(id);

		if (anchor) {
			event.preventDefault();

			window.scrollTo({
				top: anchor.offsetTop - calculateOffset(id),
				behavior: 'smooth'
			});
		}
	}
}

/**
 * Calculates scroll offset for different sections using configuration
 */
export function calculateOffset(anchorId: string): number {
	return config.offsets[anchorId] || config.defaultOffset;
}

/**
 * Smooth scroll to top of page
 */
export function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}

/**
 * Smooth scroll to specific element by ID
 */
export function scrollToElement(elementId: string, offset: number = 50) {
	const element = document.getElementById(elementId);
	if (element) {
		window.scrollTo({
			top: element.offsetTop - offset,
			behavior: 'smooth'
		});
	}
}
