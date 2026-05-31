import { defineConfig, devices } from '@playwright/test';

// E2E contro il dev server (vite). Headless di default (adatto a CI);
// usa --headed localmente per vedere il browser.
export default defineConfig({
	testDir: 'tests/e2e',
	// Seriale: il dev server vite compila on-demand, il parallelismo causa
	// timeout a catena sul primo caricamento di ogni route.
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'list' : 'line',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'pnpm dev --port 5173 --strictPort',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
