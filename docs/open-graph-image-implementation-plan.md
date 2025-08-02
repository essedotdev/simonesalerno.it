# Piano di Implementazione: Generazione Dinamica Open Graph / Twitter Card Images

Questo documento descrive i passaggi per creare un endpoint SvelteKit che genera al volo immagini 1200×630 px ottimizzate per Open Graph e Twitter Card.

---

## 1. Introduzione

Obiettivo: produrre dinamicamente preview cards coese con il branding, in base al tipo di pagina:

- **Home**: fallback con sfondo e logo
- **Listing** (`/progetti`, `/blog`): hero card con titolo e pattern di sfondo
- **Detail** (`/progetti/:slug`, `/blog/:slug`): cover asset + titolo (eventuale estratto)

## 2. Preparazione Asset Grafici

1. Utilizzare direttamente il gradient CSS definito in `globals.css` come background per le immagini Open Graph, per garantire coerenza visiva e semplicità di manutenzione.
2. Esportare in `static/og-assets/` solo gli asset necessari:
   - `logo.png` (PNG trasparente, come in `Logo.svelte`)
   - Eventuale icona/clip art per sezione

## 3. Dipendenze NPM

```bash
# Opzione consigliata per SvelteKit + Cloudflare Workers
pnpm add satori resvg-js
# oppure per maggiore controllo
pnpm add @resvg/resvg-js @satori/wasm
```

**Perché non @vercel/og**: Non è ottimizzato per Cloudflare Workers e ha dipendenze che potrebbero non funzionare correttamente nell'ambiente Workers. `satori` + `resvg-js` è più leggero e compatibile.

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
  1. Importa `ContentLoader` per accedere alle traduzioni e configurazioni
  2. Carica asset comuni (logo da `/static/og-assets/logo.png` convertito in base64)
  3. Crea oggetto HTML-like (non JSX) con il gradient CSS convertito in formato SVG
  4. In base a `type`:
     - **home**: solo background + logo centrale
     - **listing**: background + logo + titolo sezione localizzato + sottotitolo
     - **detail**: background + cover image (se disponibile) + titolo + estratto
  5. Usa `satori` per convertire oggetto HTML in SVG
  6. Usa `resvg-js` per convertire SVG in PNG 1200×630
  7. Restituisce `Response` con headers appropriati e cache

- **Struttura della route**:

  ```typescript
  import type { RequestHandler } from './$types';
  import satori from 'satori';
  import { Resvg } from '@resvg/resvg-js';
  import { ContentLoader } from '$lib/utils/content';
  import { readFileSync } from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';

  export const GET: RequestHandler = async ({ url, platform }) => {
  	// Parsing parametri
  	// Caricamento dati con ContentLoader
  	// Caricamento logo da static/og-assets/logo.png
  	// Generazione oggetto HTML per satori (non JSX!)
  	// Conversione in PNG con resvg
  	// Response con headers cache
  };
  ```

## 5. Differenze per Tipo di Pagina

### 5.1 Home

- Query: `?type=home&lang=it`
- Render:
  - Background SVG con gradient convertito da CSS:
    ```svg
    <defs>
      <radialGradient id="bg1" cx="0%" cy="90.68%">
        <stop offset="0%" stop-color="#20327e"/>
        <stop offset="50%" stop-color="transparent"/>
      </radialGradient>
      <!-- Altri gradienti... -->
    </defs>
    ```
  - Logo PNG incorporato come base64 o caricato come asset statico
  - Nessun testo addizionale

### 5.2 Listing

- Query: `?type=listing&section=projects&lang=it`
- Render:
  - Sfondo SVG con gradient
  - Logo in alto a sinistra (caricato come asset statico)
  - Titolo centrale: dinamico usando `ContentLoader` per traduzioni
    - `loader.loadPage('projects', lang)` → `title`
    - `loader.loadPage('blog', lang)` → `title`
  - Sottotitolo: estratto dalla stessa pagina o testo fisso localizzato
  - Font Geist caricato da Google Fonts o asset locale
  - (Opzionale) pattern decorativo SVG invece di thumbnail

### 5.3 Detail

- Query: `?type=detail&title=Titolo&image=/img/cover.png&excerpt=...&lang=it`
- Render:
  - Sfondo SVG con gradient
  - Cover image: se presente, fetch dall'URL e incorpora come base64, altrimenti placeholder o pattern
  - Titolo dinamico: passato via query string, font Geist bold
  - Estratto: sotto il titolo, troncato se troppo lungo
  - Layout responsive: se l'immagine è presente, split 60/40, altrimenti solo testo centrato

## 6. Integrazione in `+layout.svelte`

```svelte
<!-- Nei layouts o page che generano meta tags -->
<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Calcola il tipo di pagina dal pathname
	$: isHome = url.pathname === '/' || url.pathname === `/${data.selectedLanguage}`;
	$: isListing = url.pathname.includes('/progetti') || url.pathname.includes('/blog');
	$: isDetail = !isHome && !isListing;

	// Determina section e altri parametri
	$: section = url.pathname.includes('/progetti')
		? 'projects'
		: url.pathname.includes('/blog')
			? 'blog'
			: '';

	// Costruisci URL OG image
	$: ogImageUrl = (() => {
		const params = new URLSearchParams({
			type: isDetail ? 'detail' : isListing ? 'listing' : 'home',
			lang: data.selectedLanguage,
			...(section && { section }),
			...(pageTitle && { title: pageTitle }),
			...(coverImage && { image: coverImage }),
			...(excerpt && { excerpt })
		});
		return `/api/og-image?${params.toString()}`;
	})();
</script>

<svelte:head>
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImageUrl} />
</svelte:head>
```

