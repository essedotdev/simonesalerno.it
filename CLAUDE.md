# CLAUDE.md - simonesalerno.it

Portfolio personale: SvelteKit 2 + Svelte 5 (runes) + TS strict + Tailwind 4,
deploy su Cloudflare Workers. Contenuti file-based JSON, i18n hand-rolled EN/IT,
OG pre-generate. Il perché delle scelte sta in `docs/ARCHITECTURE.md`; stato e
log in `docs/Roadmap.md` e `docs/Cycles.md` (tienili aggiornati a fine ciclo).

## Comandi

- `pnpm dev` - dev server (vite) su :5173.
- `pnpm build` - catena: `validate-content` -> `generate-images` ->
  `generate-slug-map` -> `generate-og-images` -> `vite build`.
- `pnpm check` - svelte-check (type check).
- `pnpm lint` - prettier --check + eslint. `pnpm format` per scrivere.
- `pnpm test:unit` - Vitest. `pnpm test:e2e` - Playwright. `pnpm test:ci` - tutti.
- `pnpm deploy` - build + wrangler deploy.

Giro di qualità prima di un commit non banale e SEMPRE prima di un push:
`pnpm lint && pnpm check && pnpm build && pnpm test:ci`. Non c'è CI remota: il
deploy avviene via Cloudflare Workers Builds al push, il gate di qualità è locale.

## Contenuti

- Vivono in `src/lib/content/` (config, pagine, `projects/<id>/`, `articles/<id>/`).
- Validati da Zod: schemi in `src/lib/schemas/content.ts`, tipi in
  `src/lib/types/content.ts`. Aggiungendo un campo aggiorna ENTRAMBI (schema +
  tipo), altrimenti type check o validazione falliscono.
- `ContentLoader` (`src/lib/utils/content.ts`) è l'unico accesso ai contenuti:
  cachea per istanza, carica le traduzioni lazy. Progetti e articoli passano per
  `loadCollection<T>`; non duplicare la logica nei wrapper.

## i18n

- Route `[page=lang]/[route=route]/[sub]`, matcher in `src/params/`.
- Redirect smart in `src/hooks.server.ts` (lingua/route/slug nella lingua
  sbagliata -> URL canonico) basati sulla slug map.
- `slug-map.json` è GENERATO (`scripts/generate-slug-map.ts`) e rigenerato in
  build: non modificarlo a mano.
- URL per lingua: usa `getLanguageUrl` (puro, testato). SEO (canonical/hreflang/
  JSON-LD): helper puri in `src/lib/utils/seo.ts`, cablati nel `+layout.svelte`.

## Open Graph

- PNG statici in `static/og/`, generati da `scripts/generate-og-images.ts`
  (satori -> resvg -> sharp) via `vite-node --config vite.og.config.ts`.
- NON committati (gitignored): artefatto di build, rigenerato a ogni build. In CI
  gli E2E richiedono che `pnpm build` giri prima (servono le OG su disco).
- Niente endpoint OG runtime. Il layout risolve un filename deterministico.
- Gotcha satori: font `woff`/`ttf` (mai `woff2`); dimensioni img nello `style`,
  non come attributi `width`/`height`.

## Convenzioni

- `pnpm` sempre (mai npm/yarn). Tab, 100 colonne, single quote, no trailing comma
  (vedi `.prettierrc`, `.editorconfig`).
- Tailwind 4 CSS-first (`@theme` in `src/lib/styles/globals.css`), niente
  `tailwind.config`.
- Codice e identificatori in inglese, UI in italiano. Accenti italiani corretti
  (a e i o u con accento), mai apostrofo al posto dell'accento. Niente em dash,
  mai il carattere section sign.
- Commit: Conventional Commits in inglese, atomici (un'unità logica per commit).
  Push solo su comando esplicito.

## Non toccare senza motivo

- `PixelBlast` e le dipendenze `three`/`postprocessing` sono tenute apposta per
  una futura riattivazione dell'hero, anche se ora inutilizzate.
- CSP in `svelte.config.js` e header in `hooks.server.ts`: se aggiungi domini
  esterni (script/font/connect) aggiorna la CSP o verranno bloccati.
