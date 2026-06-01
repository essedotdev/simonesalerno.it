import { ContentLoader } from '$lib/utils/content';
import { orderFeaturedFirst } from '$lib/utils/featured';
import type { PageServerLoad } from './$types';

// La home mostra una vetrina curata: i progetti featured (config/featured.json,
// nell'ordine dato) davanti, poi i piu recenti a riempire. Il cap a 6 e applicato
// a valle da ProjectsSection (responsivo). La listing /[lang]/[route] non passa
// di qui: resta neutra, ordinata per data e governata dai filtri.
export const load: PageServerLoad = async ({ parent }) => {
	const { projects } = await parent();
	const featured = await new ContentLoader().loadConfig('featured');
	return { projects: orderFeaturedFirst(projects, featured.projects) };
};
