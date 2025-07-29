import type {
	GlobalContent,
	WelcomeContent,
	AboutContent,
	ContactContent,
	ProjectItem,
	ArticleItem,
	ProjectMeta,
	ArticleMeta,
	ProjectTranslation,
	ArticleTranslation,
	ConfigFileNames,
	PageNames,
	ContentType,
	CacheKey,
	LoadConfigType
} from '../types';

// Helper per gestione immagini locali
export function getImagePath(type: ContentType, id: string, filename: string): string {
	return `/images/${type}s/${id}/${filename}`;
}

export function getThumbnailPath(type: ContentType, id: string): string {
	return `/images/${type}s/${id}/thumbnail.jpg`;
}

export function getFeaturedImagePath(type: 'article', id: string): string {
	return `/images/${type}s/${id}/featured.jpg`;
}

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
			this.cache.set(cacheKey, data);
			return data as LoadConfigType<T>;
		} catch (error) {
			console.error(`Error loading config ${file}:`, error);
			throw new Error(`Config file ${file} not found`);
		}
	}

	async loadGlobal(lang: string): Promise<GlobalContent> {
		const cacheKey: CacheKey = `global-${lang}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as GlobalContent;
		}

		try {
			const module = await import(`../content/global/${lang}.json`);
			const data: GlobalContent = module.default;

			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Error loading global content for ${lang}:`, error);
			throw new Error(`Global content for ${lang} not found`);
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
			const data = module.default;
			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Error loading page ${page} for ${lang}:`, error);
			throw new Error(`Page ${page} for ${lang} not found`);
		}
	}

	async loadProjects(lang?: string): Promise<ProjectItem[]> {
		const cacheKey: CacheKey = lang ? `projects-${lang}` : 'projects-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as ProjectItem[];
		}

		try {
			// Carica tutti i meta.json dei progetti
			const metaFiles = import.meta.glob('../content/projects/*/meta.json');
			const projects: ProjectItem[] = [];

			for (const [path, moduleLoader] of Object.entries(metaFiles)) {
				const projectId = path.split('/').slice(-2, -1)[0];
				const module = await moduleLoader();
				const meta = (module as { default: ProjectMeta }).default;

				// Carica le traduzioni
				const translations: Record<string, ProjectTranslation> = {};

				if (lang) {
					// Carica solo la lingua richiesta
					try {
						const translationModule = await import(`../content/projects/${projectId}/${lang}.json`);
						translations[lang] = translationModule.default as ProjectTranslation;
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
							translations[language.code] = translationModule.default as ProjectTranslation;
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
		} catch (error) {
			console.error('Error loading projects:', error);
			return [];
		}
	}

	async loadArticles(lang?: string): Promise<ArticleItem[]> {
		const cacheKey: CacheKey = lang ? `articles-${lang}` : 'articles-all';
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as ArticleItem[];
		}

		try {
			// Carica tutti i meta.json degli articoli
			const metaFiles = import.meta.glob('../content/articles/*/meta.json');
			const articles: ArticleItem[] = [];

			for (const [path, moduleLoader] of Object.entries(metaFiles)) {
				const articleId = path.split('/').slice(-2, -1)[0];
				const module = await moduleLoader();
				const meta = (module as { default: ArticleMeta }).default;

				// Carica le traduzioni
				const translations: Record<string, ArticleTranslation> = {};

				if (lang) {
					// Carica solo la lingua richiesta
					try {
						const translationModule = await import(`../content/articles/${articleId}/${lang}.json`);
						translations[lang] = translationModule.default as ArticleTranslation;
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
							translations[language.code] = translationModule.default as ArticleTranslation;
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
		} catch (error) {
			console.error('Error loading articles:', error);
			return [];
		}
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
}
