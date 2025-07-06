# Piano di Refactoring: Migrazione da Directus a Sistema Locale

## Obiettivi

1. **Rimuovere completamente Directus** dal progetto
2. **Sistema di traduzioni locale** basato su file JSON
3. **Mantenere routing dinamico** con parametri SvelteKit
4. **Preservare funzionalità** di cambio lingua con slug tradotti
5. **Semplificare l'architettura** eliminando dipendenze esterne

## ⚠️ CORREZIONI CRITICHE IDENTIFICATE

### 1. Dipendenze dei Params Routes

- I file `src/params/lang.ts` e `src/params/route.ts` DEVONO essere aggiornati
- Attualmente dipendono dall'oggetto `pages` hardcodato che sarà rimosso
- Necessario caricamento dinamico da `ContentLoader`

### 2. LanguageSelector Data Flow

- Il componente deve ricevere dati via props dal layout, non da store globali
- Manca la gestione del caricamento dei contenuti per la costruzione URL

### 3. Hooks Server Dinamici

- Gli hooks devono caricare `navigation.json` dinamicamente
- Rimuovere dipendenza da oggetto `pages` hardcodato

### 4. Helper per Immagini Locali

- Necessario helper per mappare path immagini locali
- Aggiornamento completo di tutti i componenti che usano immagini Directus

### 5. Migrazione Store Svelte

- Chiarire migrazione da store globali a context/props
- Mantenere compatibilità durante transizione

## Struttura File Proposta (RIVISTA)

```
src/lib/content/
├── config/
│   ├── languages.json           # Lista lingue disponibili
│   └── navigation.json          # Routing per lingua
├── global/
│   ├── en.json                  # Impostazioni globali (SEO + interfaccia)
│   └── it.json
├── pages/
│   ├── welcome/
│   │   ├── en.json
│   │   └── it.json
│   ├── about/
│   │   ├── en.json
│   │   └── it.json
│   └── contact/
│       ├── en.json
│       └── it.json
├── projects/
│   ├── project-1/               # Cartella per ogni progetto
│   │   ├── en.json             # Traduzione inglese
│   │   ├── it.json             # Traduzione italiana
│   │   └── meta.json           # Metadata comuni (images, link, published)
│   └── project-2/
│       ├── en.json
│       ├── it.json
│       └── meta.json
└── articles/
    ├── article-1/               # Cartella per ogni articolo
    │   ├── en.json
    │   ├── it.json
    │   └── meta.json
    └── article-2/
        ├── en.json
        ├── it.json
        └── meta.json
```

## Struttura Immagini Locale

```
static/
├── images/
│   ├── projects/
│   │   ├── portfolio-website/
│   │   │   ├── screenshot-1.jpg
│   │   │   ├── screenshot-2.jpg
│   │   │   └── thumbnail.jpg
│   │   ├── e-commerce-platform/
│   │   │   ├── homepage.jpg
│   │   │   ├── product-page.jpg
│   │   │   └── thumbnail.jpg
│   │   └── task-manager-app/
│   │       ├── dashboard.jpg
│   │       └── thumbnail.jpg
│   ├── articles/
│   │   ├── article-1/
│   │   │   ├── featured.jpg
│   │   │   ├── image-1.jpg
│   │   │   └── image-2.jpg
│   │   └── article-2/
│   │       └── featured.jpg
│   ├── global/
│   │   ├── logo.png
│   │   ├── favicon.ico
│   │   └── og-image.jpg
│   └── ui/
│       ├── placeholder.svg
│       └── icons/
└── placeholder.svg              # Esistente per fallback
```

### Razionale dei cambiamenti:

1. **Separazione logica**: `config/` per configurazione pura, `global/` per contenuto globale
2. **Navigation in config**: Il routing è configurazione, non contenuto
3. **Global semplificato**: Solo SEO e interfaccia, non routing
4. **Immagini locali**: Organizzate per tipo di contenuto con path relativi

## Struttura Dati

### Config Files

**config/languages.json**:

```json
[
	{
		"code": "en",
		"name": "English"
	},
	{
		"code": "it",
		"name": "Italiano"
	}
]
```

_Nota: Semplificato per rispecchiare la struttura attuale dei dati_

**config/navigation.json**:

```json
{
	"en": {
		"projects": "projects",
		"about": "about",
		"articles": "blog"
	},
	"it": {
		"projects": "progetti",
		"about": "informazioni",
		"articles": "blog"
	}
}
```

### Global Content

**global/en.json**:

```json
{
	"title": "Web & software solutions",
	"description": "Hi! I'm Simone, a passionate tech enthusiast and creative problem solver. This is my portfolio, where you can find something about me and my projects. Let's connect!",
	"keywords": ["developer", "designer", "portfolio"],
	"interface": [
		{ "name": "readMore", "value": "Read More" },
		{ "name": "viewProject", "value": "View Project" },
		{ "name": "backToHome", "value": "Back to Home" },
		{ "name": "loading", "value": "Loading..." }
	]
}
```

**global/it.json**:

