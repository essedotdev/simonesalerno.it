import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				// SvelteKit aggiunge automaticamente hash/nonce ai propri script inline.
				// Umami e' caricato come script esterno da app.html.
				'script-src': ['self', 'https://umami.essedev.it'],
				// 'unsafe-inline' necessario per gli attributi style inline dei componenti.
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:'],
				'connect-src': ['self', 'https://umami.essedev.it'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
