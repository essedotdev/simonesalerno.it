import wasm from '@rollup/plugin-wasm';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
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
		wasm({
			// Inline WASM modules into the bundle and target browser-like environment (Workers)
			targetEnv: 'browser',
			maxFileSize: Infinity
		}),
		sveltekit()
	],
	ssr: {
		noExternal: ['@cf-wasm/resvg']
	},
	optimizeDeps: {
		include: ['@cf-wasm/resvg']
	},
	build: {
		rollupOptions: {
			external: [],
			output: {
				inlineDynamicImports: false
			}
		}
	}
});