```json
{
	"title": "Soluzioni web & software",
	"description": "Ciao! Sono Simone, sviluppatore appassionato di tecnologia e creativo problem-solver. Questo è il mio portfolio, dove puoi trovare qualcosa su di me e sui miei progetti. Connettiamoci!",
	"keywords": ["sviluppatore", "designer", "portfolio"],
	"interface": [
		{ "name": "readMore", "value": "Leggi di più" },
		{ "name": "viewProject", "value": "Vedi progetto" },
		{ "name": "backToHome", "value": "Torna alla home" },
		{ "name": "loading", "value": "Caricamento..." }
	]
}
```

### Project Structure

**projects/my-portfolio/en.json**:

```json
{
	"slug": "my-portfolio",
	"title": "My Portfolio Website",
	"description": "A modern portfolio built with SvelteKit",
	"body": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "This is the content of my project..."
				}
			}
		]
	},
	"image_captions": ["Homepage", "About page"],
	"tags": ["SvelteKit", "TypeScript", "Tailwind"]
}
```

**projects/my-portfolio/it.json**:

```json
{
	"slug": "il-mio-portfolio",
	"title": "Il Mio Sito Portfolio",
	"description": "Un portfolio moderno costruito con SvelteKit",
	"body": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Questo è il contenuto del mio progetto..."
				}
			}
		]
	},
	"image_captions": ["Homepage", "Pagina Chi Sono"],
	"tags": ["SvelteKit", "TypeScript", "Tailwind"]
}
```

**projects/my-portfolio/meta.json**:

```json
{
	"id": "my-portfolio",
	"images": [
		"images/projects/my-portfolio/screenshot-1.jpg",
		"images/projects/my-portfolio/screenshot-2.jpg"
	],
	"thumbnail": "images/projects/my-portfolio/thumbnail.jpg",
	"link": "https://simonesalerno.it",
	"published": true,
	"created_date": "2024-01-15",
	"updated_date": "2024-02-01"
}
```

### Article Structure

**articles/my-first-article/en.json**:

```json
{
	"slug": "my-first-article",
	"title": "My First Article",
	"excerpt": "This is a brief excerpt of my article",
	"content": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "This is the content of my article..."
				}
			}
		]
	},
	"meta_description": "SEO description for this article",
	"tags": ["technology", "development"]
}
```

**articles/my-first-article/it.json**:

```json
{
	"slug": "il-mio-primo-articolo",
	"title": "Il Mio Primo Articolo",
	"excerpt": "Questo è un breve estratto del mio articolo",
	"content": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Questo è il contenuto del mio articolo..."
				}
			}
		]
	},
	"meta_description": "Descrizione SEO per questo articolo",
	"tags": ["tecnologia", "sviluppo"]
}
```

**articles/my-first-article/meta.json**:

```json
{
	"id": "my-first-article",
	"featured_image": "images/articles/my-first-article/featured.jpg",
	"images": [
		"images/articles/my-first-article/image-1.jpg",
		"images/articles/my-first-article/image-2.jpg"
	],
	"published": true,
	"published_date": "2024-01-15",
	"created_date": "2024-01-15",
	"updated_date": "2024-02-01"
}
```

## Implementazione

## IMPLEMENTAZIONI CORRETTE

### Fase 0: Aggiornamento Params Routes (CRITICO)

**src/params/lang.ts**:

```typescript
import { ContentLoader } from '$lib/utils/content';

let cachedLanguages: string[] | null = null;

ogge// ⚠️ IMPORTANTE: Questo viene eseguito durante il BUILD PROCESS.
// Il build fallirà se 'languages.json' non è accessibile, garantendo
// che il sito non venga mai deployato con una configurazione invalida.
export async function match(param: string) {
	if (!cachedLanguages) {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		cachedLanguages = languages.map((l) => l.code);
	}
	return cachedLanguages.includes(param);
}
```

**src/params/route.ts**:

```typescript
import { ContentLoader } from '$lib/utils/content';

let cachedRoutes: string[] | null = null;

// ⚠️ IMPORTANTE: Questo viene eseguito durante il BUILD PROCESS.
// Il build fallirà se 'navigation.json' non è accessibile, garantendo
// l'integrità della configurazione di routing.
export async function match(param: string) {
	if (!cachedRoutes) {
		const loader = new ContentLoader();
		const navigation = await loader.loadConfig('navigation');
		cachedRoutes = Object.values(navigation).flatMap((lang) =>
			Object.values(lang as Record<string, string>)
		);
	}
	return cachedRoutes.includes(param);
}
```

### Fase 1: Creazione Content Loader e Helper Utilities

**src/lib/utils/content.ts**:

