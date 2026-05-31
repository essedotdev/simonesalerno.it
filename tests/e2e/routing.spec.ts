import { expect, test } from '@playwright/test';

test.describe('i18n routing & redirects', () => {
	test('/ redirects to /en', async ({ page }) => {
		await page.goto('/');
		expect(page.url()).toMatch(/\/en(\/|$)/);
	});

	test('unknown single segment redirects to /en', async ({ page }) => {
		await page.goto('/totally-unknown');
		expect(page.url()).toMatch(/\/en(\/|$)/);
	});

	test('/en/projects serves the projects listing', async ({ page }) => {
		const res = await page.goto('/en/projects');
		expect(res?.status()).toBe(200);
		expect(page.url()).toContain('/en/projects');
		// ci sono link alle pagine di dettaglio progetto (i card sono lazy/opacity-0,
		// quindi verifichiamo la presenza nel DOM, non la visibilita')
		expect(await page.locator('a[href*="/projects/"]').count()).toBeGreaterThan(0);
	});

	test('/en/progetti (italian route under en) redirects to /en/projects', async ({ page }) => {
		await page.goto('/en/progetti');
		await page.waitForURL('**/en/projects');
		expect(page.url()).toContain('/en/projects');
	});

	test('unknown detail slug returns 404', async ({ page }) => {
		const res = await page.goto('/en/projects/does-not-exist-xyz');
		expect(res?.status()).toBe(404);
	});

	test('a real project detail page renders', async ({ page }) => {
		const res = await page.goto('/en/projects/budokan');
		expect(res?.status()).toBe(200);
		await expect(page.locator('h1, h2').first()).toBeVisible();
	});

	test('the italian detail route (language-switch target) renders', async ({ page }) => {
		// /it/progetti/budokan e' la destinazione dello switch EN->IT (cfr. unit getLanguageUrl)
		const res = await page.goto('/it/progetti/budokan');
		expect(res?.status()).toBe(200);
		await expect(page.locator('h1, h2').first()).toBeVisible();
	});
});

test.describe('sitemap', () => {
	test('sitemap.xml is well-formed and includes both languages with hreflang', async ({
		request
	}) => {
		const res = await request.get('/sitemap.xml');
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('xml');
		const body = await res.text();
		expect(body).toContain('<urlset');
		expect(body).toContain('/en');
		expect(body).toContain('/it');
		expect(body).toContain('hreflang');
	});
});
