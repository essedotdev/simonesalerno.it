import { z } from 'zod';

// ==================================================
// SCHEMI ZOD PER VALIDAZIONE CONTENUTI JSON
// ==================================================

// Tipi base
export const LanguageSchema = z.object({
	code: z.string().min(2).max(5),
	name: z.string().min(1)
});

export const LinkItemSchema = z.object({
	name: z.string().min(1),
	link: z.string().min(1)
});

export const InterfaceItemSchema = z.object({
	name: z.string().min(1),
	value: z.string()
});

// ContentBlocks (formato custom per contenuti strutturati)
export const ContentBlockDataSchema = z
	.object({
		text: z.string().optional(),
		items: z.array(z.string()).optional(),
		level: z.number().min(1).max(6).optional(),
		src: z.string().optional(),
		alt: z.string().optional(),
		language: z.string().optional(),
		layout: z.enum(['full', 'left', 'right']).optional(),
		size: z.enum(['small', 'medium', 'large']).optional(),
		width: z.string().optional(),
		height: z.string().optional()
	})
	.passthrough(); // Permette proprietà extra per flessibilità futura

export const ContentBlockSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['paragraph', 'header', 'list', 'image', 'code', 'quote', 'divider']),
	data: ContentBlockDataSchema
});

export const ContentBlocksSchema = z.object({
	blocks: z.array(ContentBlockSchema),
	time: z.number().optional(),
	version: z.string().optional()
});

// ==================================================
// CONFIG SCHEMAS
// ==================================================

export const LanguagesConfigSchema = z.array(LanguageSchema).min(1);

export const NavigationConfigSchema = z.record(z.string(), z.record(z.string(), z.string()));

// ==================================================
// CONTENT SCHEMAS
// ==================================================

// Global Content
export const GlobalContentSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	keywords: z.array(z.string()),
	navigation: z.array(LinkItemSchema),
	interface: z.array(InterfaceItemSchema),
	tagTranslations: z.record(z.string(), z.string())
});

// Page Content
export const WelcomeContentSchema = z.object({
	title: z.string().min(1),
	typewriter: z.array(z.string()).min(1),
	description: ContentBlocksSchema
});

export const AboutContentSchema = z.object({
	title: z.string().min(1),
	description: ContentBlocksSchema
});

export const ContactContentSchema = z.object({
	title: z.string().min(1),
	subtitle: z.string().min(1),
	links: z.array(LinkItemSchema)
});

export const ProjectsPageContentSchema = z.object({
	title: z.string().min(1)
});

export const BlogPageContentSchema = z.object({
	title: z.string().min(1)
});

// Date string validation (YYYY-MM-DD format)
const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
	message: 'Data deve essere in formato YYYY-MM-DD'
});

// Collection Item Metadata
export const ProjectMetaSchema = z.object({
	id: z.string().min(1),
	images: z.array(z.string()),
	featured_image: z.string().min(1),
	og_image_key: z.string().optional(),
	link: z.string().url().optional(),
	published: z.boolean(),
	status: z.enum(['completed', 'in-progress', 'idea', 'archived']),
	created_date: DateStringSchema,
	updated_date: DateStringSchema
});

export const ArticleMetaSchema = z.object({
	id: z.string().min(1),
	featured_image: z.string().min(1),
	og_image_key: z.string().optional(),
	published: z.boolean(),
	published_date: DateStringSchema,
	created_date: DateStringSchema,
	updated_date: DateStringSchema
});

// Collection Item Translations
export const ProjectTranslationSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	excerpt: z.string().min(1),
	content: ContentBlocksSchema,
	image_captions: z.array(z.string()),
	tags: z.array(z.string())
});

export const ArticleTranslationSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	excerpt: z.string().min(1),
	content: ContentBlocksSchema,
	meta_description: z.string().min(1),
	tags: z.array(z.string())
});

// ==================================================
// TYPE EXPORTS (inferiti dagli schemi)
// ==================================================

export type LanguageSchemaType = z.infer<typeof LanguageSchema>;
export type GlobalContentSchemaType = z.infer<typeof GlobalContentSchema>;
export type WelcomeContentSchemaType = z.infer<typeof WelcomeContentSchema>;
export type AboutContentSchemaType = z.infer<typeof AboutContentSchema>;
export type ContactContentSchemaType = z.infer<typeof ContactContentSchema>;
export type ProjectMetaSchemaType = z.infer<typeof ProjectMetaSchema>;
export type ArticleMetaSchemaType = z.infer<typeof ArticleMetaSchema>;
export type ProjectTranslationSchemaType = z.infer<typeof ProjectTranslationSchema>;
export type ArticleTranslationSchemaType = z.infer<typeof ArticleTranslationSchema>;

// ==================================================
// VALIDATION HELPERS
// ==================================================

export class ContentValidationError extends Error {
	constructor(
		public readonly contentType: string,
		public readonly path: string,
		public readonly zodError: z.ZodError
	) {
		const issues = zodError.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
		super(`Errore validazione ${contentType} in "${path}":\n${issues}`);
		this.name = 'ContentValidationError';
	}
}

/**
 * Valida un contenuto JSON contro uno schema Zod.
 * Lancia ContentValidationError se la validazione fallisce.
 */
export function validateContent<T>(
	schema: z.ZodSchema<T>,
	data: unknown,
	contentType: string,
	path: string
): T {
	const result = schema.safeParse(data);

	if (!result.success) {
		throw new ContentValidationError(contentType, path, result.error);
	}

	return result.data;
}

/**
 * Mappa degli schemi per tipo di pagina
 */
export const pageSchemas = {
	welcome: WelcomeContentSchema,
	about: AboutContentSchema,
	contact: ContactContentSchema,
	projects: ProjectsPageContentSchema,
	blog: BlogPageContentSchema
} as const;

export type PageSchemaKey = keyof typeof pageSchemas;
