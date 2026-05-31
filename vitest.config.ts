import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Vitest gira sui moduli di logica pura (no componenti Svelte, no runtime Worker).
// import.meta.glob e' supportato nativamente da Vite; risolviamo solo l'alias $lib.
export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		environment: 'node',
		include: ['tests/unit/**/*.test.ts'],
		globals: true
	}
});
