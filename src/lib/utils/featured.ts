/**
 * Riordina una collezione mettendo davanti gli item featured, nell'ordine dato,
 * seguiti dal resto nell'ordine originale (che per progetti/articoli e gia
 * created_date/published_date desc). Funzione pura e testabile.
 *
 * - Gli id featured inesistenti sono ignorati (un progetto cancellato non rompe
 *   la home; il drift e comunque intercettato a build da validate-content).
 * - Nessun duplicato, anche se un id compare due volte in `featuredIds`.
 *
 * Non applica il limite: la home applica il proprio cap responsivo (max 6) a valle.
 */
export function orderFeaturedFirst<T extends { meta: { id: string } }>(
	items: T[],
	featuredIds: string[]
): T[] {
	const byId = new Map(items.map((item) => [item.meta.id, item]));
	const featured: T[] = [];
	const seen = new Set<string>();
	for (const id of featuredIds) {
		const item = byId.get(id);
		if (item && !seen.has(id)) {
			featured.push(item);
			seen.add(id);
		}
	}
	const rest = items.filter((item) => !seen.has(item.meta.id));
	return [...featured, ...rest];
}
