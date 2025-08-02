# Piano di Implementazione: Generazione Dinamica Open Graph / Twitter Card Images

Questo documento descrive i passaggi per creare un endpoint SvelteKit che genera al volo immagini 1200×630 px ottimizzate per Open Graph e Twitter Card.

---

## 1. Introduzione

Obiettivo: produrre dinamicamente preview cards coese con il branding, in base al tipo di pagina:

- **Home**: fallback con sfondo e logo
- **Listing** (`/progetti`, `/blog`): hero card con titolo e pattern di sfondo
- **Detail** (`/progetti/:slug`, `/blog/:slug`): cover asset + titolo (eventuale estratto)

## 2. Preparazione Asset Grafici

1. Creare un file PSD/AI 1200×630 px:
   - Livello _Background_: pattern/gradient come in `globals.css`
   - Livello _Logo_: logo PNG trasparente (come in `Logo.svelte`)
   - Livello _Titolo_: placeholder testo, font _Geist_
   - Livello _Placeholder Immagine_: box per cover dettagli
2. Esportare in `static/og-assets/`:
   - `bg-pattern.png` (pattern o gradient)
   - `logo.png` (PNG trasparente)
   - Eventuale icona/clip art per sezione

## 3. Dipendenze NPM

```bash
pnpm add @vercel/og
# oppure
pnpm add satori sharp
```

## 4. Endpoint API

File: `src/routes/api/og-image/+server.ts`

- **Query string**:
  - `type`: `home` | `listing` | `detail`
  - `section`: `projects` | `blog` (solo per listing)
  - `title`: string (titolo pagina / dettaglio)
  - `image`: URL immagine di copertina (per detail)
  - `excerpt`: breve descrizione (opzionale, detail)
  - `lang`: `it` | `en` (per layout e testo in lingua)

- **Logica**:
  1. Carica asset comuni (sfondo, logo)
  2. In base a `type`:
     - **home**: solo background + logo centrale
     - **listing**: background + logo + titolo sezione (`Progetti`/`Blog`) + sottotitolo
     - **detail**: background + cover image (rispettando aspect ratio) + titolo + estratto
  3. Render finale via `new ImageResponse(<JSX/>, { width:1200, height:630 })`

## 5. Differenze per Tipo di Pagina

### 5.1 Home

- Query: `?type=home`
- Render:
  - `<img src="/og-assets/bg-pattern.png" />`
  - `<img src="/og-assets/logo.png" style="position:absolute;..." />`
  - Nessun testo addizionale

### 5.2 Listing

- Query: `?type=listing&section=projects&lang=it`
- Render:
  - Sfondo (pattern)
  - Logo in alto a sinistra
  - Titolo centrale: `Progetti` o `Blog` in font Geist
  - Sottotitolo: `Tutti i miei lavori` / `Ultimi articoli`
  - (Opzionale) collage di 3-4 thumbnail prese dai primi elementi

### 5.3 Detail

- Query: `?type=detail&title=Titolo&image=/img/cover.png&excerpt=...`
- Render:
  - Sfondo sfumato + pattern overlay
  - Cover image ritagliata in area dedicata
  - Titolo dinamico, font Geist bold, grandezza adeguata
  - Estratto sotto il titolo (opzionale)

## 6. Integrazione in `+layout.svelte`

```svelte
<svelte:head>
	<!-- ...altri meta -->
	<meta
		property="og:image"
		content={`/api/og-image?type=${isDetail ? 'detail' : isListing ? 'listing' : 'home'}&section=${section}&title=${encodeURIComponent(pageTitle)}&image=${encodeURIComponent(coverUrl)}`}
	/>
</svelte:head>
```

- Calcolare `isDetail`, `isListing`, `section` e `coverUrl` come già fatto per titoli dinamici

## 7. Caching & Deploy

- Aggiungere header `Cache-Control: public, max-age=3600` in `+server.ts`
- Deploy su Edge Functions o CDN (Cloudflare Workers, Vercel Edge) per latenza minima

## 8. Testing

1. Verifica output PNG 1200×630 in locale
2. Usare Social Debugger di Facebook / Twitter Card Validator
3. Controllare fallback quando mancano parametri

---

Con questo piano copriamo tutti i casi: home, liste e dettaglio, con preview sempre coerenti e brandizzate.
