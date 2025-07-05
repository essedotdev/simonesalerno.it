export interface Language {
	id: number;
	code: string;
	name: string;
}

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

export interface GlobalTranslation {
	id: number;
	global_id: number;
	languages_code: string;
	title: string;
	description: string;
	keywords: string[];
	navigation: LinkItem[];
	interface: InterfaceItem[];
	date_updated?: string;
}

export interface Global {
	translations: GlobalTranslation[];
}

export interface WelcomeTranslation {
	id: number;
	welcome_id: number;
	languages_code: string;
	title: string;
	description: BlockEditor;
	typewriter: string[];
	date_updated?: string;
}

export interface Welcome {
	translations: WelcomeTranslation[];
}

export interface AboutTranslation {
	id: number;
	about_id: number;
	languages_code: string;
	title: string;
	description: BlockEditor;
	date_updated?: string;
}

export interface About {
	translations: AboutTranslation[];
}

export interface ContactTranslation {
	id: number;
	contact_id: number;
	languages_code: string;
	title: string;
	subtitle: string;
	links: LinkItem[];
	date_updated?: string;
}

export interface Contact {
	translations: ContactTranslation[];
}

export interface ProjectImage {
	directus_files_id: string;
	id: number;
	project_id: number;
}

export interface ProjectTranslation {
	id: number;
	project_id: number;
	languages_code: string;
	slug: string;
	title: string;
	description: string;
	body: BlockEditor;
	image_captions: string[];
	date_updated?: string;
}

export interface Project {
	id: number;
	images: ProjectImage[];
	translations: ProjectTranslation[];
	link: string;
}

export interface ArticleImage {
	directus_files_id: string;
	id: number;
	article_id: number;
}

export interface ArticleTranslation {
	id: number;
	article_id: number;
	languages_code: string;
	title: string;
	slug: string;
	excerpt: string;
	content: BlockEditor;
	meta_description: string;
	tags: string[];
	date_updated?: string;
	date_created?: string;
}

export interface Article {
	id: number;
	featured_image?: string;
	published_date: string;
	published: boolean;
	translations: ArticleTranslation[];
}

export interface Translation {
	global: GlobalTranslation;
	welcome: WelcomeTranslation;
	projects: Project[];
	articles: Article[];
	about: AboutTranslation;
	contact: ContactTranslation;
}

// Sitemap page object
export interface Page {
	slug: string;
	lastMod: string;
	priority: number;
	hreflang: string;
}

// Pages map
export type PageMap = {
	[key: string]: { [key: string]: string };
};
