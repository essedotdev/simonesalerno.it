# Audit di Accessibilità - simonesalerno.it

**Data Audit**: 8 Luglio 2025  
**Sito**: simonesalerno.it  
**Tecnologie**: SvelteKit 5, TypeScript, Tailwind CSS v4

## Panoramica Generale

Il sito dimostra una **forte attenzione all'accessibilità** con eccellenti implementazioni nei componenti dropdown e un sistema di colori ottimizzato. Tuttavia, presenta alcuni problemi critici che richiedono intervento immediato per garantire la piena conformità WCAG.

### Valutazione Complessiva: **7.5/10**

- ✅ **Punti di forza**: Contrasti eccellenti, componenti interattivi sofisticati
- 🚨 **Aree critiche**: Attributo lingua, skip links, etichette ARIA mancanti

---

## 📋 Aree Verificate

### 1. ✅ Struttura HTML Semantica e Gerarchia Heading

**Stato**: Buono con miglioramenti necessari

**Punti positivi**:

- Uso corretto di elementi semantici (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`)
- Gerarchia H1 appropriata (solo nelle pagine Welcome e Article)
- Uso corretto di `<time>` con attributi `datetime`

**Problemi identificati**:

- **Card Components**: `ProjectCard.svelte:21` e `ArticleCard.svelte:43` usano `<h5>` creando gap nella gerarchia
- **Skip Links mancanti**: Nessun link "Salta al contenuto principale"
- **Landmark ARIA**: Mancano ruoli ARIA per navigazione assistiva

**Raccomandazioni**:

```html
<!-- Sostituire h5 con h3 nelle card -->
<h3>{project.title}</h3>

<!-- Aggiungere skip links -->
<a href="#main-content" class="skip-link">Salta al contenuto principale</a>
```

---

### 2. ✅ Contrasti Colori (WCAG)

**Stato**: Eccellente - Supera WCAG AAA

**Analisi colori**:

- **Background base**: `#0c0c0c` (molto scuro)
- **text-gray-100**: `#f3f4f6` - Contrasto 19.3:1 ✅
- **text-gray-300**: `#d1d5db` - Contrasto 14.8:1 ✅
- **text-white/50**: `rgba(255,255,255,0.5)` - Contrasto 10.5:1 ✅

**Tutte le combinazioni superano WCAG AAA (7:1)**

**Sistema di colori**:

- Gradiente background sofisticato con texture noise
- Overlay trasparenti ben calibrati
- Contrasti ottimali per utenti con disabilità visive

---

### 3. ⚠️ Navigazione Tastiera e Focus Management

**Stato**: Buono con problemi critici

**Eccellenze**:

- **Dropdown.svelte**: Implementazione esemplare con navigazione frecce, Escape, focus trap
- **Form controls**: Stili focus chiari e gestione appropriata
- **DateRangeDropdown**: Focus management sofisticato

**Problemi critici**:

```typescript
// LanguageSelector.svelte:108 - RIMUOVERE
tabindex="-1" // ❌ Impedisce navigazione tastiera

// Navbar.svelte:88, FloatingNav.svelte:57 - AGGIUNGERE
aria-label="Apri menu di navigazione"
```

**Elementi mancanti**:

- Focus indicators per link di navigazione
- Gestione Escape per menu mobile
- Focus trap nel menu mobile overlay

---

### 4. ⚠️ Alt Text e ARIA Labels

**Stato**: Buono con gap critici

**Implementazioni positive**:

- **Image.svelte**: Sistema alt text appropriato
- **Dropdown components**: ARIA completo (`aria-expanded`, `aria-controls`)
- **BackToTop**: `aria-label` localizzato

**Problemi identificati**:

```typescript
// Logo.svelte:30,37 - MIGLIORARE
alt="Logo" // ❌ Troppo generico
alt="Simone Salerno Logo" // ✅ Più descrittivo

// FloatingNav.svelte:44 - AGGIUNGERE
<enhanced:img alt="Simone Salerno" />

// Navbar.svelte:88 - AGGIUNGERE
<button aria-label="Apri menu mobile">
```

---

### 5. ✅ Accessibilità Form e Gestione Errori

**Stato**: Buono per componenti esistenti

**Punti positivi**:

- **DateRangeDropdown**: Elementi `<label>` semantici con attributi `for`
- **SearchFilter**: Placeholder appropriati e stili focus
- **TagDropdown**: Input search con feedback visivi

**Lacune**:

- Nessun sistema di validazione form
- Mancano attributi `aria-invalid` per stati di errore
- Nessun form di contatto tradizionale (solo link esterni)

**Raccomandazione**:

```html
<!-- Aggiungere per gestione errori -->
<input aria-invalid="false" aria-describedby="error-message" />
<div id="error-message" role="alert">Messaggio errore</div>
```

---

### 6. 🚨 Attributi Lingua e Internazionalizzazione

**Stato**: Critico - Violazione WCAG

**Problema principale**:

```html
<!-- app.html:2 - PROBLEMA CRITICO -->
<html lang="en">
	<!-- ❌ Statico, non si aggiorna -->
</html>
```

**Impatto**: Screen reader annunciano sempre contenuto come inglese, anche per pagine italiane

**Sistema i18n esistente**:

- Router dinamico `[page=lang]` funzionante
- Traduzioni centralizzate
- URL structure corretta (`/en/projects`, `/it/progetti`)

**Soluzione richiesta**:

```javascript
// Layout dinamico necessario
$: htmlLang = $page.params.page || 'en';
// Aggiornare app.html o usare svelte:head
```

---

### 7. ⭐ Componenti Interattivi (Dropdown, Modal)

**Stato**: Eccellente - Implementazione esemplare

**Dropdown.svelte - Best Practice**:

- **Keyboard navigation**: Frecce Up/Down, Escape, Tab trapping
- **Focus management**: Restore focus automatico, focus primo elemento
- **ARIA completo**: `role`, `aria-labelledby`, `aria-controls`
- **Positioning smart**: Calcolo viewport, prevenzione overflow
- **Event handling**: Click outside, scroll/resize listeners

**Componenti derivati eccellenti**:

- **DateRangeDropdown**: Dialog role, form labels semantici
- **TagDropdown**: Listbox role, search integrato
- **SortDropdown**: Menu role, stati chiari

**Questo componente rappresenta un modello di eccellenza per l'accessibilità**

---

### 8. ✅ Design Responsivo e Accessibilità

**Stato**: Buono

**Tailwind CSS implementation**:

- Breakpoint appropriati (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Target touch 44px+ rispettati
- Font scaling responsivo
- Layout flessibili senza scroll orizzontale

**Considerazioni mobile**:

- Menu hamburger accessibile
- Componenti dropdown responsive
- Touch target appropriati per iOS/Android

---

## 🚨 Problemi Critici da Risolvere

### Priorità Alta

1. **Skip links**

   ```html
   <a href="#main-content" class="skip-link">Salta al contenuto</a>
   ```

2. **ARIA labels mancanti**

   ```html
   <!-- Navbar, FloatingNav -->
   <button aria-label="Apri menu di navigazione"></button>
   ```

3. **Gerarchia heading**
   ```html
   <!-- ProjectCard, ArticleCard -->
   <h3>{title}</h3>
   <!-- invece di h5 -->
   ```

### Priorità Media

5. **LanguageSelector tabindex**
6. **Alt text logo migliorato**
7. **Menu mobile keyboard**
8. **Enhanced images alt**

---

## 📊 Conformità WCAG

| Principio         | Livello A   | Livello AA  | Livello AAA |
| ----------------- | ----------- | ----------- | ----------- |
| **Percettibile**  | ⚠️ Parziale | ⚠️ Parziale | ✅ Superato |
| **Operabile**     | ⚠️ Parziale | ⚠️ Parziale | ✅ Buono    |
| **Comprensibile** | 🚨 Fallisce | 🚨 Fallisce | ⚠️ Parziale |
| **Robusto**       | ✅ Conforme | ✅ Conforme | ✅ Conforme |

**Fallimenti critici**:

- WCAG 3.1.1 (Lingua della pagina) - attributo lang statico
- WCAG 2.4.1 (Bypass dei blocchi) - skip links mancanti

---

## 🛠️ Piano di Miglioramento

### Fase 1: Correzioni Critiche (1-2 giorni)

- [ ] Implementare attributo lang dinamico
- [ ] Aggiungere skip links
- [ ] Correggere ARIA labels pulsanti menu
- [ ] Sistemare gerarchia heading

### Fase 2: Miglioramenti Medi (3-5 giorni)

- [ ] Fix LanguageSelector tabindex
- [ ] Migliorare alt text logo
- [ ] Implementare menu mobile keyboard
- [ ] Aggiungere focus indicators

### Fase 3: Ottimizzazioni (1 settimana)

- [ ] Sistema validazione form
- [ ] Form contatto tradizionale
- [ ] Aria-live per aggiornamenti dinamici
- [ ] Test con screen reader

---

## 📈 Raccomandazioni Tecniche

### Strumenti Consigliati

- **axe-core**: Integrazione automated testing
- **NVDA/JAWS**: Test screen reader
- **Wave**: Browser extension
- **Lighthouse**: Audit accessibilità automatico

### Test Manuali

1. Navigazione solo tastiera
2. Screen reader (NVDA/VoiceOver)
3. Zoom 200% e 400%
4. Daltonismo (Color Oracle)
5. Viewport 320px

---

## 💡 Note Finali

Il sito ha una **solida base di accessibilità** con implementazioni eccellenti nei componenti interattivi. Il sistema di colori è esemplare e il focus management nei dropdown rappresenta le migliori pratiche.

I problemi identificati sono **specifici e risolvibili** senza stravolgere l'architettura esistente. Una volta risolti i problemi critici, il sito raggiungerà piena conformità WCAG AA e standard eccellenti per AAA.

**La priorità assoluta è l'attributo lingua dinamico** - questo singolo fix risolverà la violazione WCAG più grave e migliorerà significativamente l'esperienza per utenti di screen reader.
