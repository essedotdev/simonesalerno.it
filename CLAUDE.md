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
- **CMS**: Directus (headless CMS at directus.simonesalerno.it)
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

- **Directus CMS**: All content fully translatable
- **Content types**: Global settings, Welcome, Projects, About, Contact
- **Server-side loading**: All content fetched in `+layout.server.ts`
- **Block editor**: Rich content with structured blocks

### Key Directories

- `src/lib/components/` - Reusable UI components
- `src/lib/sections/` - Page sections (Welcome, Projects, About, Contact)
- `src/lib/stores/` - Svelte stores for state management
- `src/lib/utils/` - Utility functions and CMS integration
- `src/params/` - Custom param matchers for routing

### Configuration Files

- `svelte.config.js` - Cloudflare adapter configuration
- `vite.config.ts` - Vite with Tailwind and enhanced images
- `wrangler.jsonc` - Cloudflare Workers configuration
- `tsconfig.json` - TypeScript configuration

## Development Notes

- **Package Manager**: Uses pnpm exclusively
- **Node Version**: 22.16.0 (specified in wrangler.jsonc)
- **Environment**: Cloudflare Pages environment variables required
- **Analytics**: Umami integration (disabled in development)
- **Images**: Using `@sveltejs/enhanced-img` for optimization
- **SEO**: Dynamic sitemap generation with hreflang tags
