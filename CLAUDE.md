# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: Must use `pnpm` (version 10.12.4)

```bash
pnpm dev         # Start development server
pnpm build       # Production build
pnpm preview     # Preview production build
pnpm check       # Type checking with svelte-check
pnpm lint        # ESLint + Prettier checking (MUST run before commits)
pnpm format      # Code formatting
```

## Architecture

**Tech Stack**: SvelteKit 5 + TypeScript + Tailwind CSS v4 + Cloudflare Pages
**Content Management**: File-based JSON system with full i18n (English/Italian)

### Content System

- All content in `/src/lib/content/` as JSON files
- Structure: `meta.json` + `en.json` + `it.json` for each item
- Articles and projects have metadata (dates, tags, images) + translations
- Global interface text in `/src/lib/content/global/`

### Routing

- Dynamic routes: `[page=lang]/[route=route]/[sub]`
- Language-based URLs: `/en/projects` vs `/it/progetti`
- Parameter validation in `/src/params/`

### Component Organization

```
src/lib/
├── components/    # Reusable UI components
├── sections/      # Large page sections
├── content/       # JSON content files
├── stores/        # State management
├── types/         # TypeScript definitions
└── utils/         # Utility functions
```

### Key Patterns

- **Svelte 5 Runes**: Use `$state`, `$derived`, `$effect` (not stores)
- **TypeScript**: Strict typing enabled, comprehensive interfaces
- **ContentLoader**: Centralized content loading with caching
- **Atomic Design**: Components organized by complexity level

## Development Guidelines

### Content Changes

- Edit JSON files directly for content updates
- Maintain both `en.json` and `it.json` translations
- Update `meta.json` for metadata changes
- Content validation happens at build time

### Component Development

- Follow existing patterns in `/src/lib/components/`
- Use TypeScript interfaces from `/src/lib/types/`
- Leverage Tailwind CSS v4 for styling
- Ensure accessibility (WCAG compliance focus)

### Type Safety

- All content has strict TypeScript interfaces
- Use type guards for content validation
- Maintain consistency across translations

## Deployment

- Target: Cloudflare Pages
- Build output: `.svelte-kit/cloudflare`
- Node.js compatibility enabled
- Automatic deployment on main branch