```typescript
interface ContentItem {
	translations: Record<string, any>;
	meta: any;
}

// Helper per gestione immagini locali
export function getImagePath(type: 'project' | 'article', id: string, filename: string): string {
	return `/images/${type}s/${id}/${filename}`;
}

export function getThumbnailPath(type: 'project' | 'article', id: string): string {
	return `/images/${type}s/${id}/thumbnail.jpg`;
}

export function getFeaturedImagePath(type: 'article', id: string): string {
	return `/images/${type}s/${id}/featured.jpg`;
}

export class ContentLoader {
	private cache: Map<string, any> = new Map();

	async loadConfig(file: string) {
		const cacheKey = `config-${file}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const module = await import(`../content/config/${file}.json`);
			const data = module.default;
			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Error loading config ${file}:`, error);
			throw new Error(`Config file ${file} not found`);
		}
	}

	async loadGlobal(lang: string) {
		const cacheKey = `global-${lang}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const module = await import(`../content/global/${lang}.json`);
			const data = module.default;
			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Error loading global content for ${lang}:`, error);
			throw new Error(`Global content for ${lang} not found`);
		}
	}

	async loadPage(page: string, lang: string) {
		const cacheKey = `page-${page}-${lang}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const module = await import(`../content/pages/${page}/${lang}.json`);
			const data = module.default;
			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Error loading page ${page} for ${lang}:`, error);
			throw new Error(`Page ${page} for ${lang} not found`);
		}
	}

	async loadProjects(lang?: string) {
		const cacheKey = lang ? `projects-${lang}` : 'projects-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			// Carica tutti i meta.json dei progetti
			const metaFiles = import.meta.glob('../content/projects/*/meta.json', { eager: true });
			const projects: ContentItem[] = [];

			for (const [path, module] of Object.entries(metaFiles)) {
				const projectId = path.split('/').slice(-2, -1)[0];
				const meta = (module as any).default;

				// Carica le traduzioni
				const translations: Record<string, any> = {};

				if (lang) {
					// Carica solo la lingua richiesta
					try {
						const translationModule = await import(`../content/projects/${projectId}/${lang}.json`);
						translations[lang] = translationModule.default;
					} catch (error) {
						// Traduzione non disponibile per questa lingua
						continue;
					}
				} else {
					// Carica tutte le lingue disponibili
					const languages = await this.loadConfig('languages');
					for (const language of languages) {
						try {
							const translationModule = await import(
								`../content/projects/${projectId}/${language.code}.json`
							);
							translations[language.code] = translationModule.default;
						} catch (error) {
							// Traduzione non disponibile per questa lingua
							continue;
						}
					}
				}

				if (Object.keys(translations).length > 0 && meta.published) {
					projects.push({ translations, meta });
				}
			}

			this.cache.set(cacheKey, projects);
			return projects;
		} catch (error) {
			console.error('Error loading projects:', error);
			return [];
		}
	}

	async loadArticles(lang?: string) {
		const cacheKey = lang ? `articles-${lang}` : 'articles-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			// Carica tutti i meta.json degli articoli
			const metaFiles = import.meta.glob('../content/articles/*/meta.json', { eager: true });
			const articles: ContentItem[] = [];

			for (const [path, module] of Object.entries(metaFiles)) {
				const articleId = path.split('/').slice(-2, -1)[0];
				const meta = (module as any).default;

				// Carica le traduzioni
				const translations: Record<string, any> = {};

				if (lang) {
					// Carica solo la lingua richiesta
					try {
						const translationModule = await import(`../content/articles/${articleId}/${lang}.json`);
						translations[lang] = translationModule.default;
					} catch (error) {
						// Traduzione non disponibile per questa lingua
						continue;
					}
				} else {
					// Carica tutte le lingue disponibili
					const languages = await this.loadConfig('languages');
					for (const language of languages) {
						try {
							const translationModule = await import(
								`../content/articles/${articleId}/${language.code}.json`
							);
							translations[language.code] = translationModule.default;
						} catch (error) {
							// Traduzione non disponibile per questa lingua
							continue;
						}
					}
				}

				if (Object.keys(translations).length > 0 && meta.published) {
					articles.push({ translations, meta });
				}
			}

			// Ordina per data di pubblicazione
			articles.sort(
				(a, b) =>
					new Date(b.meta.published_date).getTime() - new Date(a.meta.published_date).getTime()
			);

			this.cache.set(cacheKey, articles);
			return articles;
		} catch (error) {
			console.error('Error loading articles:', error);
			return [];
		}
	}

	async getAvailableLanguages(contentType: 'project' | 'article', id: string): Promise<string[]> {
		try {
			const languages = await this.loadConfig('languages');
			const availableLanguages: string[] = [];

			for (const language of languages) {
				try {
					await import(`../content/${contentType}s/${id}/${language.code}.json`);
					availableLanguages.push(language.code);
				} catch (error) {
					// Traduzione non disponibile
				}
			}

			return availableLanguages;
		} catch (error) {
			console.error(`Error getting available languages for ${contentType} ${id}:`, error);
			return [];
		}
	}

	async findContentBySlug(slug: string, lang: string, type: 'project' | 'article') {
		const collection = type === 'project' ? await this.loadProjects() : await this.loadArticles();

		// CORREZIONE CRITICA: Cerca nella lingua corrente, non in translations[0]
		return collection.find((item) => item.translations[lang]?.slug === slug);
	}
}
```

### Fase 2: Aggiornamento Route Handlers

**src/routes/+layout.server.ts**:

