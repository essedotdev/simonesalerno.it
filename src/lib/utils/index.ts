import { writable } from 'svelte/store';
import type { Language, PageMap, Translation } from './types';

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

export function calculateOffset(anchorId: string): number {
	const offsets: { [key: string]: number } = {
		partner: 300,
		servizi: 160,
		contatti: 100
	};

	return offsets[anchorId] || 50;
}

// Pages map
export const pages: PageMap = {
	en: { projects: 'projects', about: 'about' },
	it: { projects: 'progetti', about: 'informazioni' }
};

export const menuStatus = writable(false);
export const translation = writable<Translation>();
export const languages = writable<Language[]>();
export const selectedLanguage = writable<string>();

// Re-export analytics utilities
export { initializeAnalytics, isAnalyticsReady, trackEvent, trackPageView } from './analytics';
