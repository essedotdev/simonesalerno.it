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
	WelcomeContent
} from '../types';

import {
	LanguagesConfigSchema,
	NavigationConfigSchema,
	GlobalContentSchema,
	ProjectMetaSchema,
	ArticleMetaSchema,
	ProjectTranslationSchema,
	ArticleTranslationSchema,
	pageSchemas,
	validateContent,
	type PageSchemaKey
} from '../schemas/content';

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

	async loadProjects(lang?: string): Promise<ProjectItem[]> {
		const cacheKey: CacheKey = lang ? `projects-${lang}` : 'projects-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as ProjectItem[];
		}

		// Carica tutti i meta.json dei progetti
		const metaFiles = import.meta.glob('../content/projects/*/meta.json');
		const projects: ProjectItem[] = [];

		for (const [path, moduleLoader] of Object.entries(metaFiles)) {
			const projectId = path.split('/').slice(-2, -1)[0];
			const module = await moduleLoader();

			// Valida meta.json
			const meta = validateContent(
				ProjectMetaSchema,
				(module as { default: unknown }).default,
				'project meta',
				`projects/${projectId}/meta.json`
			) as ProjectMeta;

			// Carica le traduzioni
			const translations: Record<string, ProjectTranslation> = {};

			if (lang) {
				// Carica solo la lingua richiesta
				try {
					const translationModule = await import(`../content/projects/${projectId}/${lang}.json`);
					const validated = validateContent(
						ProjectTranslationSchema,
						translationModule.default,
						'project translation',
						`projects/${projectId}/${lang}.json`
					);
					translations[lang] = validated as ProjectTranslation;
				} catch {
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
						const validated = validateContent(
							ProjectTranslationSchema,
							translationModule.default,
							'project translation',
							`projects/${projectId}/${language.code}.json`
						);
						translations[language.code] = validated as ProjectTranslation;
					} catch {
						// Traduzione non disponibile per questa lingua
						continue;
					}
				}
			}

			if (Object.keys(translations).length > 0 && meta.published) {
				projects.push({ translations, meta });
			}
		}

		// Ordina per data di creazione (dal più recente al più vecchio)
		projects.sort(
			(a, b) => new Date(b.meta.created_date).getTime() - new Date(a.meta.created_date).getTime()
		);

		this.cache.set(cacheKey, projects);
		return projects;
	}

	async loadArticles(lang?: string): Promise<ArticleItem[]> {
		const cacheKey: CacheKey = lang ? `articles-${lang}` : 'articles-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as ArticleItem[];
		}

		// Carica tutti i meta.json degli articoli
		const metaFiles = import.meta.glob('../content/articles/*/meta.json');
		const articles: ArticleItem[] = [];

		for (const [path, moduleLoader] of Object.entries(metaFiles)) {
			const articleId = path.split('/').slice(-2, -1)[0];
			const module = await moduleLoader();

			// Valida meta.json
			const meta = validateContent(
				ArticleMetaSchema,
				(module as { default: unknown }).default,
				'article meta',
				`articles/${articleId}/meta.json`
			) as ArticleMeta;

			// Carica le traduzioni
			const translations: Record<string, ArticleTranslation> = {};

			if (lang) {
				// Carica solo la lingua richiesta
				try {
					const translationModule = await import(`../content/articles/${articleId}/${lang}.json`);
					const validated = validateContent(
						ArticleTranslationSchema,
						translationModule.default,
						'article translation',
						`articles/${articleId}/${lang}.json`
					);
					translations[lang] = validated as ArticleTranslation;
				} catch {
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
						const validated = validateContent(
							ArticleTranslationSchema,
							translationModule.default,
							'article translation',
							`articles/${articleId}/${language.code}.json`
						);
						translations[language.code] = validated as ArticleTranslation;
					} catch {
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
	}

	async getAvailableLanguages(contentType: ContentType, id: string): Promise<string[]> {
		try {
			const languages = await this.loadConfig('languages');
			const availableLanguages: string[] = [];

			for (const language of languages) {
				try {
					await import(`../content/${contentType}s/${id}/${language.code}.json`);
					availableLanguages.push(language.code);
				} catch {
					// Traduzione non disponibile
				}
			}

			return availableLanguages;
		} catch (error) {
			console.error(`Error getting available languages for ${contentType} ${id}:`, error);
			return [];
		}
	}

	async findContentBySlug(
		slug: string,
		lang: string,
		type: ContentType
	): Promise<ProjectItem | ArticleItem | undefined> {
		const collection = type === 'project' ? await this.loadProjects() : await this.loadArticles();

		// CORREZIONE CRITICA: Cerca nella lingua corrente, non in translations[0]
		return collection.find((item) => item.translations[lang]?.slug === slug);
	}

	/**
	 * Check if content exists by slug without loading it
	 */
	async contentExists(slug: string, lang: string, type: ContentType): Promise<boolean> {
		try {
			const content = await this.findContentBySlug(slug, lang, type);
			return !!content;
		} catch {
			return false;
		}
	}

	/**
	 * Validate if a route is valid for the given language
	 */
	async isValidRoute(route: string, lang: string): Promise<boolean> {
		try {
			const navigation = await this.loadConfig('navigation');
			const routeMap = navigation[lang];
			if (!routeMap) return false;

			return Object.values(routeMap).includes(route);
		} catch {
			return false;
		}
	}

	/**
	 * Validate if a language code is supported
	 */
	async isValidLanguage(lang: string): Promise<boolean> {
		try {
			const languages = await this.loadConfig('languages');
			return languages.some((l) => l.code === lang);
		} catch {
			return false;
		}
	}

	/**
	 * Get route type (projects/blog) from route string
	 */
	async getRouteType(route: string, lang: string): Promise<'projects' | 'blog' | null> {
		try {
			const navigation = await this.loadConfig('navigation');
			const routeMap = navigation[lang];
			if (!routeMap) return null;

			if (route === routeMap.projects) return 'projects';
			if (route === routeMap.articles) return 'blog';
			return null;
		} catch {
			return null;
		}
	}
}
