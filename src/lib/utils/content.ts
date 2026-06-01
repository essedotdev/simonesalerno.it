import type {
	AboutContent,
	ArticleItem,
	ArticleMeta,
	ArticleTranslation,
	CacheKey,
	ConfigFileNames,
	ContactContent,
	ContentType,
	GlobalContent,
	LoadConfigType,
	PageNames,
	ProjectItem,
	ProjectMeta,
	ProjectTranslation,
	SlugMap,
	SlugMapData,
	WelcomeContent
} from '../types';

import type { z } from 'zod';

import {
	LanguagesConfigSchema,
	NavigationConfigSchema,
	FeaturedConfigSchema,
	GlobalContentSchema,
	ProjectMetaSchema,
	ArticleMetaSchema,
	ProjectTranslationSchema,
	ArticleTranslationSchema,
	pageSchemas,
	validateContent,
	type PageSchemaKey
} from '../schemas/content';

// Opzioni per il caricamento generico di una collezione (projects/articles).
// Glob e import delle traduzioni restano literal per collezione (richiesto da
// Vite per la static analysis); il resto della logica è condiviso.
interface LoadCollectionOptions<TMeta> {
	cacheKeyBase: 'projects' | 'articles';
	pathBase: string;
	metaFiles: Record<string, () => Promise<unknown>>;
	importTranslation: (id: string, langCode: string) => Promise<{ default: unknown }>;
	metaSchema: z.ZodTypeAny;
	translationSchema: z.ZodTypeAny;
	metaLabel: string;
	translationLabel: string;
	sortKey: (meta: TMeta) => string;
	lang?: string;
}

// Slug map memoizzata a livello di modulo: è un valore globale derivato (identico
// per ogni richiesta) e i contenuti sono immutabili per la vita dell'isolate, quindi
// si calcola una volta sola e si riusa tra le richieste. In dev, dopo aver cambiato
// uno slug, va riavviato il dev server (stesso vincolo del vecchio generatore).
let memoizedSlugMap: SlugMapData | null = null;

export class ContentLoader {
	private cache: Map<CacheKey, unknown> = new Map();

	async loadConfig<T extends ConfigFileNames>(file: T): Promise<LoadConfigType<T>> {
		const cacheKey: CacheKey = `config-${file}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as LoadConfigType<T>;
		}

		try {
			const module = await import(`../content/config/${file}.json`);
			const data = module.default;

			// Validazione con schema appropriato
			let validated: unknown;
			if (file === 'languages') {
				validated = validateContent(LanguagesConfigSchema, data, 'config', `config/${file}.json`);
			} else if (file === 'featured') {
				validated = validateContent(FeaturedConfigSchema, data, 'config', `config/${file}.json`);
			} else {
				validated = validateContent(NavigationConfigSchema, data, 'config', `config/${file}.json`);
			}

			this.cache.set(cacheKey, validated);
			return validated as LoadConfigType<T>;
		} catch (error) {
			console.error(`Error loading config ${file}:`, error);
			throw error;
		}
	}

	async loadGlobal(lang: string): Promise<GlobalContent> {
		const cacheKey: CacheKey = `global-${lang}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as GlobalContent;
		}

