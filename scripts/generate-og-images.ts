/**
 * Pre-genera le immagini OG a build time (Node) come PNG statici in static/og/.
 * Riusa la stessa pipeline del vecchio endpoint runtime: OgDataResolver ->
 * generateHtmlLayout -> satori (HTML->SVG) -> sharp (SVG->PNG). Niente piu'
 * generazione runtime sul Worker, niente endpoint, niente superficie injection.
 *
 * Va eseguito con vite-node (per risolvere $lib e import.meta.glob):
 *   vite-node --config vite.og.config.ts scripts/generate-og-images.ts
 */
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import sharp from 'sharp';
import { ContentLoader } from '../src/lib/utils/content';
import { OgDataResolver } from '../src/lib/utils/og/data-resolver';
import { generateHtmlLayout } from '../src/lib/utils/og/html-generator';

const OUT_DIR = join(process.cwd(), 'static/og');
const FONT_DIR = join(process.cwd(), 'node_modules/@fontsource/geist-sans/files');
const WIDTH = 1200;
const HEIGHT = 630;

// satori supporta woff (non woff2): usiamo i .woff di @fontsource/geist-sans,
// offline e deterministici, niente fetch a build time.
function loadFont(weight: number): Buffer {
	return readFileSync(join(FONT_DIR, `geist-sans-latin-${weight}-normal.woff`));
}

interface Job {
	name: string;
	params: Parameters<OgDataResolver['resolveLayout']>[0];
}

async function main(): Promise<void> {
	if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

	const regular = loadFont(400);
	const bold = loadFont(700);
	const fonts = [
		{ name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
		{ name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const }
	];

	const resolver = new OgDataResolver();
	const loader = new ContentLoader();
	const languages = (await loader.loadConfig('languages')).map((l) => l.code);

	const jobs: Job[] = [];

	// Home (una sola, il layout non dipende dalla lingua)
	jobs.push({ name: 'home', params: { type: 'home', lang: languages[0] } });

	// Listing: una per sezione e lingua
	for (const lang of languages) {
		for (const section of ['projects', 'blog'] as const) {
			jobs.push({ name: `listing-${section}-${lang}`, params: { type: 'listing', section, lang } });
		}
	}

	// Detail progetti: una per traduzione disponibile
	const projects = await loader.loadProjects();
	for (const p of projects) {
		for (const lang of Object.keys(p.translations)) {
			const t = p.translations[lang];
			jobs.push({
				name: `detail-projects-${p.meta.id}-${lang}`,
				params: {
					type: 'detail',
					section: 'projects',
					lang,
					title: t.title,
					excerpt: t.excerpt,
					imageKey: p.meta.og_image_key
				}
			});
		}
	}

	// Detail articoli
	const articles = await loader.loadArticles();
	for (const a of articles) {
		for (const lang of Object.keys(a.translations)) {
			const t = a.translations[lang];
			jobs.push({
				name: `detail-blog-${a.meta.id}-${lang}`,
				params: {
					type: 'detail',
					section: 'blog',
					lang,
					title: t.title,
					excerpt: t.excerpt,
					imageKey: a.meta.og_image_key
				}
			});
		}
	}

	let count = 0;
	for (const job of jobs) {
		const config = await resolver.resolveLayout(job.params);
		const markup = html(generateHtmlLayout(config));
		// satori-html produce un nodo compatibile con satori
		const svg = await satori(markup as Parameters<typeof satori>[0], {
			width: WIDTH,
			height: HEIGHT,
			fonts
		});
		// resvg rasterizza l'SVG di satori (gestisce i data-URI annidati meglio di librsvg)
		const rendered = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
		// sharp ricomprime in PNG quantizzato: ~150KB invece di ~930KB, testo nitido
		await sharp(rendered)
			.png({ palette: true, quality: 90, effort: 10 })
			.toFile(join(OUT_DIR, `${job.name}.png`));
		count++;
	}

	console.log(`Generated ${count} OG images in static/og/`);
}

main().catch((error) => {
	console.error('OG generation failed:', error);
	process.exit(1);
});
