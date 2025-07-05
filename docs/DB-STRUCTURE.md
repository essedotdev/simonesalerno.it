# Documentazione Struttura Database - simonesalerno.it

## Panoramica

Questo documento descrive la struttura del database Directus utilizzato per il sito web simonesalerno.it. Il database è configurato per supportare contenuti multilingue (Italiano e Inglese) e gestisce informazioni personali, progetti e contatti.

## Connessione MCP Directus

✅ **Stato connessione**: Attiva  
👤 **Utente corrente**: Admin User (doppiaesse@proton.me)  
🆔 **ID Utente**: 4d04f155-01cc-498a-b7f9-8ab683147d67

---

## Struttura delle Collezioni

### 1. 🌐 **languages**

Gestisce le lingue supportate dal sito web.

**Campi:**

- `code` (string, PK) - Codice lingua (es. "en", "it")
- `name` (string) - Nome della lingua (es. "English", "Italiano")

**Dati attuali:**

- Inglese (`en`)
- Italiano (`it`)

---

### 2. 🌍 **global**

Configurazioni globali del sito con supporto multilingue.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `translations` (alias) - Relazione alle traduzioni

**Traduzioni:** `global_translations`

---

### 3. 🌍 **global_translations**

Traduzioni per le configurazioni globali.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `global_id` (integer) - Riferimento a global
- `languages_code` (string) - Codice lingua
- `title` (string) - Titolo del sito
- `keywords` (json) - Parole chiave SEO
- `navigation` (json) - Struttura di navigazione
- `description` (text) - Descrizione del sito
- `interface` (json) - Configurazioni interfaccia

---

### 4. 🏠 **welcome**

Sezione di benvenuto/homepage.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `translations` (alias) - Relazione alle traduzioni

**Traduzioni:** `welcome_translations`

---

### 5. 🏠 **welcome_translations**

Traduzioni per la sezione welcome.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `welcome_id` (integer) - Riferimento a welcome
- `languages_code` (string) - Codice lingua
- `title` (string) - Titolo della sezione
- `typewriter` (json) - Testi per effetto typewriter
- `description` (json) - Descrizione con editor a blocchi

---

### 6. 👤 **about**

Sezione "Chi sono".

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `translations` (alias) - Relazione alle traduzioni

**Traduzioni:** `about_translations`

---

### 7. 👤 **about_translations**

Traduzioni per la sezione about.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `about_id` (integer) - Riferimento a about
- `languages_code` (string) - Codice lingua
- `title` (string) - Titolo della sezione
- `description` (json) - Descrizione con editor a blocchi

---

### 8. 📞 **contact**

Sezione contatti.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `translations` (alias) - Relazione alle traduzioni

**Traduzioni:** `contact_translations`

---

### 9. 📞 **contact_translations**

Traduzioni per la sezione contact.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `contact_id` (integer) - Riferimento a contact
- `languages_code` (string) - Codice lingua
- `title` (string) - Titolo della sezione
- `subtitle` (text) - Sottotitolo
- `links` (json) - Lista di link di contatto

---

### 10. 💼 **projects**

Progetti del portfolio.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `link` (string) - URL del progetto
- `translations` (alias) - Relazione alle traduzioni
- `images` (alias) - Relazione alle immagini

**Relazioni:**

- `projects_files` - Collegamento con file/immagini
- `projects_translations` - Traduzioni

**Progetti attuali:** 5 progetti attivi con link esterni

---

### 11. 💼 **projects_translations**

Traduzioni per i progetti.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `projects_id` (integer) - Riferimento a projects
- `languages_code` (string) - Codice lingua
- `name` (string) - Nome del progetto
- `title` (string) - Titolo del progetto
- `description` (text) - Descrizione del progetto
- `image_captions` (json) - Didascalie delle immagini
- `body` (json) - Contenuto dettagliato con editor a blocchi

---

### 12. 📁 **projects_files**

Relazione molti-a-molti tra progetti e file.

**Campi:**

- `id` (integer, PK) - Identificatore univoco
- `projects_id` (integer) - Riferimento a projects
- `directus_files_id` (string) - Riferimento ai file Directus

---

### 13. 📂 **directus_files**

Sistema di gestione file di Directus.

**Campi principali:**

- `uploaded_by` (string) - Utente che ha caricato il file
- `modified_by` (string) - Ultimo utente che ha modificato

---

### 14. 👥 **directus_users**

Utenti del sistema Directus.

**Campi principali:**

- `avatar` (string) - Avatar dell'utente (file)

---

## Architettura Multilingue

Il sistema utilizza un approccio di traduzione basato su tabelle separate:

1. **Tabelle principali** (`global`, `welcome`, `about`, `contact`, `projects`)
2. **Tabelle di traduzione** (`*_translations`)
3. **Tabella lingue** (`languages`)

### Relazioni di Traduzione

Ogni tabella principale ha una relazione `translations` che punta alla rispettiva tabella di traduzione, collegata tramite:

- `{table}_id` - Riferimento alla tabella principale
- `languages_code` - Codice lingua dalla tabella `languages`

---

## Tipi di Campo Utilizzati

### Campi Base

- `string` - Testo breve
- `text` - Testo lungo
- `integer` - Numeri interi
- `json` - Dati strutturati

### Interfacce Specializzate

- `input` - Input di testo semplice
- `input-multiline` - Area di testo
- `input-block-editor` - Editor a blocchi avanzato
- `tags` - Gestione tag
- `list` - Liste strutturate
- `file` - Gestione file
- `files` - Gestione file multipli
- `translations` - Gestione traduzioni
- `select-dropdown-m2o` - Selezione many-to-one

---

## Note Tecniche

### Chiavi Primarie

- Tutte le tabelle utilizzano chiavi primarie `id` di tipo `integer`
- La tabella `languages` utilizza `code` (string) come chiave primaria

### Relazioni

- **One-to-Many**: Tabelle principali → Traduzioni
- **Many-to-Many**: Projects ↔ Files (tramite `projects_files`)
- **Many-to-One**: Files → Users (per tracking modifiche)

### Gestione File

Il sistema utilizza il sistema di file nativo di Directus con tracking delle modifiche e supporto per relazioni multiple.