```typescript
import { ContentLoader } from '$lib/utils/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const loader = new ContentLoader();
	const pathParts = url.pathname.split('/');
	const lang = pathParts[1] || 'en';

	// Verifica che la lingua sia valida
	const languages = await loader.loadConfig('languages');
	const validLang = languages.find((l) => l.code === lang)?.code || 'en';

	// Carica configurazione
	const navigation = await loader.loadConfig('navigation');

	// Carica contenuti
	const global = await loader.loadGlobal(validLang);
	const welcome = await loader.loadPage('welcome', validLang);
	const about = await loader.loadPage('about', validLang);
	const contact = await loader.loadPage('contact', validLang);

	// Carica collezioni con tutte le traduzioni per il language switcher
	const projects = await loader.loadProjects(); // Tutte le lingue
	const articles = await loader.loadArticles(); // Tutte le lingue

	return {
		selectedLanguage: validLang,
		languages,
		navigation,
		global,
		welcome,
		about,
		contact,
		projects,
		articles
	};
};
```

**src/routes/[page=lang]/[page=route]/[sub]/+page.server.ts**:

```typescript
import { error } from '@sveltejs/kit';
import { ContentLoader } from '$lib/utils/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { page: lang, route, sub: slug } = params;
	const loader = new ContentLoader();
	const parentData = await parent();

	// Determina il tipo di contenuto dalla route
	const routeMap = parentData.navigation[lang];
	if (!routeMap) {
		throw error(404, 'Language not found');
	}

	const isProjectsRoute = route === routeMap.projects;
	const isArticlesRoute = route === routeMap.articles;

	if (!isProjectsRoute && !isArticlesRoute) {
		throw error(404, 'Page not found');
	}

	if (isProjectsRoute) {
		const project = await loader.findContentBySlug(slug, lang, 'project');
		if (!project) {
			throw error(404, 'Project not found');
		}

		return {
			type: 'project',
			content: project,
			currentLang: lang,
			availableLanguages: await loader.getAvailableLanguages('project', project.meta.id)
		};
	}

	if (isArticlesRoute) {
		const article = await loader.findContentBySlug(slug, lang, 'article');
		if (!article) {
			throw error(404, 'Article not found');
		}

		return {
			type: 'article',
			content: article,
			currentLang: lang,
			availableLanguages: await loader.getAvailableLanguages('article', article.meta.id)
		};
	}

	throw error(404, 'Page not found');
};
```

### Fase 3: Aggiornamento Hooks Server

**src/hooks.server.ts**:

```typescript
import { ContentLoader } from '$lib/utils/content';

export async function handle({ event, resolve }) {
	const { pathname, origin } = event.url;
	const pathSegments = pathname.split('/').filter(Boolean);

	try {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');

		// Determina la lingua corrente dalla URL
		let currentLang = languages[0]?.code || 'en'; // Prima lingua disponibile come default
		if (pathSegments.length > 0) {
			const firstSegment = pathSegments[0];
			if (languages.find((l) => l.code === firstSegment)) {
				currentLang = firstSegment;
			}
		}

		// Verifica che la rotta sia una sottorotta della lingua corretta
		if (pathSegments.length >= 2) {
			const [lang, sub] = pathSegments;

			// Controlla se la lingua esiste
			const langExists = languages.find((l) => l.code === lang);
			if (langExists && navigation[lang]) {
				// Controlla se la sottorotta è valida per la lingua specificata
				const validRoutes = Object.values(navigation[lang]);
				if (!validRoutes.includes(sub)) {
					// Trova la lingua corretta per la sottorotta
					const correctLang = Object.keys(navigation).find((key) =>
						Object.values(navigation[key]).includes(sub)
					);

					// Se trova una lingua corretta, reindirizza a quella
					if (correctLang) {
						const remainingSegments = pathSegments.slice(2).join('/');
						const redirectUrl = new URL(`/${correctLang}/${sub}/${remainingSegments}`, origin);
						return Response.redirect(redirectUrl.toString(), 302);
					}
				}
			}
		}

		return await resolve(event, {
			transformPageChunk: ({ html }) => {
				// Usa una regex per sostituire l'attributo lang indipendentemente dal suo valore attuale
				return html.replace(/<html[^>]*lang=["'][^"']*["']/, `<html lang="${currentLang}"`);
			},
			filterSerializedResponseHeaders: (key) => {
				return key.toLowerCase() === 'content-type';
			}
		});
	} catch (error) {
		console.error('Error in hooks.server.ts:', error);
		// Fallback di sicurezza
		return await resolve(event);
	}
}
```

### Fase 3.5: Migrazione Store e Context

**src/lib/utils/index.ts** (aggiornato):

