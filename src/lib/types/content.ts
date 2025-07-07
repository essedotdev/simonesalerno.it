// ==================================================
// SISTEMA DI TIPI COMPLETO PER CONTENUTI LOCALI
// ==================================================

// Tipi base
export interface Language {
	code: string;
	name: string;
}

export interface LinkItem {
	name: string;
	link: string;
}

export interface InterfaceItem {
	name: string;
	value: string;
}

// Struttura BlockEditor (formato EditorJS)
export interface BlockEditorData {
	text?: string;
	items?: string[]; // Per liste
	[key: string]: unknown; // Per supportare altri tipi di blocchi
}

export interface BlockEditorBlock {
	id?: string;
	type: string;
	data: BlockEditorData;
}

export interface BlockEditor {
	blocks: BlockEditorBlock[];
	time?: number;
	version?: string;
}

// ==================================================
// CONFIG TYPES
// ==================================================

export type NavigationConfig = Record<string, Record<string, string>>;

export interface ConfigFiles {
	languages: Language[];
	navigation: NavigationConfig;
}

// ==================================================
// CONTENT TYPES
// ==================================================

// Global Content
export interface GlobalContent {
	title: string;
	description: string;
	keywords: string[];
	navigation: LinkItem[];
	interface: InterfaceItem[];
}

// Page Content (Welcome, About, Contact, Projects, Blog)
export interface WelcomeContent {
	title: string;
	typewriter: string[];
	description: BlockEditor;
}

export interface AboutContent {
	title: string;
	description: BlockEditor;
}

export interface ContactContent {
	title: string;
	subtitle: string;
	links: LinkItem[];
}

export interface ProjectsPageContent {
	title: string;
}

export interface BlogPageContent {
	title: string;
}

// Collection Item Metadata
export interface ProjectMeta {
	id: string;
	images: string[];
	thumbnail: string;
	thumbnailPlaceholder?: boolean;
	link: string;
	published: boolean;
	created_date: string;
	updated_date: string;
}

export interface ArticleMeta {
	id: string;
	featured_image: string;
	featuredImagePlaceholder?: boolean;
	published: boolean;
	published_date: string;
	created_date: string;
	updated_date: string;
}

// Collection Item Translations
export interface ProjectTranslation {
	slug: string;
	title: string;
	description: string;
	body: BlockEditor;
	image_captions: string[];
	tags: string[];
}

export interface ArticleTranslation {
	slug: string;
	title: string;
	excerpt: string;
	content: BlockEditor;
	meta_description: string;
	tags: string[];
}

// Collection Items
export interface ProjectItem {
	translations: Record<string, ProjectTranslation>;
	meta: ProjectMeta;
}

export interface ArticleItem {
	translations: Record<string, ArticleTranslation>;
	meta: ArticleMeta;
}

// ==================================================
// LAYOUT DATA TYPE
// ==================================================

export interface LayoutData {
	selectedLanguage: string;
	languages: Language[];
	navigation: NavigationConfig;
	global: GlobalContent;
	welcome: WelcomeContent;
	about: AboutContent;
	contact: ContactContent;
	projectsPage: ProjectsPageContent;
	blogPage: BlogPageContent;
	projects: ProjectItem[];
	articles: ArticleItem[];
}

// ==================================================
// PAGE DATA TYPES
// ==================================================

export interface DetailPageData {
	type: 'project' | 'article';
	content: ProjectItem | ArticleItem;
	currentLang: string;
	availableLanguages: string[];
}

// ==================================================
// COMPONENT PROP TYPES
// ==================================================

// Language Selector Props
export interface LanguageSelectorProps {
	languages: Language[];
	selectedLanguage: string;
	navigation: NavigationConfig;
	projects: ProjectItem[];
	articles: ArticleItem[];
}

// Card Component Props
export interface ProjectCardProps {
	title: string;
	description: string;
	thumbnail?: string;
	thumbnailPlaceholder?: boolean;
	link: string;
}

export interface ArticleCardProps {
	title: string;
	excerpt: string;
	featuredImage?: string;
	featuredImagePlaceholder?: boolean;
	link: string;
	publishedDate: string;
	tags: string[];
}

// Section Component Props
export interface ProjectsSectionProps {
	projects: ProjectItem[];
	selectedLanguage: string;
	navigation: NavigationConfig;
	projectsPage: ProjectsPageContent;
	showFilters?: boolean;
	showViewAllButton?: boolean;
	global?: GlobalContent;
}

export interface ArticlesSectionProps {
	articles: ArticleItem[];
	selectedLanguage: string;
	navigation: NavigationConfig;
	blogPage: BlogPageContent;
	showFilters?: boolean;
	showViewAllButton?: boolean;
	global?: GlobalContent;
}

export interface ProjectSectionProps {
	content: ProjectItem;
	currentLang: string;
}

export interface ArticleSectionProps {
	content: ArticleItem;
	currentLang: string;
}

export interface WelcomeSectionProps {
	welcome: WelcomeContent;
}

export interface AboutSectionProps {
	about: AboutContent;
}

export interface ContactSectionProps {
	contact: ContactContent;
}

// Navigation Component Props
export interface NavbarProps {
	data: LayoutData;
	menuOpen: boolean;
}

export interface FooterProps {
	data: LayoutData;
}

export interface FloatingNavProps {
	data: LayoutData;
	menuOpen: boolean;
}

// ==================================================
// CONTENT LOADER TYPES
// ==================================================

export type ConfigFileNames = 'languages' | 'navigation';
export type PageNames = 'welcome' | 'about' | 'contact' | 'projects' | 'blog';
export type ContentType = 'project' | 'article';

// Cache types
export type CacheKey =
	| `config-${ConfigFileNames}`
	| `global-${string}`
	| `page-${PageNames}-${string}`
	| `projects-${string}`
	| 'projects-all'
	| `articles-${string}`
	| 'articles-all';

// Return types for ContentLoader methods
export interface LoadConfigReturn {
	languages: Language[];
	navigation: NavigationConfig;
}

export type LoadConfigType<T extends ConfigFileNames> = T extends 'languages'
	? Language[]
	: T extends 'navigation'
		? NavigationConfig
		: never;

// ==================================================
// UTILITY TYPES
// ==================================================

// Type guards
export function isProjectItem(item: ProjectItem | ArticleItem): item is ProjectItem {
	return 'link' in item.meta;
}

export function isArticleItem(item: ProjectItem | ArticleItem): item is ArticleItem {
	return 'published_date' in item.meta;
}

// Helper types for translation access
export type ProjectTranslationKey = keyof ProjectTranslation;
export type ArticleTranslationKey = keyof ArticleTranslation;

// Route parameter types
export interface RouteParams {
	page: string;
	sub?: string;
}

// Specific type for detail page params (workaround for SvelteKit param naming issue)
export interface DetailPageParams {
	page: string; // This will be the language code
	route?: string; // This will be the route type (projects/articles)
	sub?: string; // This will be the slug
}

// Sitemap types
export interface SitemapPage {
	slug: string;
	lastMod: string;
	priority: number;
	changefreq: string;
	hreflang: string;
	alternates?: Array<{ hreflang: string; href: string }>;
}
