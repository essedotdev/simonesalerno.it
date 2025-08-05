# Piano di Implementazione: OG Images Statiche a Build Time

## 📋 Panoramica

Implementazione di un sistema che genera immagini OG statiche durante il build process, ottimizzando performance e riducendo complexity runtime.

### Obiettivi

- ✅ Generazione OG images statiche a build time
- ✅ Ottimizzazione immagini con Sharp
- ✅ Dev mode leggero (file diretti)
- ✅ Production mode ottimizzato (PNG statiche)
- ✅ Rimozione sistema base64 pesante
- ✅ Compatibilità Cloudflare Pages

## 🔄 Workflow Finale

### Dev Mode (`npm run dev`)

```
og-preview → HTML con immagini dirette → Preview browser
URL: /src/lib/assets/images/projects/doppia-os/featured.jpg
```

### Production Mode (`npm run build`)

```
1. vite build → genera bundle standard
2. generate-og-static → Sharp + Puppeteer → PNG statiche
3. Deploy → layout usa /og-images/page-slug.png
```

## 📁 Struttura Files

### Nuovi File

```
scripts/
├── generate-og-static.ts          (nuovo - generatore principale)
└── utils/
    ├── og-static-generator.ts      (nuovo - logica core)
    ├── puppeteer-renderer.ts       (nuovo - HTML → PNG)
    └── sharp-optimizer.ts          (nuovo - ottimizzazione immagini)

static/
└── og-images/                      (nuovo - immagini generate)
    ├── home-it.png
    ├── home-en.png
    ├── projects-it.png
    ├── projects-en.png
    ├── blog-it.png
    ├── blog-en.png
    ├── doppia-os-it.png
    ├── doppia-os-en.png
    └── ...

docs/
└── static-og-images-implementation-plan.md  (questo file)
```

### File da Modificare

```
package.json                        (script build)
src/routes/+layout.svelte          (meta og:image)
src/lib/utils/og-shared.ts         (dev mode URLs)
```

### File da Rimuovere

```
scripts/generate-image-assets.ts   (sostituito)
src/lib/assets/image-assets.ts     (7.1MB - non più necessario)
```

## 🛠️ Implementazione per Step

### STEP 1: Installazione Dipendenze

```bash
pnpm add -D sharp puppeteer @types/sharp @types/puppeteer
```

**File da modificare:** `package.json`

### STEP 2: Creazione Utility Sharp

**File:** `scripts/utils/sharp-optimizer.ts`

```typescript
import sharp from 'sharp';
import { readFile } from 'fs/promises';

export interface OptimizedImage {
	buffer: Buffer;
	base64: string;
	size: number;
}

export class SharpOptimizer {
	/**
	 * Ottimizza immagine per OG (800x600, qualità 80)
	 */
	static async optimizeForOg(inputPath: string): Promise<OptimizedImage> {
		const buffer = await sharp(inputPath)
			.resize(800, 600, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({
				quality: 80,
				progressive: true
			})
			.toBuffer();

		return {
			buffer,
			base64: `data:image/jpeg;base64,${buffer.toString('base64')}`,
			size: buffer.length
		};
	}

	/**
	 * Ottimizza logo per OG (120x120)
	 */
	static async optimizeLogo(inputPath: string): Promise<OptimizedImage> {
		const buffer = await sharp(inputPath)
			.resize(120, 120, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.png({
				quality: 90,
				compressionLevel: 9
			})
			.toBuffer();

		return {
			buffer,
			base64: `data:image/png;base64,${buffer.toString('base64')}`,
			size: buffer.length
		};
	}

	/**
	 * Ottimizza noise texture (1200x630, qualità bassa)
	 */
	static async optimizeNoise(inputPath: string): Promise<OptimizedImage> {
		const buffer = await sharp(inputPath)
			.resize(1200, 630, {
				fit: 'cover'
			})
			.jpeg({
				quality: 40, // Bassa qualità per texture
				progressive: true
			})
			.toBuffer();

		return {
			buffer,
			base64: `data:image/jpeg;base64,${buffer.toString('base64')}`,
			size: buffer.length
		};
	}
}
```

### STEP 3: Creazione Puppeteer Renderer

**File:** `scripts/utils/puppeteer-renderer.ts`

