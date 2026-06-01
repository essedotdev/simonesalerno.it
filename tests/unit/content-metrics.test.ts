import { describe, expect, it } from 'vitest';
import {
	contentMetrics,
	countWords,
	estimateTokens,
	extractText,
	formatTokens,
	readingTimeMinutes
} from '../../src/lib/utils/content-metrics';
import type { ContentBlocks } from '../../src/lib/types';

const sample: ContentBlocks = {
	blocks: [
		{ type: 'header', data: { level: 2, text: 'Hello world' } },
		{ type: 'paragraph', data: { text: 'one two three four five' } },
		{ type: 'list', data: { items: ['alpha beta', 'gamma'] } },
		{ type: 'image', data: { src: '/x.png', alt: 'ignored' } },
		{ type: 'divider', data: {} }
	]
};

describe('extractText / countWords', () => {
	it('estrae testo da header, paragrafi e liste (ignora src immagine)', () => {
		const text = extractText(sample);
		expect(text).toContain('Hello world');
		expect(text).toContain('one two three four five');
		expect(text).toContain('alpha beta');
		expect(text).toContain('gamma');
		expect(text).not.toContain('/x.png');
	});

	it('conta le parole', () => {
		// 2 + 5 + 2 + 1 = 10
		expect(countWords(extractText(sample))).toBe(10);
	});

	it('gestisce contenuto vuoto/undefined', () => {
		expect(extractText(undefined)).toBe('');
		expect(countWords('')).toBe(0);
	});
});

describe('readingTimeMinutes', () => {
	it('minimo 1 minuto se ci sono parole, 0 se vuoto', () => {
		expect(readingTimeMinutes(10)).toBe(1);
		expect(readingTimeMinutes(0)).toBe(0);
		expect(readingTimeMinutes(450)).toBe(2);
	});
});

describe('estimateTokens / formatTokens', () => {
	it('stima ~1.3 token per parola', () => {
		expect(estimateTokens(100)).toBe(130);
	});

	it('formatta compatto', () => {
		expect(formatTokens(850)).toBe('850');
		expect(formatTokens(3210)).toBe('3.2k');
	});
});

describe('contentMetrics', () => {
	it('aggrega le metriche', () => {
		const m = contentMetrics(sample);
		expect(m.words).toBe(10);
		expect(m.minutes).toBe(1);
		expect(m.tokens).toBe(13);
		expect(m.tokensLabel).toBe('13');
	});
});
