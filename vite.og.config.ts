import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Config minimale per eseguire scripts/generate-og-images.ts con vite-node:
// risolve l'alias $lib e import.meta.glob (Vite core) senza il plugin SvelteKit,
// cosi' lo script puo' riusare ContentLoader/OgDataResolver/html-generator invariati.
export default defineConfig({
	define: {
		__BUILD_TIMESTAMP__: JSON.stringify('build')
	},
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	}
});