```typescript
import { writable } from 'svelte/store';
import type { Language } from './types';

// Mantieni solo gli store essenziali per la transizione
export const menuStatus = writable(false);

// Gli altri store saranno gradualmente rimossi in favore di props/context
// export const translation = writable<Translation>(); // DA RIMUOVERE
// export const languages = writable<Language[]>(); // DA RIMUOVERE
// export const selectedLanguage = writable<string>(); // DA RIMUOVERE

// Rimuovi anche l'oggetto pages hardcodato
// export const pages: PageMap = { ... }; // DA RIMUOVERE

export function handleAnchorClick(event: MouseEvent) {
	const link = event.currentTarget as HTMLAnchorElement;
	const anchorId = new URL(link.href).hash;

	if (anchorId.startsWith('#')) {
		const id = anchorId.replace('#', '');
		const anchor = document.getElementById(id);

		if (anchor) {
			event.preventDefault();

			window.scrollTo({
				top: anchor.offsetTop - calculateOffset(id),
				behavior: 'smooth'
			});
		}
	}
}

export function calculateOffset(anchorId: string): number {
	const offsets: { [key: string]: number } = {
		partner: 300,
		servizi: 160,
		contatti: 100
	};

	return offsets[anchorId] || 50;
}

// Re-export utilities
export { initializeAnalytics, isAnalyticsReady, trackEvent, trackPageView } from './analytics';
export { ContentLoader, getImagePath, getThumbnailPath, getFeaturedImagePath } from './content';
```

### Fase 4: Aggiornamento Language Selector

**src/lib/components/LanguageSelector.svelte** (completamente riscritto):

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	// Props ricevuti dal layout parent
	export let languages: Array<{ code: string; name: string }> = [];
	export let selectedLanguage: string = 'en';
	export let navigation: Record<string, Record<string, string>> = {};
	export let projects: Array<{ translations: Record<string, any>; meta: any }> = [];
	export let articles: Array<{ translations: Record<string, any>; meta: any }> = [];

	let isOpen = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown(event: Event) {
		const target = event.target as HTMLElement;
		if (target && target.closest('#menu-button') === null) {
			isOpen = false;
		}
	}

	function buildLanguageUrl(targetLang: string): string {
		const currentPath = $page.url.pathname.split('/');
		const currentLang = currentPath[1];
		const route = currentPath[2];
		const slug = currentPath[3];

		if (!route || !slug) {
			// Pagina principale o sezione - mantieni il path
			return `/${targetLang}${currentPath.slice(2).join('/')}`;
		}

		// Trova il tipo di route corrente
		const currentRouteKey = Object.keys(navigation[currentLang] || {}).find(
			(key) => navigation[currentLang][key] === route
		);

		if (!currentRouteKey) {
			// Route non riconosciuta, vai alla homepage
			return `/${targetLang}`;
		}

		const targetRoute = navigation[targetLang]?.[currentRouteKey];
		if (!targetRoute) {
			// Route non disponibile nella lingua target
			return `/${targetLang}`;
		}

		// Trova il contenuto con lo slug corrente
		const collections = currentRouteKey === 'projects' ? projects : articles;
		const content = collections.find((item) => item.translations[currentLang]?.slug === slug);

		if (!content || !content.translations[targetLang]) {
			// Contenuto non disponibile nella lingua target
			// Vai alla sezione principale (es. /en/projects)
			return `/${targetLang}/${targetRoute}`;
		}

		// Contenuto disponibile, vai alla pagina specifica
		const targetSlug = content.translations[targetLang].slug;
		return `/${targetLang}/${targetRoute}/${targetSlug}`;
	}

	onMount(() => {
		document.addEventListener('click', closeDropdown);
		return () => {
			document.removeEventListener('click', closeDropdown);
		};
	});
</script>