```typescript
import puppeteer, { Browser, Page } from 'puppeteer';

export class PuppeteerRenderer {
	private browser: Browser | null = null;
	private page: Page | null = null;

	async init(): Promise<void> {
		this.browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
		});

		this.page = await this.browser.newPage();
		await this.page.setViewport({ width: 1200, height: 630 });
	}

	async renderHtmlToPng(html: string): Promise<Buffer> {
		if (!this.page) {
			throw new Error('Puppeteer not initialized');
		}

		await this.page.setContent(html, {
			waitUntil: 'networkidle0',
			timeout: 30000
		});

		return await this.page.screenshot({
			type: 'png',
			width: 1200,
			height: 630,
			omitBackground: false
		});
	}

	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
		}
	}
}
```

### STEP 4: Core OG Static Generator

**File:** `scripts/utils/og-static-generator.ts`

```typescript
import { ContentLoader } from '../../src/lib/utils/content.js';
import { OgDataResolver } from '../../src/lib/utils/og-data-resolver.js';
import { generateHtmlLayout } from '../../src/lib/utils/og-html-generator.js';
import { parseOgParams } from '../../src/lib/utils/og-shared.js';
import { SharpOptimizer } from './sharp-optimizer.js';
import { PuppeteerRenderer } from './puppeteer-renderer.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export interface OgPageConfig {
	slug: string;
	type: 'home' | 'listing' | 'detail';
	section?: 'projects' | 'blog';
	title?: string;
	excerpt?: string;
	imageKey?: string;
	lang: string;
}

export class OgStaticGenerator {
	private contentLoader: ContentLoader;
	private resolver: OgDataResolver;
	private renderer: PuppeteerRenderer;
	private optimizedAssets: Map<string, string> = new Map();

	constructor() {
		this.contentLoader = new ContentLoader();
		this.resolver = new OgDataResolver();
		this.renderer = new PuppeteerRenderer();
	}

	async init(): Promise<void> {
		await this.renderer.init();
		await this.preOptimizeCommonAssets();
	}

	private async preOptimizeCommonAssets(): Promise<void> {
		console.log('🔧 Ottimizzando asset comuni...');

		// Logo
		const logo = await SharpOptimizer.optimizeLogo('static/logo/logo.png');
		this.optimizedAssets.set('logo', logo.base64);
		console.log(`  ✅ Logo: ${(logo.size / 1024).toFixed(1)}KB`);

		// Noise
		const noise = await SharpOptimizer.optimizeNoise('static/noise.png');
		this.optimizedAssets.set('noise', noise.base64);
		console.log(`  ✅ Noise: ${(noise.size / 1024).toFixed(1)}KB`);
	}

	async generateAllOgImages(): Promise<void> {
		const pages = await this.getAllPagesConfig();

		console.log(`🎨 Generando ${pages.length} OG images...`);

		for (const page of pages) {
			await this.generateSingleOgImage(page);
		}

		console.log('✨ Generazione completata!');
	}

	private async getAllPagesConfig(): Promise<OgPageConfig[]> {
		const configs: OgPageConfig[] = [];
		const languages = await this.contentLoader.loadConfig('languages');
		const navigation = await this.contentLoader.loadConfig('navigation');
		const projects = await this.contentLoader.loadProjects();
		const articles = await this.contentLoader.loadArticles();

		for (const lang of languages) {
			const langCode = lang.code;

			// Home pages
			configs.push({
				slug: `home-${langCode}`,
				type: 'home',
				lang: langCode
			});

			// Listing pages
			if (navigation[langCode]?.projects) {
				configs.push({
					slug: `projects-${langCode}`,
					type: 'listing',
					section: 'projects',
					lang: langCode
				});
			}

			if (navigation[langCode]?.articles) {
				configs.push({
					slug: `blog-${langCode}`,
					type: 'listing',
					section: 'blog',
					lang: langCode
				});
			}

			// Project details
			for (const project of projects) {
				const translation = project.translations[langCode];
				if (translation && translation.slug) {
					configs.push({
						slug: `${translation.slug}-${langCode}`,
						type: 'detail',
						section: 'projects',
						title: translation.title,
						excerpt: translation.description,
						imageKey: project.meta.og_image_key,
						lang: langCode
					});
				}
			}

			// Article details
			for (const article of articles) {
				const translation = article.translations[langCode];
				if (translation && translation.slug) {
					configs.push({
						slug: `${translation.slug}-${langCode}`,
						type: 'detail',
						section: 'blog',
						title: translation.title,
						excerpt: translation.excerpt,
						imageKey: article.meta.og_image_key,
						lang: langCode
					});
				}
			}
		}

		return configs;
	}

	private async generateSingleOgImage(config: OgPageConfig): Promise<void> {
		// 1. Prepara parametri OG
		const params = {
			type: config.type,
			section: config.section,
			title: config.title,
			excerpt: config.excerpt,
			imageKey: config.imageKey,
			lang: config.lang
		};

		// 2. Ottimizza immagine content se presente
		let contentImage: string | undefined;
		if (config.imageKey) {
			contentImage = await this.optimizeContentImage(config.imageKey);
		}

		// 3. Risolvi layout config
		const layoutConfig = await this.resolver.resolveLayout(params);

		// 4. Override immagini con versioni ottimizzate
		const optimizedLayoutConfig = {
			...layoutConfig,
			coverImage: contentImage,
			logoImage: this.optimizedAssets.get('logo'),
			noiseImage: this.optimizedAssets.get('noise')
		};

		// 5. Genera HTML
		const html = generateHtmlLayout(optimizedLayoutConfig);

		// 6. Render to PNG
		const pngBuffer = await this.renderer.renderHtmlToPng(html);

		// 7. Salva file
		const outputPath = join('static/og-images', `${config.slug}.png`);
		await writeFile(outputPath, pngBuffer);

		console.log(`  ✅ ${config.slug}.png (${(pngBuffer.length / 1024).toFixed(1)}KB)`);
	}

	private async optimizeContentImage(imageKey: string): Promise<string> {
		// Cache per evitare ri-ottimizzazione
		if (this.optimizedAssets.has(imageKey)) {
			return this.optimizedAssets.get(imageKey)!;
		}

		// Ricostruisci path originale da imageKey
		const imagePath = this.reconstructImagePath(imageKey);

		if (!imagePath) {
			console.warn(`  ⚠️ Immagine non trovata per key: ${imageKey}`);
			return '';
		}

		try {
			const optimized = await SharpOptimizer.optimizeForOg(imagePath);
			this.optimizedAssets.set(imageKey, optimized.base64);

			console.log(`  🖼️ ${imageKey}: ${(optimized.size / 1024).toFixed(1)}KB`);
			return optimized.base64;
		} catch (error) {
			console.error(`  ❌ Errore ottimizzazione ${imageKey}:`, error);
			return '';
		}
	}

	private reconstructImagePath(imageKey: string): string | null {
		// Logica inversa del generate-image-assets.ts attuale
		// ilMioNuovoLaboratorioFeatured → src/lib/assets/images/articles/il-mio-nuovo-laboratorio/featured.jpg

		const patterns = [
			// Articles
			{
				regex: /^(.+)Featured$/,
				template: (match: string) =>
					`src/lib/assets/images/articles/${this.kebabCase(match)}/featured.jpg`
			},
			{
				regex: /^(.+)Robots$/,
				template: (match: string) =>
					`src/lib/assets/images/articles/${this.kebabCase(match)}/robots.jpg`
			},
			// Projects
			{
				regex: /^(.+)Featured$/,
				template: (match: string) =>
					`src/lib/assets/images/projects/${this.kebabCase(match)}/featured.jpg`
			}
		];

		for (const pattern of patterns) {
			const match = imageKey.match(pattern.regex);
			if (match) {
				const baseName = match[1];
				const path = pattern.template(baseName);

				// Verifica esistenza file
				try {
					require('fs').accessSync(path);
					return path;
				} catch {
					continue;
				}
			}
		}

		return null;
	}

	private kebabCase(str: string): string {
		return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}

	async close(): Promise<void> {
		await this.renderer.close();
	}
}
```

