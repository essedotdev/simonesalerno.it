import type { ContentBlocks } from '../types';

/**
 * Metriche di lettura per un articolo, derivate dal testo dei content blocks.
 * Funzioni pure e testabili. La stima token è approssimata (~1.3 token/parola per
 * i modelli moderni) e va etichettata con "~": non sostituisce un tokenizer reale.
 */

/** Estrae il testo piano dai content blocks (paragrafi, header, liste, quote). */
export function extractText(content: ContentBlocks | undefined): string {
	if (!content?.blocks) return '';
	const parts: string[] = [];
	for (const block of content.blocks) {
		const data = block.data;
		if (typeof data.text === 'string') parts.push(data.text);
		if (Array.isArray(data.items)) {
			parts.push(...data.items.filter((i): i is string => typeof i === 'string'));
		}
	}
	return parts.join(' ');
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

/** Stima approssimata dei token (~1.3 per parola). */
export function estimateTokens(words: number): number {
	return Math.round(words * 1.3);
}

/** Formatta i token in modo compatto: 850 -> "850", 3210 -> "3.2k". */
export function formatTokens(tokens: number): string {
	return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);
}

/** Metriche complete da un blocco di contenuto. */
export function contentMetrics(content: ContentBlocks | undefined): {
	words: number;
	minutes: number;
	tokens: number;
	tokensLabel: string;
} {
	const words = countWords(extractText(content));
	const tokens = estimateTokens(words);
	return {
		words,
		minutes: readingTimeMinutes(words),
		tokens,
		tokensLabel: formatTokens(tokens)
	};
}
