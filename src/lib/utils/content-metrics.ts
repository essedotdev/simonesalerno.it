import type { ContentBlocks } from '../types';

/**
 * Metriche di lettura per un articolo, derivate dal testo dei content blocks.
 * Funzioni pure e testabili. La stima token è approssimata e va etichettata con
 * "~": non sostituisce un tokenizer reale. È basata sui caratteri (più stabile
 * delle parole, cattura la lunghezza media) e tarata per lingua, perché i
 * tokenizer BPE frammentano l'italiano più dell'inglese.
 */

/** Tipi di blocco che contengono prosa leggibile (concorrono a parole e minuti). */
const PROSE_TYPES = new Set(['paragraph', 'header', 'list', 'quote']);

/** Caratteri per token, per lingua (regola del pollice: ~4 EN, ~3.5 IT). */
const CHARS_PER_TOKEN: Record<string, number> = { it: 3.5, en: 4 };

/** Estrae la prosa dai content blocks (paragrafi, header, liste, quote). */
export function extractText(content: ContentBlocks | undefined): string {
	if (!content?.blocks) return '';
	const parts: string[] = [];
	for (const block of content.blocks) {
		if (!PROSE_TYPES.has(block.type)) continue;
		const data = block.data;
		if (typeof data.text === 'string') parts.push(data.text);
		if (Array.isArray(data.items)) {
			parts.push(...data.items.filter((i): i is string => typeof i === 'string'));
		}
	}
	return parts.join(' ');
}

/** Estrae il testo dei code block (conta per i token, non per il tempo di lettura). */
export function extractCode(content: ContentBlocks | undefined): string {
	if (!content?.blocks) return '';
	const parts: string[] = [];
	for (const block of content.blocks) {
		if (block.type !== 'code') continue;
		if (typeof block.data.text === 'string') parts.push(block.data.text);
	}
	return parts.join('\n');
}

/** Conta le parole di un testo. */
export function countWords(text: string): number {
	const trimmed = text.trim();
	return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Minuti di lettura (>= 1), a ~200 parole/minuto. */
export function readingTimeMinutes(words: number, wpm = 200): number {
	if (words <= 0) return 0;
	return Math.max(1, Math.round(words / wpm));
}

/** Stima approssimata dei token dal numero di caratteri, tarata per lingua. */
export function estimateTokens(charCount: number, lang = 'en'): number {
	const divisor = CHARS_PER_TOKEN[lang] ?? CHARS_PER_TOKEN.en;
	return Math.round(charCount / divisor);
}

/** Formatta i token in modo compatto: 850 -> "850", 3210 -> "3.2k". */
export function formatTokens(tokens: number): string {
	return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);
}

/** Metriche complete da un blocco di contenuto, nella lingua data. */
export function contentMetrics(
	content: ContentBlocks | undefined,
	lang = 'en'
): {
	words: number;
	minutes: number;
	tokens: number;
	tokensLabel: string;
} {
	const prose = extractText(content);
	const code = extractCode(content);
	const words = countWords(prose);
	const tokens = estimateTokens(prose.length + code.length, lang);
	return {
		words,
		minutes: readingTimeMinutes(words),
		tokens,
		tokensLabel: formatTokens(tokens)
	};
}