### STEP 5: Script Principale

**File:** `scripts/generate-og-static.ts`

```typescript
#!/usr/bin/env tsx

import { OgStaticGenerator } from './utils/og-static-generator.js';
import { mkdir } from 'fs/promises';

async function main(): Promise<void> {
	console.log('🚀 Generazione OG Images Statiche\n');

	try {
		// Crea directory output
		await mkdir('static/og-images', { recursive: true });

		// Inizializza generator
		const generator = new OgStaticGenerator();
		await generator.init();

		// Genera tutte le immagini
		await generator.generateAllOgImages();

		// Cleanup
		await generator.close();

		console.log('\n✨ Generazione completata con successo!');
	} catch (error) {
		console.error('\n❌ Errore durante la generazione:', error);
		process.exit(1);
	}
}

main();
```

### STEP 6: Modifica Package.json

**File:** `package.json`

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build && pnpm generate-og-static",
		"generate-og-static": "tsx scripts/generate-og-static.ts",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write ."
	}
}
```

### STEP 7: Modifica og-shared.ts per Dev Mode

**File:** `src/lib/utils/og-shared.ts`

```typescript
import { dev } from '$app/environment';

export function getDisplayImage(
	imageKey?: string,
	title?: string,
	section?: string
): string | undefined {
	// Dev mode: usa immagini dirette per preview veloce
	if (dev && imageKey) {
		const imagePath = reconstructImagePath(imageKey);
		if (imagePath) {
			return `/${imagePath}`;
		}
	}

	// Production: le immagini sono già integrate nell'HTML
	// Questo verrà chiamato solo per og-preview in dev
	if (title && section && (section === 'projects' || section === 'blog')) {
		return createPlaceholder(title, section);
	}

	return undefined;
}

