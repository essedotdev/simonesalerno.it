import { describe, expect, it } from 'vitest';
import { orderFeaturedFirst } from '../../src/lib/utils/featured';

const item = (id: string) => ({ meta: { id } });
// L'input simula l'ordine del loader (created_date desc): d, c, b, a
const items = [item('d'), item('c'), item('b'), item('a')];
const ids = (list: { meta: { id: string } }[]) => list.map((i) => i.meta.id);

describe('orderFeaturedFirst', () => {
	it("mette i featured davanti nell'ordine dato, poi il resto invariato", () => {
		expect(ids(orderFeaturedFirst(items, ['a', 'c']))).toEqual(['a', 'c', 'd', 'b']);
	});

	it("senza featured lascia l'ordine originale", () => {
		expect(ids(orderFeaturedFirst(items, []))).toEqual(['d', 'c', 'b', 'a']);
	});

	it('ignora gli id inesistenti', () => {
		expect(ids(orderFeaturedFirst(items, ['x', 'b']))).toEqual(['b', 'd', 'c', 'a']);
	});

	it('non duplica se un id compare due volte', () => {
		expect(ids(orderFeaturedFirst(items, ['a', 'a']))).toEqual(['a', 'd', 'c', 'b']);
	});

	it('preserva tutti gli item (nessuna perdita)', () => {
		const out = orderFeaturedFirst(items, ['b']);
		expect(out).toHaveLength(items.length);
		expect(new Set(ids(out))).toEqual(new Set(['a', 'b', 'c', 'd']));
	});
});
