# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **simonesalerno.it**, a personal portfolio website built with **SvelteKit 5** using TypeScript, deployed on Cloudflare Pages with Directus as a headless CMS.

## Commands

### Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Run type checking
pnpm lint         # Run ESLint + Prettier
pnpm format       # Format code
```

### Deployment

```bash
pnpm run deploy   # Deploy to Cloudflare Pages
```

## Architecture

### Tech Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS v4
- **Content Management**: Local JSON-based system
- **Analytics**: Umami analytics
- **Deployment**: Cloudflare Pages
- **Package Manager**: pnpm

### Internationalization

- **Languages**: English (`en`) and Italian (`it`)
- **Routing**: Dynamic with `[page=lang]` parameter
- **Page mappings**:
  - English: `/en/projects`, `/en/about`
  - Italian: `/it/progetti`, `/it/informazioni`
- **Param matchers**: Custom validation in `src/params/`

### Routing Structure

```
/[page=lang]/                     # Home (e.g., /en, /it)
/[page=lang]/[page=route]/[sub]/  # Project details (e.g., /en/projects/project-name)
/sitemap.xml                      # Generated sitemap
```

### Content Management

- **Local JSON files**: All content stored in `src/lib/content/`
- **Content types**: Global settings, Welcome, Projects, About, Contact, Articles
- **Server-side loading**: All content fetched in `+layout.server.ts` via ContentLoader
- **Block editor**: Rich content with structured blocks (EditorJS format)
- **Multi-language**: Each content piece has separate JSON files per language

### Key Directories

- `src/lib/components/` - Reusable UI components
- `src/lib/sections/` - Page sections (Welcome, Projects, About, Contact)
- `src/lib/content/` - JSON content files organized by type
- `src/lib/utils/` - Utility functions including ContentLoader
- `src/params/` - Custom param matchers for routing

### Configuration Files

- `svelte.config.js` - Cloudflare adapter configuration
- `vite.config.ts` - Vite with Tailwind and enhanced images
- `wrangler.jsonc` - Cloudflare Workers configuration
- `tsconfig.json` - TypeScript configuration

## Development Notes

- **Package Manager**: Uses pnpm exclusively
- **Node Version**: 22.16.0 (specified in wrangler.jsonc)
- **Analytics**: Umami integration (disabled in development)
- **Images**: Using `@sveltejs/enhanced-img` for optimization
- **SEO**: Dynamic sitemap generation with hreflang tags
- **Content Loading**: Uses Vite's `import.meta.glob` for dynamic JSON imports