function reconstructImagePath(imageKey: string): string | null {
	// Stesso logic del generator statico
	// ...
}

// Resto del file rimane uguale...
```

### STEP 8: Modifica Layout per OG Statiche

**File:** `src/routes/+layout.svelte`

```svelte
<script lang="ts">
	// ... existing code ...

	// OG image statica basata sulla pagina corrente
	let ogImageUrl = $derived.by(() => {
		const currentRoute = page.route.id;
		const params = page.params;
		const lang = params.page || 'it';

		// Home page
		if (currentRoute === '/[page=lang]') {
			return `${page.url.origin}/og-images/home-${lang}.png`;
		}

		// Listing pages
		if (currentRoute === '/[page=lang]/[route=route]' && params.page && params.route) {
			const routeType = getRouteType(params.route, params.page);
			if (routeType === 'projects') {
				return `${page.url.origin}/og-images/projects-${lang}.png`;
			} else if (routeType === 'blog') {
				return `${page.url.origin}/og-images/blog-${lang}.png`;
			}
		}

		// Detail pages
		if (currentRoute === '/[page=lang]/[route=route]/[sub]' && params.sub) {
			return `${page.url.origin}/og-images/${params.sub}-${lang}.png`;
		}

		// Fallback
		return `${page.url.origin}/og-images/home-${lang}.png`;
	});
</script>

<!-- Meta tags rimangono uguali, solo ogImageUrl cambia -->
```

## 🗑️ Cleanup: Rimozione Codice Obsoleto

### File da Rimuovere Completamente

1. **`scripts/generate-image-assets.ts`**
   - Sostituito da `generate-og-static.ts`

2. **`src/lib/assets/image-assets.ts`** (7.1MB!)
   - Non più necessario

### Dipendenze da Rimuovere

```bash
# Se non usate altrove
pnpm remove workers-og  # (già rimosso)
```

### Modifica script nel package.json

```json
{
	"scripts": {
		// ❌ Rimuovi questa riga
		"generate-images": "tsx scripts/generate-image-assets.ts"
	}
}
```

## 📊 Benefici Attesi

### Performance

- **Bundle size**: -7.1MB (image-assets.ts rimosso)
- **OG endpoint**: da 7.6MB a ~50KB
- **Runtime**: zero processing, solo serving file statici
- **CDN**: perfect caching delle PNG statiche

### Developer Experience

- **Dev mode**: preview veloce con file diretti
- **Build time**: +30s per generazione immagini
- **Maintenance**: zero dependency su base64 runtime

### Production

- **Cloudflare Pages**: perfect compatibility
- **SEO**: immagini OG ottimizzate e veloci
- **Caching**: infinite su CDN Cloudflare

## 🧪 Testing Plan

### Dev Mode Testing

```bash
npm run dev
# Visita http://localhost:5173/api/og-preview
# Verifica che le immagini si caricano correttamente
```

### Build Testing

```bash
npm run build
# Verifica generazione in static/og-images/
# Controlla dimensioni files generate
# Test su Cloudflare Pages deploy
```

### Validation

- [ ] OG preview funziona in dev
- [ ] Build genera tutte le PNG statiche
- [ ] Layout usa URL corretti
- [ ] Immagini si caricano su production
- [ ] Bundle size ridotto significativamente

## 📅 Timeline Stimata

- **STEP 1-2**: 1 ora (setup + utility Sharp)
- **STEP 3-4**: 2 ore (Puppeteer + core generator)
- **STEP 5-6**: 30 min (script principale + package.json)
- **STEP 7-8**: 1 ora (modifiche og-shared + layout)
- **Cleanup**: 30 min (rimozione vecchi file)
- **Testing**: 1 ora (validazione completa)

**Totale stimato: ~6 ore**

## 🚀 Deploy Strategy

1. **Development branch**: implementa tutte le modifiche
2. **Testing**: valida in environment di sviluppo
3. **Staging deploy**: test su Cloudflare Pages staging
4. **Production**: deploy finale con cleanup completo

---

_Piano creato il: 5 Agosto 2025_
_Versione: 1.0_