<div class="relative inline-block text-left">
	<div>
		<button
			type="button"
			class="flex w-16 cursor-pointer justify-center gap-x-1.5 rounded-md border border-white/5 bg-white/[.02] py-3 text-base backdrop-blur-md"
			id="menu-button"
			aria-expanded={isOpen}
			aria-haspopup="true"
			onclick={toggleDropdown}
		>
			{selectedLanguage.toUpperCase()}
			<svg
				class="-mr-1 mt-[0.15rem] h-5 w-5 text-white/15"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

	{#if isOpen}
		<div
			in:fly={{ y: -10, duration: 100 }}
			out:fade={{ duration: 100 }}
			class="absolute right-0 z-10 mt-1 w-16 origin-top-right rounded-md border border-white/5 bg-white/[.02] text-base backdrop-blur-md"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
			tabindex="-1"
		>
			<div class="py-1" role="none">
				{#each languages as language (language.code)}
					{#if selectedLanguage !== language.code}
						<a
							data-sveltekit-reload
							href={buildLanguageUrl(language.code)}
							class="block px-4 py-2 text-sm hover:bg-white/5"
							role="menuitem"
							onclick={() => (isOpen = false)}
						>
							{language.code.toUpperCase()}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
```

### Fase 5: Aggiornamento Sitemap

**src/routes/sitemap.xml/+server.ts**:

```typescript
import { ContentLoader } from '$lib/utils/content';
import type { RequestHandler } from './$types';

const site = 'https://simonesalerno.it';

export const GET: RequestHandler = async () => {
	try {
		const loader = new ContentLoader();

		// Carica configurazione e contenuti
		const languages = await loader.loadConfig('languages');
		const navigation = await loader.loadConfig('navigation');
		const projects = await loader.loadProjects();
		const articles = await loader.loadArticles();

		const sitemapPages: Array<{
			slug: string;
			lastMod: string;
			priority: number;
			changefreq: string;
			hreflang: string;
			alternates?: Array<{ hreflang: string; href: string }>;
		}> = [];

		// Pagine principali per ogni lingua
		for (const language of languages) {
			const langCode = language.code;

			// Homepage
			sitemapPages.push({
				slug: langCode,
				lastMod: new Date().toISOString().split('T')[0],
				priority: 1.0,
				changefreq: 'monthly',
				hreflang: langCode,
				alternates: languages.map((l) => ({
					hreflang: l.code,
					href: `${site}/${l.code}`
				}))
			});

			// Progetti individuali
			if (navigation[langCode]?.projects) {
				for (const project of projects) {
					const translation = project.translations[langCode];
					if (translation && translation.slug) {
						sitemapPages.push({
							slug: `${langCode}/${navigation[langCode].projects}/${translation.slug}`,
							lastMod:
								project.meta.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0],
							priority: 0.8,
							changefreq: 'monthly',
							hreflang: langCode,
							alternates: languages
								.map((l) => {
									const altTranslation = project.translations[l.code];
									return altTranslation && altTranslation.slug && navigation[l.code]?.projects
										? {
												hreflang: l.code,
												href: `${site}/${l.code}/${navigation[l.code].projects}/${altTranslation.slug}`
											}
										: null;
								})
								.filter(Boolean) as Array<{ hreflang: string; href: string }>
						});
					}
				}
			}

			// Articoli individuali
			if (navigation[langCode]?.articles) {
				for (const article of articles) {
					const translation = article.translations[langCode];
					if (translation && translation.slug) {
						sitemapPages.push({
							slug: `${langCode}/${navigation[langCode].articles}/${translation.slug}`,
							lastMod:
								article.meta.updated_date?.split('T')[0] ||
								article.meta.published_date?.split('T')[0] ||
								new Date().toISOString().split('T')[0],
							priority: 0.6,
							changefreq: 'monthly',
							hreflang: langCode,
							alternates: languages
								.map((l) => {
									const altTranslation = article.translations[l.code];
									return altTranslation && altTranslation.slug && navigation[l.code]?.articles
										? {
												hreflang: l.code,
												href: `${site}/${l.code}/${navigation[l.code].articles}/${altTranslation.slug}`
											}
										: null;
								})
								.filter(Boolean) as Array<{ hreflang: string; href: string }>
						});
					}
				}
			}
		}

		const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/css" href="/sitemap.css"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  ${sitemapPages
		.map(
			(page) => `
  <url>
    <loc>${site}/${page.slug}</loc>
    <lastmod>${page.lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
    ${
			page.alternates
				?.map(
					(alt) => `
    <xhtml:link
      rel="alternate"
      hreflang="${alt.hreflang}"
      href="${alt.href}"
    />`
				)
				.join('') || ''
		}
  </url>`
		)
		.join('')}
</urlset>`;

		const response = new Response(sitemap);
		response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
		response.headers.set('Content-Type', 'application/xml');
		return response;
	} catch (error) {
		console.error('Error generating sitemap:', error);

		// Fallback sitemap
		const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/en</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${site}/it</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

		const response = new Response(fallbackSitemap);
		response.headers.set('Content-Type', 'application/xml');
		return response;
	}
};
```

### Fase 6: Aggiornamento Layout per Props

**src/routes/+layout.svelte** (aggiornato per rimuovere store):

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/style/globals.css';
	import { menuStatus } from '$lib/utils';
	import { initializeAnalytics, isAnalyticsReady, trackPageView } from '$lib/utils/analytics';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	// Fornisce i dati come context invece di store
	setContext('layoutData', data);

	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('overflow-hidden', $menuStatus);
			document.documentElement.classList.toggle('sm:overflow-auto', $menuStatus);
		}
	});

	// Initialize analytics on mount
	$effect(() => {
		if (browser) {
			initializeAnalytics();
		}
	});

	// Track page views on navigation
	$effect(() => {
		if (browser && $page.url && isAnalyticsReady()) {
			trackPageView($page.url.pathname + $page.url.search);
		}
	});
</script>

<svelte:head>
	<meta name="description" content={data.global.description} />
	<meta name="keywords" content={data.global.keywords.join(', ')} />
	<meta name="author" content="Simone Salerno" />
	<title>Simone Salerno • {data.global.title}</title>
</svelte:head>

<div
	class="overflow-x-hidden scroll-smooth bg-zinc-900 bg-[url('/noise.png')] text-white antialiased selection:bg-white/10"
>
	<!-- Passa dati come props ai componenti -->
	<Navbar {data} />
	<FloatingNav {data} />

	{@render children()}

	<Footer {data} />
