# Simone Salerno - Personal Portfolio

A modern, multilingual portfolio website built with SvelteKit 5, featuring intelligent routing, automatic redirects, and a comprehensive content management system.

![Powered by SvelteKit](https://img.shields.io/badge/SvelteKit-5-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4.svg)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020.svg)

## 🌟 Key Features

image.png

### 🌍 Intelligent Multilingual System

- **Language-first routing**: `/en/projects`, `/it/progetti`
- **Automatic redirects**: Smart URL correction and slug translation
- **Dynamic language switching**: Seamless transitions between languages
- **Route translation**: `/en/projects` ↔ `/it/progetti` with content-aware slug mapping

### 🚀 Advanced Content Management

- **JSON-based CMS**: No database required, git-friendly content management with custom ContentBlocks format
- **ContentBlocks format**: Rich text content with structured data (custom block-based format)
- **Automatic content loading**: Intelligent caching and lazy loading
- **Meta-driven publishing**: Control visibility and dates through metadata

### 🧭 Smart Routing & Redirects

- **Automatic URL correction**: `/en/progetti` → `/en/projects`
- **Cross-language slug translation**: `/it/progetti/piattaforma-e-commerce` → `/en/projects/e-commerce-platform`
- **Fallback handling**: Invalid routes redirect to appropriate language defaults
- **Build-time validation**: Routes validated during build process for reliability
- **Enhanced navigation**: FloatingNav component with improved visibility and responsive design

### 🎨 Modern Design & UX

- **Dark theme**: Custom gradient background with noise texture
- **Responsive design**: Mobile-first approach with Tailwind CSS 4
- **Smooth animations**: Svelte transitions and custom CSS animations
- **Enhanced images**: Optimized image loading with @sveltejs/enhanced-img

## 🏗️ Architecture Overview

### Content Management System

The website uses a sophisticated JSON-based content management system:

```
src/lib/content/
├── config/
│   ├── languages.json     # Available languages
│   ├── navigation.json    # Route translations per language
│   └── scroll.json        # Scroll behavior settings
├── global/
│   ├── en.json           # Global translations (English)
│   └── it.json           # Global translations (Italian)
├── pages/
│   ├── welcome/          # Homepage content
│   ├── about/            # About page content
│   ├── contact/          # Contact page content
│   ├── projects/         # Projects listing page
│   └── blog/             # Blog listing page
├── projects/
│   └── [project-id]/
│       ├── meta.json     # Metadata (dates, images, published status)
│       ├── en.json       # English translation
│       └── it.json       # Italian translation
└── articles/
    └── [article-id]/
        ├── meta.json     # Metadata (dates, featured image, published status)
        ├── en.json       # English translation
        └── it.json       # Italian translation
```

### Routing System

The website implements a sophisticated routing pattern:

- **Base routes**: `/{lang}` (homepage)
- **Section routes**: `/{lang}/{section}` (projects, about, blog)
- **Detail routes**: `/{lang}/{section}/{slug}` (individual projects/articles)

#### Route Translation Examples:

- `/en/projects` ↔ `/it/progetti`
- `/en/about` ↔ `/it/informazioni`
- `/en/blog` ↔ `/it/blog`

### Automatic Redirects

The system handles various redirect scenarios automatically:

1. **Language correction**: `/xx/projects` → `/en/projects` (invalid language)
2. **Route translation**: `/en/progetti` → `/en/projects` (wrong route for language)
3. **Slug translation**: `/en/projects/progetto-italiano` → `/en/projects/english-project`
4. **Fallback redirects**: Single invalid segments → `/en`

### Content Loading

The `ContentLoader` class provides:

- **Intelligent caching**: In-memory caching with automatic cache keys
- **Lazy loading**: Content loaded only when needed
- **Type safety**: Full TypeScript support with comprehensive interfaces
- **Error handling**: Graceful fallbacks for missing content
- **Multi-language support**: Automatic translation loading and validation

## 🛠️ Development

### Prerequisites

- Node.js 18+ and pnpm
- Modern browser with ES2022 support

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd simonesalerno.it

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:5173
```

### Available Scripts

```bash
# Development
pnpm dev                 # Start dev server
pnpm preview            # Preview production build

# Building
pnpm build              # Build for production
pnpm check              # Type checking
pnpm check:watch        # Type checking in watch mode

# Code Quality
pnpm lint               # ESLint + Prettier checking
pnpm format             # Auto-format with Prettier
```

### Project Structure

```
src/
├── lib/
│   ├── components/      # Reusable components
│   │   ├── ui/         # UI components (dropdowns, pagination, etc.)
│   │   └── *.svelte    # Main components (cards, nav, etc.)
│   ├── content/        # JSON content files
│   ├── sections/       # Page sections (Welcome, Projects, etc.)
│   ├── style/          # Global CSS
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── params/             # Route parameter matchers
├── routes/             # SvelteKit routes
│   ├── +layout.*       # Global layout
│   ├── [page=lang]/    # Language-specific routes
│   └── sitemap.xml/    # Sitemap generation
├── app.html           # HTML template
└── hooks.server.ts    # Server-side route handling
```

## 🎯 Key Components

### SearchFilter Component

Advanced filtering system with enhanced visibility and filtering capabilities:

- **Text search**: Real-time search across titles and descriptions
- **Tag filtering**: Multi-select tag dropdown with dynamic tag extraction
- **Status filtering**: Filter by publication status for better content management
- **Date range filtering**: Custom date picker for temporal filtering
- **Sorting options**: Sort by date, title, or relevance
- **URL persistence**: Filter state maintained in URL parameters

### LanguageSelector Component

Intelligent language switching:

- **Context-aware switching**: Maintains current page context when switching languages
- **Content-aware routing**: Translates slugs when switching languages
- **Fallback handling**: Graceful handling of missing translations

### Content Rendering

- **BlockEditor support**: Renders rich content from EditorJS format
- **Image optimization**: Enhanced image loading with placeholders
- **Responsive design**: Mobile-first responsive components
- **Tags support**: Enhanced ProjectCard and Project sections with tag display and filtering
- **Improved metadata**: Updated article and project metadata with publication status management

## 🚀 Deployment

### Cloudflare Pages

The site is optimized for Cloudflare Pages deployment:

```javascript
// svelte.config.js
export default {
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};
```

### Build Process

1. **Content validation**: All JSON content validated during build
2. **Route generation**: Dynamic routes generated from content
3. **Type checking**: Full TypeScript validation
4. **Asset optimization**: Images and assets optimized for production

### Environment Setup

The project requires no environment variables for basic functionality. All configuration is done through JSON files in the content directory.

## 📁 Content Management

### Adding New Content

#### New Project:

1. Create folder: `src/lib/content/projects/my-project/`
2. Add `meta.json` with metadata
3. Add language files: `en.json`, `it.json`
4. Include images in `/static/images/projects/my-project/`

#### New Article:

1. Create folder: `src/lib/content/articles/my-article/`
2. Add `meta.json` with metadata
3. Add language files: `en.json`, `it.json`
4. Include featured image in `/static/images/articles/my-article/`

### Content Format

All content uses the BlockEditor format for rich text:

```json
{
	"slug": "my-content",
	"title": "My Content Title",
	"description": "Brief description",
	"body": {
		"blocks": [
			{
				"type": "paragraph",
				"data": {
					"text": "Content text here..."
				}
			}
		]
	},
	"tags": ["tag1", "tag2"]
}
```

### Metadata Structure

```json
{
	"id": "unique-id",
	"published": true,
	"created_date": "2024-01-01",
	"updated_date": "2024-01-15",
	"images": ["image1.jpg", "image2.jpg"],
	"thumbnail": "thumbnail.jpg"
}
```

## 🔧 Configuration

### Languages

Configure available languages in `src/lib/content/config/languages.json`:

```json
[
	{ "code": "en", "name": "English" },
	{ "code": "it", "name": "Italiano" }
]
```

### Navigation

Configure route translations in `src/lib/content/config/navigation.json`:

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

## 📊 Performance Features

- **Lazy loading**: Content loaded on demand
- **Image optimization**: Enhanced image loading with placeholders
- **Caching**: Intelligent content caching system
- **Code splitting**: Automatic route-based code splitting
- **Edge deployment**: Optimized for Cloudflare Pages edge network

## 🛡️ Type Safety

The project features comprehensive TypeScript coverage:

- **Content types**: Strongly typed content interfaces
- **Component props**: Full prop type definitions
- **Route parameters**: Type-safe route parameter matching
- **API responses**: Typed API response interfaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Ensure tests pass: `pnpm check && pnpm lint`
5. Commit changes: `git commit -m "Add new feature"`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit 5](https://kit.svelte.dev/)
- Styled with [Tailwind CSS 4](https://tailwindcss.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
- Typography: [Geist Font](https://vercel.com/font)
- Icons: [Lucide](https://lucide.dev/)
