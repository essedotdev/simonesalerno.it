# Piano di Implementazione: Sistema di Ottimizzazione Immagini con enhanced:img

## Panoramica

Questo documento delinea un piano completo per implementare un sistema di ottimizzazione immagini che utilizzi esclusivamente `@sveltejs/enhanced-img` con fallback intelligente a placeholder. Il sistema sarà completamente type-safe, coerente con la codebase attuale e passerà tutti i controlli di linting e build.

## Stato Attuale

### ✅ Già Funzionante
- `@sveltejs/enhanced-img` v0.7.0 installato e configurato in `vite.config.ts`
- `Logo.svelte` utilizza correttamente `<enhanced:img>` con path statici
- Sistema di placeholder già implementato

### ❌ Problemi da Risolvere
- `Image.svelte` usa `<img>` normale con path dinamici
- `ContentRenderer.svelte` carica immagini da JSON con path dinamici
- Nessun mapping tra path JSON e moduli enhanced:img
- Mancanza di type safety per il caricamento immagini

### 📊 Analisi Immagini
- **Totale immagini**: 9 file (2 logo, 2 articoli, 5 icone)
- **Struttura**: `/static/images/articles/`, `/static/logo/`
- **Formati**: Principalmente `.jpg` e `.png`

## Architettura Proposta

### 1. Sistema di Caricamento Immagini Type-Safe

```typescript
// src/lib/utils/imageLoader.ts
interface EnhancedImageModule {
  default: {
    src: string;
    sources: {
      webp: string;
      avif: string;
    };
    img: {
      src: string;
      w: number;
      h: number;
    };
  };
}

interface ImageMap {
  [path: string]: () => Promise<EnhancedImageModule>;
}

interface ProcessedImage {
  enhanced: EnhancedImageModule['default'];
  available: boolean;
}
```

### 2. Componente Image Unificato

```svelte
<!-- src/lib/components/OptimizedImage.svelte -->
<script lang="ts">
  export let src: string | null = null;
  export let alt: string = '';
  export let cssClass: string = '';
  export let sizes: string = '';
  export let loading: 'lazy' | 'eager' = 'lazy';
  
  // Type-safe image loading con fallback automatico
</script>

{#if processedImage?.available}
  <enhanced:img src={processedImage.enhanced} {alt} class={cssClass} {sizes} {loading} />
{:else}
  <!-- Fallback placeholder -->
{/if}
```

### 3. Aggiornamento Tipi

Estendere `src/lib/types/content.ts` per supportare immagini ottimizzate:

```typescript
interface OptimizedImageData {
  originalPath: string;
  enhanced: boolean;
  fallbackToPlaceholder: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface EnhancedContentBlockData extends ContentBlockData {
  optimizedImage?: OptimizedImageData;
}
```

## Piano di Implementazione

### Fase 1: Fondamenta (Giorni 1-2)

#### 1.1 Creare il Sistema di Caricamento Immagini
- [ ] **File**: `src/lib/utils/imageLoader.ts`
- [ ] Implementare `import.meta.glob` per tutte le immagini in `/static/`
- [ ] Creare funzioni helper type-safe per il caricamento
- [ ] Implementare cache intelligente per performance
- [ ] Gestire errori con fallback a placeholder

```typescript
/**
 * Carica dinamicamente un'immagine ottimizzata
 * @param path - Path dell'immagine (es. "/images/articles/test/featured.jpg")
 * @returns Promise con immagine processata o null per fallback
 */
export async function loadOptimizedImage(path: string): Promise<ProcessedImage | null>
```

#### 1.2 Estendere il Sistema di Tipi
- [ ] **File**: `src/lib/types/images.ts` (nuovo)
- [ ] Definire interfacce per immagini ottimizzate
- [ ] Creare type guards per validazione
- [ ] Integrare con il sistema di tipi esistente

#### 1.3 Test del Sistema Base
- [ ] Creare test unit per `imageLoader.ts`
- [ ] Verificare compatibilità TypeScript con `pnpm check`
- [ ] Test di build: `pnpm build`

### Fase 2: Componente Unificato (Giorni 3-4)

#### 2.1 Nuovo Componente OptimizedImage
- [ ] **File**: `src/lib/components/OptimizedImage.svelte`
- [ ] Implementare caricamento asincrono con Svelte 5 runes
- [ ] Gestire stati: loading, success, error
- [ ] Fallback intelligente a placeholder esistente
- [ ] Supporto completo per tutti gli attributi img

#### 2.2 Aggiornare Image.svelte
- [ ] **File**: `src/lib/components/Image.svelte`
- [ ] Refactor per utilizzare `OptimizedImage` internamente
- [ ] Mantenere backward compatibility per prop esistenti
- [ ] Preservare logica placeholder attuale

#### 2.3 Test Componenti
- [ ] Test visivo dei componenti in storybook/browser
- [ ] Verificare performance con immagini esistenti
- [ ] Test responsive design

### Fase 3: Integrazione ContentRenderer (Giorni 5-6)

#### 3.1 Aggiornare ContentRenderer
- [ ] **File**: `src/lib/components/ui/ContentRenderer.svelte`
- [ ] Integrare `OptimizedImage` per blocchi immagine
- [ ] Preservare layout float esistente
- [ ] Mantenere dimensioni e caption