</div>
```

**Aggiornamento Navbar.svelte per Props:**

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { handleAnchorClick, menuStatus } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import MenuClose from './icons/CloseMenu.svelte';
	import MenuOpen from './icons/OpenMenu.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import Logo from './Logo.svelte';

	// Ricevi dati come props
	export let data: any;

	function handleMenuClick() {
		menuStatus.update((value) => !value);
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l: any) => l.code === $page.url.pathname.split('/')[1])
	);
</script>

<header id="top" class="border-b border-white/5">
	<nav class="flex items-center justify-between px-4 py-8 sm:px-8 lg:px-14">
		<a
			href={$page.url.pathname.split('/')[2]
				? '/' + data.selectedLanguage
				: isLanguageCodeValid
					? '/' + data.selectedLanguage + '#top'
					: '/' + 'en'}
			onclick={handleAnchorClick}
			aria-label="Simone Salerno"
		>
			<Logo />
		</a>

		<div
			class="hidden items-center gap-x-6 text-[1.3rem] md:flex lg:gap-x-7 lg:text-[1.5rem] 2xl:text-[1.7rem]"
		>
			{#each data.global.navigation as route (route.name)}
				<a href={'/' + data.selectedLanguage + route.link} onclick={handleAnchorClick}
					>{route.name}</a
				>
			{/each}

			<div class="2xl:ms-2">
				<LanguageSelector
					languages={data.languages}
					selectedLanguage={data.selectedLanguage}
					navigation={data.navigation}
					projects={data.projects}
					articles={data.articles}
				/>
			</div>
		</div>

		<!-- Menu mobile logic rimane identica -->
		<div class="flex h-[40px] w-[40px] md:hidden">
			{#if $menuStatus}
				<div class="fixed left-7 top-10 z-20" transition:fade={{ duration: 300 }}>
					<LanguageSelector
						languages={data.languages}
						selectedLanguage={data.selectedLanguage}
						navigation={data.navigation}
						projects={data.projects}
						articles={data.articles}
					/>
				</div>

				<button class="fixed z-20" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
					<MenuClose />
				</button>

				<div
					class="fixed left-0 top-0 z-10 flex h-screen w-screen flex-col items-center justify-center bg-black/60 text-2xl backdrop-blur-sm"
					transition:fade={{ duration: 300 }}
				>
					<div class="flex flex-col gap-y-3">
						{#each data.global.navigation as route (route.name)}
							<a
								href={'/' + data.selectedLanguage + route.link}
								onclick={(event) => (handleAnchorClick(event), handleMenuClick())}>{route.name}</a
							>
						{/each}
					</div>
				</div>
			{:else}
				<button class="absolute" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
					<MenuOpen />
				</button>
			{/if}
		</div>
	</nav>
</header>
```

### Fase 7: Aggiornamento Componenti per Immagini

**Aggiornamento ProjectCard.svelte:**

```svelte
<script lang="ts">
	import Image from './Image.svelte';

	let {
		title,
		description,
		thumbnail,
		link,
		slug
	}: {
		title: string;
		description: string;
		thumbnail?: string;
		link: string;
		slug: string;
	} = $props();
</script>

<div
	class="rounded-3xl border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:rotate-1 hover:scale-105"
>
	{#if thumbnail}
		<a href={link}>
			<Image src={thumbnail} alt={title} cssClass="aspect-video rounded-t-3xl object-cover" />
		</a>
	{/if}
	<div class="px-6 py-5">
		<a href={link}>
			<h5 class="mb-2 text-2xl font-medium text-gray-100">
				{title}
			</h5>
		</a>
		<p class="mb-3 text-base text-gray-300 lg:text-xl">
			{description}
		</p>
	</div>
</div>
```

**Aggiornamento ArticleCard.svelte:**

```svelte
<script lang="ts">
	import Image from './Image.svelte';

	let {
		title,
		excerpt,
		featuredImage,
		link,
		publishedDate,
		tags,
		slug
	}: {
		title: string;
		excerpt: string;
		featuredImage?: string;
		link: string;
		publishedDate: string;
		tags: string[];
		slug: string;
	} = $props();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div
	class="rounded-3xl border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:rotate-1 hover:scale-105"
>
	{#if featuredImage}
		<a href={link}>
			<Image src={featuredImage} alt={title} cssClass="aspect-video rounded-t-3xl object-cover" />
		</a>
	{/if}
	<div class="px-6 py-5">
		<div class="mb-3 text-sm text-gray-400">
			{formatDate(publishedDate)}
		</div>
		<a href={link}>
			<h5 class="mb-2 text-2xl font-medium text-gray-100">
				{title}
			</h5>
		</a>
		<p class="mb-3 text-base text-gray-300 lg:text-xl">
			{excerpt}
		</p>
		{#if tags && tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each tags as tag (tag)}
					<span class="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
```

## Esempi di Contenuto Fittizio

### Pagine

**pages/welcome/en.json**:

```json
{
	"title": "Hi, I'm Simone",
	"typewriter": ["Developer", "Designer", "Problem Solver"],
	"description": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Welcome to my portfolio! I'm passionate about creating innovative web solutions."
				}
			}
		]
	}
}
```

**pages/welcome/it.json**:

```json
{
	"title": "Ciao, sono Simone",
	"typewriter": ["Sviluppatore", "Designer", "Problem Solver"],
	"description": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Benvenuto nel mio portfolio! Sono appassionato di creare soluzioni web innovative."
				}
			}
		]
	}
}
```

### Progetti di Esempio

**projects/portfolio-website/en.json**:

```json
{
	"slug": "portfolio-website",
	"title": "Portfolio Website",
	"description": "A modern portfolio built with SvelteKit and Tailwind CSS",
	"body": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "This portfolio showcases my work as a full-stack developer. Built with modern technologies like SvelteKit, TypeScript, and Tailwind CSS."
				}
			}
		]
	},
	"image_captions": ["Homepage", "Projects section", "About page"],
	"tags": ["SvelteKit", "TypeScript", "Tailwind CSS"]
}
```