- Utilizza i dati già caricati in `+layout.server.ts` tramite `ContentLoader`
- Calcola dinamicamente il tipo di pagina e i parametri necessari

## 7. Caching & Deploy

- Headers di cache in `+server.ts`:
  ```typescript
  return new Response(pngBuffer, {
  	headers: {
  		'Content-Type': 'image/png',
  		'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  		'CDN-Cache-Control': 'max-age=86400',
  		'Cloudflare-CDN-Cache-Control': 'max-age=86400'
  	}
  });
  ```
- Deploy automatico su Cloudflare Workers via `@sveltejs/adapter-cloudflare`
- Caching lato Cloudflare per ridurre generazioni ripetute
- Considera cache locale in Workers KV per immagini generate frequentemente

## 8. Implementazione Pratica

### 8.1 Struttura del gradient SVG

Conversione del CSS gradient in formato SVG:

```typescript
const createBackgroundSVG = () => `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg1" cx="0%" cy="90.68%" r="50%">
        <stop offset="0%" stop-color="#20327e"/>
        <stop offset="50%" stop-color="transparent"/>
      </radialGradient>
      <radialGradient id="bg2" cx="96.57%" cy="2.62%" r="50%">
        <stop offset="0%" stop-color="#131b49"/>
        <stop offset="50%" stop-color="transparent"/>
      </radialGradient>
      <radialGradient id="bg3" cx="46.13%" cy="45.15%" r="50%">
        <stop offset="0%" stop-color="#000000"/>
        <stop offset="50%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#0c0c0c"/>
    <rect width="1200" height="630" fill="url(#bg1)"/>
    <rect width="1200" height="630" fill="url(#bg2)"/>
    <rect width="1200" height="630" fill="url(#bg3)"/>
  </svg>
`;
```

### 8.2 Caricamento assets statici

```typescript
// In Cloudflare Workers, caricare file da static/ richiede un approccio diverso
// Opzione 1: Convertire logo in base64 durante build e importarlo
import logoBase64 from '$lib/assets/logo-base64.js';

// Opzione 2: Fetch dal path pubblico (se accessibile nell'ambiente Workers)
const logoResponse = await fetch('/og-assets/logo.png');
const logoBuffer = await logoResponse.arrayBuffer();
const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)));

// Opzione 3: Bundled asset (consigliato)
// Creare un file che esporta il logo come stringa base64
```

### 8.3 Struttura HTML per satori

```typescript
// Satori non usa JSX ma oggetti JavaScript che rappresentano HTML
const htmlStructure = {
	type: 'div',
	props: {
		style: {
			width: '1200px',
			height: '630px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			background: 'linear-gradient(...)', // Gradient semplificato per satori
			fontFamily: 'Geist'
		},
		children: [
			{
				type: 'img',
				props: {
					src: `data:image/png;base64,${logoBase64}`,
					width: 150,
					height: 150
				}
			},
			title && {
				type: 'h1',
				props: {
					style: { fontSize: '48px', color: '#ffffff', textAlign: 'center' },
					children: title
				}
			}
		].filter(Boolean)
	}
};
```

## 9. Testing

1. Test locale con `pnpm dev` e visita `http://localhost:5173/api/og-image?type=home&lang=it`
2. Verifica output PNG 1200×630 e dimensioni file (idealmente < 200KB)
3. Test deploy su Cloudflare Workers con `pnpm build && wrangler pages dev .svelte-kit/cloudflare`
4. Usare Social Debugger di Facebook / Twitter Card Validator per validazione esterna
5. Controllare fallback quando mancano parametri o si verificano errori
6. Performance test: tempo di generazione dovrebbe essere < 1000ms

---

## 10. Considerazioni Aggiuntive

### 10.1 Fallback e Error Handling

- Immagine di fallback statica in caso di errori nella generazione
- Validazione rigorosa dei parametri di input
- Timeout per fetch di immagini esterne (max 5 secondi)

### 10.2 Ottimizzazioni

- Cache delle immagini generate in Workers KV (opzionale)
- Compressione PNG ottimizzata
- Lazy loading del font per ridurre cold start

### 10.3 Alternative Tecniche

Se `satori` + `resvg-js` risultassero troppo pesanti per Workers:

- Canvas API (se supportata in futuro da Cloudflare)
- Generazione statica durante build per contenuti fissi
- Servizio esterno dedicato (Cloudinary, Bannerbear)
- Approccio ibrido: template SVG con sostituzione stringhe + conversione PNG

### 10.4 Asset Management

- **Logo**: Convertire `static/og-assets/logo.png` in base64 e bundlarlo nel codice
- **Font**: Scaricare Geist font e includerlo come asset del Worker
- **Cover images**: Per le immagini dinamiche, usare fetch con timeout e fallback

Con questo piano aggiornato copriamo tutti i casi usando tecnologie native e compatibili con l'architettura SvelteKit + Cloudflare Workers, mantenendo coerenza con il sistema di contenuti esistente e le traduzioni.
