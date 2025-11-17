# simonesalerno.it

Personal portfolio website built with SvelteKit and deployed on Cloudflare Workers.

## Tech Stack

- **SvelteKit 2** - Full-stack framework with Svelte 5 (runes)
- **Tailwind CSS 4** - Utility-first styling
- **Cloudflare Workers** - Edge deployment with global CDN
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tooling

## Features

- **Multi-language support** - Internationalization with dynamic routing
- **Portfolio showcase** - Projects gallery with detailed views
- **Articles/Blog** - Content publishing system
- **Contact form** - Get in touch functionality
- **Optimized images** - Automatic image optimization with vite-imagetools
- **OG images** - Dynamic Open Graph image generation
- **Responsive design** - Mobile-first approach

## Development

### Prerequisites

- Node.js 18+
- pnpm 10+

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The site will be available at `http://localhost:5173`

### Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm check            # TypeScript type checking
pnpm lint             # Check code style
pnpm format           # Format code with Prettier
```

## Deployment

The site is deployed on Cloudflare Workers for global edge performance.

```bash
# Build and deploy to Cloudflare
pnpm deploy

# Preview Cloudflare build locally
pnpm preview
```

### Environment Setup

Configure Cloudflare Workers settings in `wrangler.jsonc`.

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── sections/       # Page sections (Welcome, Projects, About, etc.)
│   └── style/          # Global styles
├── routes/
│   └── [page=lang]/    # Multi-language routing
│       ├── +page.svelte
│       ├── [route]/    # Dynamic routes
│       └── [sub]/      # Sub-routes
└── scripts/            # Build scripts (image generation)
```

## License

Private personal website.