#### 3.2 Aggiornare Sistema ContentBlocks
- [ ] Estendere tipi `ContentBlockData` per supportare ottimizzazione
- [ ] Aggiornare parsing/rendering immagini nei JSON
- [ ] Preservare tutte le funzionalità esistenti (layout, size, etc.)

### Fase 4: Migrazione Componenti (Giorni 7-8)

#### 4.1 Aggiornare Card Components
- [ ] **File**: `src/lib/components/ProjectCard.svelte`
- [ ] **File**: `src/lib/components/ArticleCard.svelte`
- [ ] Sostituire `Image` con `OptimizedImage`
- [ ] Verificare compatibilità con prop esistenti

#### 4.2 Aggiornare Section Components
- [ ] **File**: `src/lib/sections/Project.svelte`
- [ ] **File**: `src/lib/sections/Article.svelte`
- [ ] Integrare nuovo sistema immagini
- [ ] Test con contenuti reali

### Fase 5: Ottimizzazione e Test (Giorni 9-10)

#### 5.1 Performance e Cache
- [ ] Implementare preloading intelligente
- [ ] Ottimizzare cache del browser
- [ ] Lazy loading avanzato per immagini fuori viewport

#### 5.2 Test Completi
- [ ] **Lint**: `pnpm lint` deve passare
- [ ] **Type Check**: `pnpm check` deve passare  
- [ ] **Build**: `pnpm build` deve completarsi
- [ ] Test manuale di tutte le pagine
- [ ] Test responsive su diversi dispositivi
- [ ] Test performance Lighthouse

#### 5.3 Documentazione
- [ ] Aggiornare `CLAUDE.md` con nuove convenzioni
- [ ] Documentare API `imageLoader.ts`
- [ ] Esempi d'uso per futuri sviluppi

## Dettagli Tecnici

### Struttura File da Creare/Modificare

```
src/lib/
├── components/
│   ├── OptimizedImage.svelte          [NUOVO]
│   ├── Image.svelte                    [MODIFICATO]
│   ├── ui/ContentRenderer.svelte       [MODIFICATO]
│   ├── ProjectCard.svelte              [MODIFICATO]
│   └── ArticleCard.svelte              [MODIFICATO]
├── types/
│   ├── images.ts                       [NUOVO]
│   └── content.ts                      [MODIFICATO]
├── utils/
│   └── imageLoader.ts                  [NUOVO]
└── sections/
    ├── Project.svelte                  [MODIFICATO]
    └── Article.svelte                  [MODIFICATO]
```

### Configurazione Vite Enhanced

```typescript
// vite.config.ts - Ottimizzazione avanzata
export default defineConfig({
  plugins: [
    tailwindcss(), 
    enhancedImages({
      // Configurazione ottimizzata per il progetto
      compression: 0.8,
      formats: ['avif', 'webp', 'auto'],
      widths: [400, 800, 1200, 1600, 2000],
      densities: [1, 2],
      quality: 85
    }), 
    sveltekit()
  ]
});
```

### Pattern import.meta.glob

```typescript
// Strategia di caricamento immagini
const imageModules = import.meta.glob(
  [
    '/static/**/*.{jpg,jpeg,png,webp,avif}',
    '/static/**/*.{JPG,JPEG,PNG,WEBP,AVIF}'
  ],
  {
    eager: false, // Lazy loading
    query: {
      enhanced: true,
      w: '400;800;1200;1600;2000',
      q: '85'
    }
  }
);
```

## Vantaggi del Sistema Proposto

### ✅ Performance
- Formati next-gen automatici (AVIF, WebP)
- Dimensioni multiple per responsive design
- Lazy loading nativo
- Cache ottimizzata

### ✅ Developer Experience
- Type safety completa
- Hot reload preservato
- Backward compatibility
- Error handling robusto

### ✅ Manutenibilità
- Sistema centralizzato
- Fallback automatici
- Logging dettagliato
- Testing completo

## Rischi e Mitigazioni

### 🚨 Rischio: Build Time Aumentato
**Mitigazione**: Cache intelligente, processamento parallelo, ottimizzazione glob patterns

### 🚨 Rischio: Regressioni UI
**Mitigazione**: Test visivo completo, backward compatibility, rollback plan

### 🚨 Rischio: Type Errors
**Mitigazione**: Implementazione graduale, test incrementali, strict TypeScript

## Timeline

| Fase | Durata | Deliverables |
|------|--------|-------------|
| 1 | 2 giorni | Sistema base + tipi |
| 2 | 2 giorni | Componente unificato |
| 3 | 2 giorni | ContentRenderer integrato |
| 4 | 2 giorni | Migrazione componenti |
| 5 | 2 giorni | Test + ottimizzazione |

**Totale**: 10 giorni lavorativi

## Criteri di Successo

- [ ] ✅ `pnpm lint` passa senza errori
- [ ] ✅ `pnpm check` passa senza errori TypeScript
- [ ] ✅ `pnpm build` completa correttamente
- [ ] ✅ Tutte le immagini caricano con enhanced:img
- [ ] ✅ Fallback placeholder funziona correttamente
- [ ] ✅ Performance migliorata (Lighthouse score)
- [ ] ✅ Zero regressioni UI
- [ ] ✅ Type safety al 100%

---

*Questo piano garantisce un'implementazione solida, type-safe e performante del sistema di ottimizzazione immagini, mantenendo la coerenza con l'architettura esistente del progetto.*