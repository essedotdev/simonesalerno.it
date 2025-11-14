import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

// Generate build timestamp for cache busting
const BUILD_TIMESTAMP = Date.now().toString();

export default defineConfig({
	define: {
		__BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP)
	},
	plugins: [
		tailwindcss(),
		imagetools({
			defaultDirectives: (url) => {
				// Apply transformations to images in /images/ directory
				if (url.pathname.includes('/images/')) {
					return new URLSearchParams({
						format: 'avif;webp;jpg',
						w: '400;800;1200;1920',
						as: 'srcset'
					});
				}
				return new URLSearchParams();
			}
		}),
		sveltekit()
	]
});
