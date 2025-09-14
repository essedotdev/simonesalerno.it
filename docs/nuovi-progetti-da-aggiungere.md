# Nuovi Progetti da Aggiungere

**Data creazione documento**: 10 settembre 2025

## Struttura Files Necessari

Ogni progetto richiede questi 3 file:

```
src/lib/content/projects/{slug}/
├── meta.json     # Metadati del progetto
├── it.json       # Contenuto in italiano  
└── en.json       # Contenuto in inglese
```

---

## 1. BUDOKAN

### ✅ **Dati Disponibili:**
- **Slug**: `budokan`
- **Titolo**: `Budokan Polisportiva`
- **Link**: `https://budokan.it`
- **Tecnologie**: `SvelteKit`, `Sanity`
- **Categoria**: `Sport/Fitness`
- **Tipo**: Sito per palestra
- **Descrizione base**: Sito per palestra con sistema mail per richieste prove gratuite e gestione contenuti tramite Sanity
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10

### ❌ **Dati Mancanti:**
- [ ] **Tags finali** (es. ["SvelteKit", "Sanity", "Sport", "CMS"])
- [ ] **Descrizione dettagliata** per `body.blocks`
- [ ] **Image caption** per featured.png
- [ ] **Traduzioni inglesi** complete
- [ ] **og_image_key** (es. "budokanFeatured")

---

## 2. CREATIVIUM

### ✅ **Dati Disponibili:**
- **Slug**: `creativium`
- **Tipo**: Piattaforma login/SaaS
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10
- **Link**: ❌ (nessun link)

### ❌ **Dati Mancanti:**
- [ ] **Titolo** definitivo
- [ ] **Categoria** (es. SaaS, Auth, Tools)
- [ ] **Tecnologie** stack completo
- [ ] **Descrizione breve** e dettagliata
- [ ] **Tags**
- [ ] **Image caption**
- [ ] **Traduzioni inglesi**
- [ ] **og_image_key**

---

## 3. DOPPIA CODEX

### ✅ **Dati Disponibili:**
- **Slug**: `doppia-codex`
- **Titolo**: `Doppia Codex`
- **Tipo**: Blog tecnologico
- **Tagline**: "Curiosities across space, crypto, and the unknown"
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10
- **Link**: ❌ (nessun link)

### ❌ **Dati Mancanti:**
- [ ] **Categoria** (es. Blog, Tech, Crypto)
- [ ] **Tecnologie** stack completo
- [ ] **Descrizione** italiana e inglese dettagliata
- [ ] **Tags**
- [ ] **Image caption**
- [ ] **og_image_key**

---

## 4. KEBABBIVORI

### ✅ **Dati Disponibili:**
- **Slug**: `kebabbivori`
- **Titolo**: `Kebabbivori`
- **Link**: `https://kebabbivori.it`
- **Tipo**: App recensioni ristoranti/kebab
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10

### ❌ **Dati Mancanti:**
- [ ] **Categoria** (es. Food, Reviews, Mobile)
- [ ] **Tecnologie** stack completo
- [ ] **Descrizione** breve e dettagliata
- [ ] **Tags**
- [ ] **Image caption**
- [ ] **Traduzioni inglesi**
- [ ] **og_image_key**

---

## 5. PLANNERINATOR

### ✅ **Dati Disponibili:**
- **Slug**: `plannerinator`
- **Titolo**: `Plannerinator`
- **Tipo**: Project management app
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10
- **Link**: ❌ (nessun link)

### ❌ **Dati Mancanti:**
- [ ] **Categoria** (es. Productivity, Management, Tools)
- [ ] **Tecnologie** stack completo
- [ ] **Descrizione** breve e dettagliata
- [ ] **Tags**
- [ ] **Image caption**
- [ ] **Traduzioni inglesi**
- [ ] **og_image_key**

---

## 6. S-MAIL

