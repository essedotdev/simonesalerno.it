import { browser, dev } from '$app/environment';

declare global {
	interface Window {
		umami?: {
			track: (event?: string, data?: Record<string, unknown>) => void;
		};
	}
}

export function trackPageView(url?: string) {
	if (!browser || !window.umami || dev) return;

	try {
		// Track page view with current URL or provided URL
		const trackingUrl = url || window.location.pathname + window.location.search;
		window.umami.track(undefined, { url: trackingUrl });
	} catch (error) {
		console.warn('Failed to track page view:', error);
	}
}

let isInitialized = false;

// Initialize tracking when Umami script is loaded
export function initializeAnalytics() {
	if (!browser || isInitialized || dev) return;

	// Wait for Umami to be available
	const checkUmami = () => {
		if (window.umami) {
			isInitialized = true;
			// Don't track page view here - let the navigation effect handle it
		} else {
			setTimeout(checkUmami, 100);
		}
	};

	checkUmami();
}

export function isAnalyticsReady() {
	return !dev && isInitialized && window.umami;
}
