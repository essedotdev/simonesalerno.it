export interface BlockEditor {
	blocks: {
		id: string;
		type: string;
		data: {
			text: string;
		};
	}[];
	time: number;
	version: string;
}

export interface LinkItem {
	name: string;
	link: string;
}

export interface InterfaceItem {
	name: string;
	value: string;
}

// Sitemap page object
export interface Page {
	slug: string;
	lastMod: string;
	priority: number;
	hreflang: string;
}

// Local content types
export interface Language {
	code: string;
	name: string;
}

export interface GlobalContent {
	title: string;
	description: string;
	keywords: string[];
	navigation: LinkItem[];
	interface: InterfaceItem[];
}

export interface WelcomeContent {
	title?: string;
	subtitle?: string;
	typewriter?: string[];
	description?: BlockEditor;
}

export interface AboutContent {
	title?: string;
	subtitle?: string;
	description?: BlockEditor;
}

export interface ContactContent {
	title?: string;
	subtitle?: string;
	links?: LinkItem[];
}

export interface ProjectMeta {
	id: string;
	images?: string[];
	thumbnail?: string;
	link?: string;
	published: boolean;
	created_date?: string;
	updated_date?: string;
}

export interface ArticleMeta {
	id: string;
	featured_image?: string;
	images?: string[];
	published: boolean;
	created_date?: string;
	updated_date?: string;
	published_date?: string;
}

export interface ProjectTranslation {
	slug: string;
	title: string;
	description?: string;
	body?: BlockEditor;
	image_captions?: string[];
	tags?: string[];
}

export interface ArticleTranslation {
	slug: string;
	title: string;
	excerpt?: string;
	content?: BlockEditor;
	tags?: string[];
	meta_description?: string;
}

export interface ProjectItem {
	translations: Record<string, ProjectTranslation>;
	meta: ProjectMeta;
}

export interface ArticleItem {
	translations: Record<string, ArticleTranslation>;
	meta: ArticleMeta;
}

export interface LayoutData {
	selectedLanguage: string;
	languages: Language[];
	navigation: Record<string, Record<string, string>>;
	global: GlobalContent;
	welcome: WelcomeContent;
	about: AboutContent;
	contact: ContactContent;
	projects: ProjectItem[];
	articles: ArticleItem[];
}
