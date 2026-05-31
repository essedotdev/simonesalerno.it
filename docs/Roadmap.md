# Roadmap

Stato corrente del progetto. Milestone reali, non wishlist. Aggiornata insieme al codice.

Ultimo aggiornamento: 2026-05-31

## Contesto

`simonesalerno.it` è un portfolio personale (SvelteKit 2 + Svelte 5 + TS strict +
Tailwind 4) su Cloudflare Workers, con contenuti file-based JSON validati con Zod,
i18n hand-rolled (EN/IT) e immagini OG. È in produzione.

È in corso un overhaul di qualità in 6 fasi, nato da un audit completo
(sicurezza, correttezza, performance, manutenibilità). Vedi `docs/Cycles.md` per il
log dettagliato del lavoro svolto.

## Milestone

### M1 - Sicurezza & correttezza - ✅ Completata (2026-05-31)

- Redirect i18n in `hooks.server.ts` usano la slug map leggera (niente più load
  all-lingue per richiesta).
- `featuredImagePlaceholder` allineato a `boolean` su type + schema runtime + build;
  rimosso il campo orfano `typewriter`.
- CSP (via SvelteKit) + header di sicurezza (`X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
- Vulnerabilità transitive risolte via pnpm overrides (`cookie`, `rollup`) →
  `pnpm audit` a zero; `compatibility_date` wrangler aggiornata.

### M2 - Test suite - ✅ Completata (2026-05-31)

- Vitest (unit) + Playwright (E2E) configurati da zero.
- 129 unit test: `ContentLoader` (tutti i metodi), schemi Zod su tutti i contenuti
  reali, generatore slug-map, OG html-generator + escape, `getLanguageUrl`.
- 10 E2E: redirect i18n, traduzione route, 404, sitemap+hreflang, render dettaglio
  EN/IT, og:image servita.
- `getLanguageUrl` estratto in util puro testabile.

### M3 - OG build-time - ✅ Completata (2026-05-31)

- OG generate a build time (satori + resvg + sharp via vite-node), 57 PNG statici
  in `static/og/`. Rimossi gli endpoint runtime `/api/og` e `/api/og-preview` e la
  dipendenza `workers-og`. Escape HTML su title/excerpt.

### M4 - SEO / i18n / a11y - ⏳ Da fare

- `<link rel="canonical">`, `<link rel="alternate" hreflang>`, JSON-LD
  (`Organization` + `Article`/`BlogPosting`), `robots.txt` rivisto.
- Skip-to-content link, `prefers-reduced-motion`, focus trap nei Dropdown, audit
  `alt`/aria.
- Nota: `<html lang>` è già corretto (via `app.html` + hook), non era un gap.

### M5 - Performance / bundle / assets - ⏳ Da fare

- `Promise.all` nei load del layout, sitemap per-lingua, sort per stringa ISO,
  `Cache-Control` su HTML.
- Rimozione `noise-original.png` (576KB) + ottimizzazione `noise.png`; logo PNG
  inutilizzati; parsing srcset di `OptimizedImage` più robusto.

### M6 - Code quality / DX / docs - ⏳ Da fare

- `ContentLoader`: estrarre un `loadCollection<T>` generico (elimina la
  duplicazione projects/articles); consistenza naming.
- `.editorconfig`, GitHub Actions CI (`lint + check + build + test`).
- `CLAUDE.md` di progetto + `docs/ARCHITECTURE.md`.

## Stato deploy

Le Milestone M1-M3 sono committate su `main` (locali, non ancora pushate al momento
dell'ultimo aggiornamento). Il deploy avviene via Cloudflare Workers Builds al push.
