# Cycles

Log cronologico dei cicli di lavoro sul progetto. Ogni ciclo registra obiettivo,
lavoro svolto (con riferimenti ai commit), verifiche e cosa resta. Serve a riprendere
il filo tra una sessione e l'altra. La pianificazione ad alto livello vive in
`docs/Roadmap.md`.

---

## Ciclo 1 - Overhaul di qualità (2026-05-31)

### Obiettivo

Partito dalla review del lavoro non committato (un refactor "slug map" lasciato in
sospeso), è diventato un audit completo del progetto e un overhaul di qualità in
6 fasi (sicurezza, test, OG, SEO/a11y, performance, code quality/docs).

### Parte A - Recupero contesto e fix iniziali (committata e pushata)

Recuperato il contesto del lavoro in sospeso (refactor slug map per non caricare
tutte le lingue nel layout). Review adversariale del diff: trovato che il refactor
era incompleto e un paio di pezzi pre-esistenti da chiudere. Applicati i fix e
disabilitato l'effetto hero PixelBlast (tenuto per riattivazione futura).

- `0b115e9`..`40a2234` erano già presenti; questo ciclo ha aggiunto e pushato:
- `feat`/`fix` slug map (layout per-lingua + slug-map.json + LanguageSelector)
- `fix`: `findContentBySlug` passa `lang`; generatore slug-map reso deterministico
  (`readdirSync` ordinato); `featuredImagePlaceholder` cablato nei card
- `chore`: disabilitazione PixelBlast hero (commit `74c9ee0`, ultimo pushato)

### Parte B - Audit completo (analisi)

Audit multi-dimensionale (sicurezza app/infra, correttezza, performance,
manutenibilità). Esiti principali, poi affrontati nelle fasi sotto:

- perf: `hooks.server.ts` ricaricava tutte le lingue sui redirect
- correttezza: mismatch type/schema (`featuredImagePlaceholder`, `typewriter`)
- sicurezza: nessun security header/CSP; reflected XSS in `/api/og-preview`; 2 vuln
  transitive (rollup HIGH build-only, cookie LOW)
- manutenibilità: zero test, doc minima
- Decisione chiave: pipeline OG portata a build-time (vedi M3) invece di hardening
  dell'endpoint runtime - per contenuti statici è la scelta migliore (zero compute
  runtime, zero superficie injection). Verificata la fattibilità su Cloudflare:
  la generazione gira nel build (Node), mai sul Worker.
- Falso positivo dell'audit: `<html lang>` risultava mancante ma è già gestito in
  `app.html` + hook.

### Parte C - Fasi 1-3 dell'overhaul (committate, NON ancora pushate)

10 commit su `main`, da `731c8db` a `bd09838`:

Fase 1 - Sicurezza & correttezza

- `731c8db` perf(i18n): hooks usa la slug map
- `e91a1cd` fix(content): `featuredImagePlaceholder` boolean + rimozione `typewriter`
- `7a5152b` feat(security): CSP + security headers
- `155a434` chore(security): override `cookie`/`rollup`, bump `compatibility_date`
- `9bdc958` chore: smesso di tracciare `image-assets.ts` (già gitignored)

Fase 2 - Test suite

- `1db3caa` test: setup Vitest + unit suite (ContentLoader, schemi, slug-map, OG)
- `e280ef4` refactor(i18n): estratto `getLanguageUrl` in util puro
- `1443a18` test(e2e): suite Playwright routing + unit `getLanguageUrl`

Fase 3 - OG build-time

- `246d6aa` feat(og): pre-generazione OG a build time, rimossi endpoint runtime
- `bd09838` test(og): escape HTML + serving OG statiche

### Verifiche (a fine ciclo)

- `pnpm audit`: 0 vulnerabilità
- `pnpm check` (svelte-check): 0 errori / 0 warning
- `pnpm lint` (prettier + eslint): pulito
- `pnpm build`: OK end-to-end (genera 57 OG e le copia nell'output worker)
- `pnpm test`: 129 unit verdi; Playwright: 10 E2E verdi

### Cosa resta (prossimo ciclo)

- Fasi 4-6 della Roadmap (SEO/i18n/a11y, performance/bundle/assets, code
  quality/DX/docs).
- Push del blocco Fasi 1-3 (10 commit) quando deciso.
- Aggiornamento finale della documentazione.

### Note / debito noto

- Il ramo "detail con cover image" dell'OG generator usa il placeholder finché
  `image-assets.ts` resta vuoto (nessun `og_image_key` risolvibile). Dimensioni img
  spostate nello `style` per compatibilità satori.
- `PixelBlast` e le deps `three`/`postprocessing` sono tenute apposta per una futura
  riattivazione dell'hero, anche se attualmente inutilizzate.
