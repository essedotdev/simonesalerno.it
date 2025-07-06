import { writable } from 'svelte/store';

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

// Mantieni solo gli store essenziali per la transizione
export const menuStatus = writable(false);

// Gli altri store saranno gradualmente rimossi in favore di props/context
// export const translation = writable<Translation>(); // DA RIMUOVERE
// export const languages = writable<Language[]>(); // DA RIMUOVERE
// export const selectedLanguage = writable<string>(); // DA RIMUOVERE

// Rimuovi anche l'oggetto pages hardcodato
// export const pages: PageMap = { ... }; // DA RIMUOVERE

// Re-export utilities
export { initializeAnalytics, isAnalyticsReady, trackEvent, trackPageView } from './analytics';
export { ContentLoader, getImagePath, getThumbnailPath, getFeaturedImagePath } from './content';