		try {
			const module = await import(`../content/global/${lang}.json`);
			const validated = validateContent(
				GlobalContentSchema,
				module.default,
				'global',
				`global/${lang}.json`
			);

			this.cache.set(cacheKey, validated);
			return validated as GlobalContent;
		} catch (error) {
			console.error(`Error loading global content for ${lang}:`, error);
			throw error;
		}
	}

	async loadPage(
		page: PageNames,
		lang: string
	): Promise<WelcomeContent | AboutContent | ContactContent> {
		const cacheKey: CacheKey = `page-${page}-${lang}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as WelcomeContent | AboutContent | ContactContent;
		}

		try {
			const module = await import(`../content/pages/${page}/${lang}.json`);
			const schema = pageSchemas[page as PageSchemaKey];
			const validated = validateContent(
				schema,
				module.default,
				'page',
				`pages/${page}/${lang}.json`
			);

			this.cache.set(cacheKey, validated);
			return validated as WelcomeContent | AboutContent | ContactContent;
		} catch (error) {
			console.error(`Error loading page ${page} for ${lang}:`, error);
			throw error;
		}
	}

	/**
	 * Caricamento generico di una collezione di contenuti (projects/articles):
	 * legge i meta.json via glob, valida meta + traduzioni, filtra i non
	 * pubblicati e ordina. La duplicazione tra progetti e articoli vive solo nei
	 * due wrapper sotto (glob, schemi, chiave di ordinamento).
	 */
	private async loadCollection<TMeta extends { published: boolean }, TTranslation>(
		opts: LoadCollectionOptions<TMeta>
	): Promise<Array<{ translations: Record<string, TTranslation>; meta: TMeta }>> {
		const cacheKey: CacheKey = opts.lang
			? `${opts.cacheKeyBase}-${opts.lang}`
			: `${opts.cacheKeyBase}-all`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as Array<{
				translations: Record<string, TTranslation>;
				meta: TMeta;
			}>;
		}

		const items: Array<{ translations: Record<string, TTranslation>; meta: TMeta }> = [];

		// Lingue da caricare: solo quella richiesta, oppure tutte le disponibili
		const langCodes = opts.lang
			? [opts.lang]
			: (await this.loadConfig('languages')).map((l) => l.code);

		for (const [path, moduleLoader] of Object.entries(opts.metaFiles)) {
			const id = path.split('/').slice(-2, -1)[0];
			const module = await moduleLoader();

			const meta = validateContent(
				opts.metaSchema,
				(module as { default: unknown }).default,
				opts.metaLabel,
				`${opts.pathBase}/${id}/meta.json`
			) as TMeta;

			const translations: Record<string, TTranslation> = {};
			for (const code of langCodes) {
				try {
					const translationModule = await opts.importTranslation(id, code);
					translations[code] = validateContent(
						opts.translationSchema,
						translationModule.default,
						opts.translationLabel,
						`${opts.pathBase}/${id}/${code}.json`
					) as TTranslation;
				} catch {
					// Traduzione non disponibile per questa lingua: la salta.
				}
			}

			if (Object.keys(translations).length > 0 && meta.published) {
				items.push({ translations, meta });
			}
		}

		// Ordina per data, dal più recente al più vecchio. Le date sono ISO 8601:
		// il confronto lessicografico tra stringhe coincide con quello cronologico
		// ed evita di costruire oggetti Date.
		items.sort((a, b) => opts.sortKey(b.meta).localeCompare(opts.sortKey(a.meta)));

		this.cache.set(cacheKey, items);
		return items;
	}

	async loadProjects(lang?: string): Promise<ProjectItem[]> {
		return this.loadCollection<ProjectMeta, ProjectTranslation>({
			cacheKeyBase: 'projects',
			pathBase: 'projects',
			metaFiles: import.meta.glob('../content/projects/*/meta.json'),
			importTranslation: (id, code) => import(`../content/projects/${id}/${code}.json`),
			metaSchema: ProjectMetaSchema,
			translationSchema: ProjectTranslationSchema,
			metaLabel: 'project meta',
			translationLabel: 'project translation',
			sortKey: (meta) => meta.created_date,
			lang
		});
	}

	async loadArticles(lang?: string): Promise<ArticleItem[]> {
		return this.loadCollection<ArticleMeta, ArticleTranslation>({
			cacheKeyBase: 'articles',
			pathBase: 'articles',
			metaFiles: import.meta.glob('../content/articles/*/meta.json'),
			importTranslation: (id, code) => import(`../content/articles/${id}/${code}.json`),
			metaSchema: ArticleMetaSchema,
			translationSchema: ArticleTranslationSchema,
			metaLabel: 'article meta',
			translationLabel: 'article translation',
			sortKey: (meta) => meta.published_date,
			lang
		});
	}

	async loadSlugMap(): Promise<SlugMapData> {
		const cacheKey: CacheKey = 'slug-map';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as SlugMapData;
		}
		if (memoizedSlugMap) {
			this.cache.set(cacheKey, memoizedSlugMap);
			return memoizedSlugMap;
		}

		// Indice id -> { lang: slug } DERIVATO dai contenuti. Gli slug vivono solo
		// nelle traduzioni (single source of truth): non esiste un file pre-generato
		// da tenere in sync, quindi il drift è strutturalmente impossibile.
		const [projects, articles] = await Promise.all([this.loadProjects(), this.loadArticles()]);

		const toSection = (
			items: Array<{ meta: { id: string }; translations: Record<string, { slug: string }> }>
		): SlugMap =>
			Object.fromEntries(
				items.map((item) => [
					item.meta.id,
					Object.fromEntries(Object.entries(item.translations).map(([lang, t]) => [lang, t.slug]))
				])
			);

		const slugMap: SlugMapData = {
			projects: toSection(projects),
			articles: toSection(articles)
		};

		memoizedSlugMap = slugMap;
		this.cache.set(cacheKey, slugMap);
		return slugMap;
	}

	async findContentBySlug(
		slug: string,
		lang: string,
		type: ContentType
	): Promise<ProjectItem | ArticleItem | undefined> {
		const collection =
			type === 'project' ? await this.loadProjects(lang) : await this.loadArticles(lang);

		// CORREZIONE CRITICA: Cerca nella lingua corrente, non in translations[0]
		return collection.find((item) => item.translations[lang]?.slug === slug);
	}
}
