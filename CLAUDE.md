# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Simone Salerno, built with SvelteKit 5 and TypeScript. The site features multilingual support (i18n), JSON-based content management, and is deployed on Cloudflare Pages.

## Key Technologies

- **SvelteKit 5** with TypeScript
- **Tailwind CSS v4** for styling
- **Cloudflare Pages** for deployment
- **pnpm** as package manager
- **Vite** as build tool

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check
pnpm check:watch

# Linting and formatting
pnpm lint
pnpm format
```

## Architecture Overview

### Content Management System

The site uses a JSON-based content management system with full internationalization support:

- **Config files**: `src/lib/content/config/` - Contains languages.json and navigation.json
- **Global content**: `src/lib/content/global/` - Contains site-wide translations (e.g., it.json, en.json)
- **Page content**: `src/lib/content/pages/` - Contains page-specific content organized by page type
- **Collections**: `src/lib/content/projects/` and `src/lib/content/articles/` - Each item has:
  - `meta.json` - Metadata (dates, published status, images)
  - Language files (e.g., `it.json`, `en.json`) - Translations with BlockEditor format

### Routing Structure

The app uses a language-first routing pattern:

- `/{lang}` - Homepage in specified language
- `/{lang}/projects` - Projects listing page
- `/{lang}/projects/{slug}` - Individual project detail
- `/{lang}/articles` - Articles listing page
- `/{lang}/articles/{slug}` - Individual article detail

Route parameters are handled through special matchers in `src/params/`.

### Key Components

- **Layout Components**: `Navbar`, `Footer`, `FloatingNav` - Main navigation elements
- **Section Components**: `Welcome`, `About`, `Contact`, `Projects`, `Articles` - Page sections
- **UI Components**: Various reusable components in `src/lib/components/ui/`
- **Content Display**: Components handle BlockEditor format for rich text content

### Type System

The project has a comprehensive type system defined in `src/lib/types/content.ts` that covers:

- Content structures (GlobalContent, ProjectItem, ArticleItem, etc.)
- Component props interfaces
- Layout data types
- BlockEditor format for rich text content

### Utilities

- **ContentLoader** (`src/lib/utils/content.ts`): Handles loading and caching of JSON content
- **Analytics** (`src/lib/utils/analytics.ts`): Google Analytics integration
- **Translations** (`src/lib/utils/translations.ts`): Language switching utilities
- **Search/Filter** (`src/lib/utils/searchUtils.ts`): Content filtering logic

### Deployment

The site is configured for Cloudflare Pages deployment:

- Adapter: `@sveltejs/adapter-cloudflare`
- Build output is optimized for edge runtime
- Supports Cloudflare Workers for server-side logic

## Important Notes

- Always check existing content structure before adding new content
- Follow the established BlockEditor format for rich text content
- Maintain type safety by using the defined interfaces
- Content is cached in memory - changes require a rebuild
- Language codes must match those defined in `languages.json`
- All projects and articles must have a `meta.json` file and at least one language translation
