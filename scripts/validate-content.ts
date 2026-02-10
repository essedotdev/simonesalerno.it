/**
 * Script di validazione contenuti JSON
 * Eseguito in pre-build per catturare errori prima del deploy
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// ==================================================
// SCHEMI (duplicati da src/lib/schemas/content.ts per evitare problemi di import)
// ==================================================

const LanguageSchema = z.object({
	code: z.string().min(2).max(5),
	name: z.string().min(1)
});

const LinkItemSchema = z.object({
	name: z.string().min(1),
	link: z.string().min(1)
});

const InterfaceItemSchema = z.object({
	name: z.string().min(1),
	value: z.string()
});

const ContentBlockDataSchema = z
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
	.passthrough();

const ContentBlockSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['paragraph', 'header', 'list', 'image', 'code', 'quote', 'divider']),
	data: ContentBlockDataSchema
});

const ContentBlocksSchema = z.object({
	blocks: z.array(ContentBlockSchema),
	time: z.number().optional(),
	version: z.string().optional()
});

const LanguagesConfigSchema = z.array(LanguageSchema).min(1);

const NavigationConfigSchema = z.record(z.string(), z.record(z.string(), z.string()));

const GlobalContentSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	keywords: z.array(z.string()),
	navigation: z.array(LinkItemSchema),
	interface: z.array(InterfaceItemSchema),
	tagTranslations: z.record(z.string(), z.string())
});

const WelcomeContentSchema = z.object({
	title: z.string().min(1),
	description: ContentBlocksSchema
});

const AboutContentSchema = z.object({
	title: z.string().min(1),
	description: ContentBlocksSchema
});

const ContactContentSchema = z.object({
	title: z.string().min(1),
	subtitle: z.string().min(1),
	links: z.array(LinkItemSchema)
});

const ProjectsPageContentSchema = z.object({
	title: z.string().min(1)
});

const BlogPageContentSchema = z.object({
	title: z.string().min(1)
});

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
	message: 'Data deve essere in formato YYYY-MM-DD'
});

const ProjectMetaSchema = z.object({
	id: z.string().min(1),
	images: z.array(z.string()),
	featured_image: z.string().min(1),
	featuredImagePlaceholder: z.boolean().optional(),
	og_image_key: z.string().optional(),
	link: z.string().url().optional(),
	published: z.boolean(),
	status: z.enum(['completed', 'in-progress', 'idea', 'archived']),
	created_date: DateStringSchema,
	updated_date: DateStringSchema
});

const ArticleMetaSchema = z.object({
	id: z.string().min(1),
	featured_image: z.string().min(1),
	featuredImagePlaceholder: z.boolean().optional(),
	og_image_key: z.string().optional(),
	published: z.boolean(),
	published_date: DateStringSchema,
	created_date: DateStringSchema,
	updated_date: DateStringSchema
});

const ProjectTranslationSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	excerpt: z.string().min(1),
	content: ContentBlocksSchema,
	image_captions: z.array(z.string()),
	tags: z.array(z.string())
});

const ArticleTranslationSchema = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	excerpt: z.string().min(1),
	content: ContentBlocksSchema,
	meta_description: z.string().min(1),
	tags: z.array(z.string())
});

// ==================================================
// VALIDAZIONE
// ==================================================

const CONTENT_DIR = join(process.cwd(), 'src/lib/content');

interface ValidationError {
	file: string;
	errors: string[];
}

const validationErrors: ValidationError[] = [];

function validateFile(filePath: string, schema: z.ZodSchema): void {
	const relativePath = filePath.replace(process.cwd() + '/', '');

	try {
		const content = readFileSync(filePath, 'utf-8');
		const data = JSON.parse(content);
		const result = schema.safeParse(data);

		if (!result.success) {
			validationErrors.push({
				file: relativePath,
				errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
			});
		}
	} catch (err) {
		if (err instanceof SyntaxError) {
			validationErrors.push({
				file: relativePath,
				errors: [`JSON syntax error: ${err.message}`]
			});
		} else {
			validationErrors.push({
				file: relativePath,
				errors: [`Failed to read file: ${err}`]
			});
		}
	}
}

// ==================================================
// MAIN
// ==================================================

console.log('🔍 Validating content files...\n');

// Config files
validateFile(join(CONTENT_DIR, 'config/languages.json'), LanguagesConfigSchema);
validateFile(join(CONTENT_DIR, 'config/navigation.json'), NavigationConfigSchema);

// Global content
const globalDir = join(CONTENT_DIR, 'global');
if (existsSync(globalDir)) {
	for (const file of readdirSync(globalDir)) {
		if (file.endsWith('.json')) {
			validateFile(join(globalDir, file), GlobalContentSchema);
		}
	}
}

// Page content
const pageSchemas: Record<string, z.ZodSchema> = {
	welcome: WelcomeContentSchema,
	about: AboutContentSchema,
	contact: ContactContentSchema,
	projects: ProjectsPageContentSchema,
	blog: BlogPageContentSchema
};

const pagesDir = join(CONTENT_DIR, 'pages');
if (existsSync(pagesDir)) {
	for (const pageDir of readdirSync(pagesDir)) {
		const schema = pageSchemas[pageDir];
		if (schema) {
			const pagePath = join(pagesDir, pageDir);
			for (const file of readdirSync(pagePath)) {
				if (file.endsWith('.json')) {
					validateFile(join(pagePath, file), schema);
				}
			}
		}
	}
}

// Projects
const projectsDir = join(CONTENT_DIR, 'projects');
if (existsSync(projectsDir)) {
	for (const projectDir of readdirSync(projectsDir, { withFileTypes: true })) {
		if (projectDir.isDirectory()) {
			const projectPath = join(projectsDir, projectDir.name);

			// meta.json
			const metaPath = join(projectPath, 'meta.json');
			if (existsSync(metaPath)) {
				validateFile(metaPath, ProjectMetaSchema);
			}

			// translation files (en.json, it.json, etc.)
			for (const file of readdirSync(projectPath)) {
				if (file.endsWith('.json') && file !== 'meta.json') {
					validateFile(join(projectPath, file), ProjectTranslationSchema);
				}
			}
		}
	}
}

// Articles
const articlesDir = join(CONTENT_DIR, 'articles');
if (existsSync(articlesDir)) {
	for (const articleDir of readdirSync(articlesDir, { withFileTypes: true })) {
		if (articleDir.isDirectory()) {
			const articlePath = join(articlesDir, articleDir.name);

			// meta.json
			const metaPath = join(articlePath, 'meta.json');
			if (existsSync(metaPath)) {
				validateFile(metaPath, ArticleMetaSchema);
			}

			// translation files
			for (const file of readdirSync(articlePath)) {
				if (file.endsWith('.json') && file !== 'meta.json') {
					validateFile(join(articlePath, file), ArticleTranslationSchema);
				}
			}
		}
	}
}

// ==================================================
// RESULTS
// ==================================================

if (validationErrors.length > 0) {
	console.error('❌ Content validation failed!\n');

	for (const { file, errors } of validationErrors) {
		console.error(`\n📄 ${file}`);
		for (const error of errors) {
			console.error(`   └─ ${error}`);
		}
	}

	console.error(`\n💥 ${validationErrors.length} file(s) with errors\n`);
	process.exit(1);
} else {
	console.log('✅ All content files are valid!\n');
	process.exit(0);
}
