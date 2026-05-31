import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../src/lib/utils/og/escape';
import { createDetailHtml, createListingHtml } from '../../src/lib/utils/og/html-generator';

describe('escapeHtml', () => {
	it('escapes all HTML special characters', () => {
		expect(escapeHtml(`<script>alert("x")&'`)).toBe('&lt;script&gt;alert(&quot;x&quot;)&amp;&#39;');
	});

	it('is a no-op on plain text', () => {
		expect(escapeHtml('Budokan Sports Center')).toBe('Budokan Sports Center');
	});
});

describe('OG html-generator escapes injected markup', () => {
	it('escapes a malicious title on a detail layout', () => {
		const html = createDetailHtml('<img src=x onerror=alert(1)>', undefined, undefined);
		expect(html).not.toContain('<img src=x onerror=alert(1)>');
		expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
	});

	it('escapes a malicious title and subtitle on a listing layout', () => {
		const html = createListingHtml('<b>bad</b>', '</p><script>');
		expect(html).not.toContain('<b>bad</b>');
		expect(html).toContain('&lt;b&gt;bad&lt;/b&gt;');
		expect(html).not.toContain('</p><script>');
	});
});