### ✅ **Dati Disponibili:**
- **Slug**: `s-mail`
- **Titolo**: `S-Mail`
- **Link**: `https://smail.essedev.it`
- **Tipo**: Servizio web
- **Categoria**: `Comunicazione`
- **Tecnologie**: `TypeScript`, `Tailwind`
- **Descrizione**: Piattaforma che semplifica l'invio di email per le tue applicazioni. Gestisci progetti e template in un unico posto, con un sistema di invio sicuro e personalizzabile.
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10

### ❌ **Dati Mancanti:**
- [ ] **Tags finali** (es. ["TypeScript", "Tailwind", "Email", "Communication"])
- [ ] **Descrizione dettagliata** per `body.blocks`
- [ ] **Image caption**
- [ ] **Traduzioni inglesi** complete
- [ ] **og_image_key** (es. "sMailFeatured")

---

## 7. VERBOSA

### ✅ **Dati Disponibili:**
- **Slug**: `verbosa`
- **Titolo**: `Verbosa`
- **Link**: `https://verbosa.it`
- **Tipo**: Chat AI multi-provider
- **Categoria**: `AI/Tools`
- **Tecnologie**: `Flutter`, `Go`
- **Descrizione base**: Chat AI multi-provider, attualmente supporta Gemini
- **Status**: `completed`
- **Date**: created_date: 2025-09-10, updated_date: 2025-09-10

### ❌ **Dati Mancanti:**
- [ ] **Tags finali** (es. ["Flutter", "Go", "AI", "Chat", "Gemini"])
- [ ] **Descrizione dettagliata** per `body.blocks`
- [ ] **Image caption**
- [ ] **Traduzioni inglesi** complete
- [ ] **og_image_key** (es. "verbosaFeatured")

---

## Progetti con Info Complete (Riferimenti)

### ETHICODE ✅
- **Tutti i dati**: Disponibili dal portfolio esistente
- **Categoria**: Istruzione
- **Tech**: SvelteKit, Tailwind

---

## Template JSON da Completare

### meta.json
```json
{
    "id": "{slug}",
    "images": ["images/projects/{slug}/featured.png"],
    "featured_image": "images/projects/{slug}/featured.png", 
    "featuredImagePlaceholder": false,
    "og_image_key": "{slug}Featured",
    "link": "{url}" // OPZIONALE,
    "published": true,
    "status": "completed",
    "created_date": "2025-09-10",
    "updated_date": "2025-09-10"
}
```

### it.json
```json
{
    "slug": "{slug}",
    "title": "{titolo}",
    "description": "{descrizione_breve}",
    "body": {
        "blocks": [
            {
                "type": "paragraph",
                "data": {
                    "text": "{descrizione_dettagliata}"
                }
            }
        ]
    },
    "image_captions": ["{caption_immagine}"],
    "tags": ["{tag1}", "{tag2}", "{tag3}"]
}
```

### en.json  
```json
{
    "slug": "{slug}",
    "title": "{title_english}",
    "description": "{description_english}",
    "body": {
        "blocks": [
            {
                "type": "paragraph",
                "data": {
                    "text": "{detailed_description_english}"
                }
            }
        ]
    },
    "image_captions": ["{image_caption_english}"],
    "tags": ["{tag1_en}", "{tag2_en}", "{tag3_en}"]
}
```

---

## Tags Suggeriti per Uniformità

**Tecnologie**: SvelteKit, TypeScript, Tailwind, Flutter, Go, Sanity, React, Vue, Next.js
**Categorie**: AI, Tools, Communication, Sport, Food, Productivity, Blog, Auth, E-learning
**Tipologie**: Web App, Mobile App, Dashboard, Website, Platform, Service

---

## Prossimi Passi

1. [ ] Completare le informazioni mancanti per ogni progetto
2. [ ] Definire tag standardizzati  
3. [ ] Creare le traduzioni inglesi
4. [ ] Generare i file JSON per tutti i progetti
5. [ ] Testare l'integrazione nel sito