**projects/portfolio-website/it.json**:

```json
{
	"slug": "sito-portfolio",
	"title": "Sito Portfolio",
	"description": "Un portfolio moderno costruito con SvelteKit e Tailwind CSS",
	"body": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Questo portfolio mostra il mio lavoro come sviluppatore full-stack. Costruito con tecnologie moderne come SvelteKit, TypeScript e Tailwind CSS."
				}
			}
		]
	},
	"image_captions": ["Homepage", "Sezione progetti", "Pagina chi sono"],
	"tags": ["SvelteKit", "TypeScript", "Tailwind CSS"]
}
```

**projects/portfolio-website/meta.json**:

```json
{
	"id": "portfolio-website",
	"images": [
		"images/projects/portfolio-website/screenshot-1.jpg",
		"images/projects/portfolio-website/screenshot-2.jpg"
	],
	"thumbnail": "images/projects/portfolio-website/thumbnail.jpg",
	"link": "https://simonesalerno.it",
	"published": true,
	"created_date": "2024-01-15",
	"updated_date": "2024-02-01"
}
```

## Correzioni Critiche Implementate

### 1. **Bug Routing Risolto**

```typescript
// PRIMA (SBAGLIATO)
const project = parentData.projects.find((p) => p.translations[0].slug === slug);

// DOPO (CORRETTO)
const project = await loader.findContentBySlug(slug, lang, 'project');
// Che internamente fa:
return collection.find((item) => item.translations[lang]?.slug === slug);
```

### 2. **Hooks Server Aggiornato**

- Rimossa dipendenza dall'oggetto `pages` hardcodato
- Utilizza `ContentLoader` per caricare `navigation.json`
- Gestione errori con fallback di sicurezza

### 3. **Language Selector Semplificato**

- **Contenuto disponibile** → vai alla pagina specifica
- **Contenuto NON disponibile** → vai alla sezione principale (es. `/en/projects`)
- Nessuna logica complessa di fallback

### 4. **Immagini Locali Strutturate**

- Path relativi a `static/images/`
- Organizzazione per tipo di contenuto
- Integrazione con componente `Image.svelte` esistente

### 5. **Build Time Dependencies & Single Source of Truth**

**PRINCIPIO**: I file JSON sono l'**unica fonte di verità**. Se non sono disponibili o sono errati durante il build, il processo **deve fallire**. Questo garantisce che il sito non venga mai deployato con configurazioni invalide.

**IMPLICAZIONI**:

- **Nessun fallback statico**: I `params routes` non avranno valori hardcodati.
- **Build Safety**: Il fallimento del build è una feature di sicurezza, non un bug. Previene deploy corrotti.
- **Integrità dei dati**: Garantisce che `languages.json` e `navigation.json` siano sempre corretti e accessibili.

**IMPLEMENTAZIONE RIGOROSA (Senza Fallback)**:

```typescript
// ✅ RIGOROSO - Il build fallirà se il JSON non è valido o assente.
export async function match(param: string) {
	if (!cachedLanguages) {
		const loader = new ContentLoader();
		const languages = await loader.loadConfig('languages');
		cachedLanguages = languages.map((l) => l.code);
	}
	return cachedLanguages.includes(param);
}
```

**REQUISITI**:

- I file di configurazione JSON (`languages.json`, `navigation.json`) devono essere sempre presenti e validi nel repository.
- Il `ContentLoader` deve lanciare un errore in caso di fallimento, interrompendo il build come previsto.
- Il processo di CI/CD deve gestire correttamente i fallimenti del build, notificando gli errori.

### 2. **Migration Strategy**

Il passaggio da store a props sarà **completo e immediato** senza backward compatibility:

1. Rimuovere completamente tutti gli store Directus-related
2. Aggiornare tutti i componenti simultaneamente per usare props
3. Nessun fallback o compatibilità con il sistema precedente
4. Approccio "big bang" per evitare complessità di transizione

### 3. **Image Migration**

Le immagini Directus devono essere:

- Scaricate e organizzate nella struttura locale
- Rinominate secondo convenzioni (`thumbnail.jpg`, `featured.jpg`)
- Verificate che tutti i path siano corretti

### 4. **Testing Requirements**

Prima del deploy finale:

- Test routing con parametri dinamici
- Verifica cambio lingua su tutte le pagine
- Controllo immagini e fallback
- Validazione sitemap.xml
- Test build e deploy

## Note Implementative

- I file JSON vengono inclusi nel bundle tramite `import.meta.glob` di Vite durante il processo di build
- Contenuti pre-renderizzati nell'HTML (SSR) per ottima SEO
- Cache management nel `ContentLoader` per performance
- Sistema completamente compatibile con Cloudflare Pages
- Mantiene la compatibilità con la struttura TypeScript esistente
- Il routing dinamico rimane invariato
- La funzionalità di cambio lingua con slug tradotti viene preservata
- **CRITICO**: Params routes necessitano fallback statici per il build process
