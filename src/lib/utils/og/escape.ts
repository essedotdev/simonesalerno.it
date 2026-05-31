/**
 * Escapa i caratteri speciali HTML. Necessario sia per sicurezza sia per
 * correttezza: title/excerpt finiscono in stringhe HTML poi parsate da satori-html
 * a build time, quindi un '<' o '&' romperebbe il markup.
 */
export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
