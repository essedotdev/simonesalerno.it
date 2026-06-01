import { describe, expect, it } from 'vitest';
import {
	contentMetrics,
	countWords,
	estimateTokens,
	extractCode,
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

const withCode: ContentBlocks = {
	blocks: [
		{ type: 'paragraph', data: { text: 'hello world' } },
		{ type: 'code', data: { language: 'ts', text: 'const x = 1;' } }
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

	it('esclude i code block dalla prosa', () => {
		expect(extractText(withCode)).toBe('hello world');
		expect(countWords(extractText(withCode))).toBe(2);
	});

	it('gestisce contenuto vuoto/undefined', () => {
		expect(extractText(undefined)).toBe('');
		expect(countWords('')).toBe(0);
	});
});

describe('extractCode', () => {
	it('estrae solo il testo dei code block', () => {
		expect(extractCode(withCode)).toBe('const x = 1;');
		expect(extractCode(sample)).toBe('');
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
	it('stima dai caratteri, ~4/token EN e ~3.5/token IT', () => {
		expect(estimateTokens(100, 'en')).toBe(25);
		expect(estimateTokens(100, 'it')).toBe(29);
	});

	it('default a EN per lingue sconosciute', () => {
		expect(estimateTokens(100)).toBe(25);
		expect(estimateTokens(100, 'fr')).toBe(25);
	});

	it('formatta compatto', () => {
		expect(formatTokens(850)).toBe('850');
		expect(formatTokens(3210)).toBe('3.2k');
	});
});

describe('contentMetrics', () => {
	it('aggrega le metriche (default EN)', () => {
		const m = contentMetrics(sample);
		expect(m.words).toBe(10);
		expect(m.minutes).toBe(1);
		// prosa = 52 caratteri -> round(52/4) = 13
		expect(m.tokens).toBe(13);
		expect(m.tokensLabel).toBe('13');
	});

	it('usa il divisore IT quando lang = it', () => {
		const m = contentMetrics(sample, 'it');
		// round(52/3.5) = 15
		expect(m.tokens).toBe(15);
	});

	it('conta il codice nei token ma non nelle parole/minuti', () => {
		const m = contentMetrics(withCode, 'en');
		expect(m.words).toBe(2);
		expect(m.minutes).toBe(1);
		// (11 prosa + 12 codice) / 4 = round(5.75) = 6
		expect(m.tokens).toBe(6);
	});
});
