import { describe, expect, it } from 'vitest';
import {
	createDetailHtml,
	createHomeHtml,
	createListingHtml
} from '../../src/lib/utils/og/html-generator';

describe('OG html-generator', () => {
	it('createHomeHtml returns a non-empty html string', () => {
		const html = createHomeHtml();
		expect(typeof html).toBe('string');
		expect(html.length).toBeGreaterThan(0);
	});

	it('createListingHtml includes the title', () => {
		expect(createListingHtml('Projects')).toContain('Projects');
	});

	it('createListingHtml includes the subtitle when provided', () => {
		const html = createListingHtml('Blog', 'All my writing');
		expect(html).toContain('Blog');
		expect(html).toContain('All my writing');
	});

	it('createDetailHtml includes the title', () => {
		expect(createDetailHtml('My Project', 'An excerpt', undefined)).toContain('My Project');
	});

	it('createDetailHtml truncates a long excerpt', () => {
		const longExcerpt = 'x'.repeat(400);
		const html = createDetailHtml('Title', longExcerpt, undefined);
		expect(html).toContain('...');
		// non deve contenere l'intero excerpt non troncato
		expect(html).not.toContain(longExcerpt);
	});
});
