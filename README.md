# Custimoo Builder (Legacy v1)

> **Vue 2 + Fabric.js + Three.js Web Component** — the original customer-facing product customizer for the Custimoo platform. Delivered as embeddable Web Components (`<v-customizer>`). Supports 2D Fabric.js canvas customization, Three.js 3D preview, Pantone Coated/TCX color matching, team roster management, Dexie IndexedDB offline persistence, and PDF design spec generation.

![Vue.js](https://img.shields.io/badge/Vue-2.6-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Fabric.js](https://img.shields.io/badge/Fabric.js-5-orange?style=flat-square)
![Three.js](https://img.shields.io/badge/Three.js-0.151-black?style=flat-square&logo=three.js&logoColor=white)
![Dexie](https://img.shields.io/badge/Dexie.js-IndexedDB-blue?style=flat-square)

> **Note:** This is the **legacy Vue 2 version**. The current version is [`development_custimoo_builder_v2`](https://github.com/irfanf16/development_custimoo_builder_v2) (Vue 3 + Pinia + Tailwind v4 + Three.js 0.180).

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `vue@2.6` + TypeScript | — | Core framework |
| `vuex@3` | — | State management (7 modules) |
| `vue-router@3` | — | Client-side routing |
| `fabric@5` | — | 2D canvas engine (logos, text, colors, designs) |
| `three@0.151` | — | 3D product preview |
| `dexie@3.2` | — | IndexedDB wrapper for offline persistence |
| `vue-i18n@8` | — | i18n (multilingual UI) |
| `lz-string` | — | String compression for IndexedDB storage |
| `opentype.js` | — | Custom font glyph-to-SVG-path |
| `pica@9` | — | High-quality image resizing |
| `colorthief` | — | Color palette extraction from images |
| `swiper@7` | — | Mobile carousels |
| `socket.io-client@2` + `laravel-echo` | — | Real-time sync |
| `Gleap@13` | — | User feedback/bug reporting widget |
| `vue-gtag` | — | Google Analytics |
| `portal-vue` | — | Vue 2 teleport/portal |
| Pantone data | — | `pantonesCoated.ts`, `pantonesTcx.ts` full palettes embedded |

---

## Web Component Build Targets

```
npm run build:customizer          -> v-customizer (eCommerce embed)
npm run build:customizer-all      -> v-customizer (self-hosted standalone)
npm run build:orderdetail         -> v-order-detail (order detail embed)
```

Each target has production, staging, and development artifact configurations. All compiled with `--target wc` (Vue CLI Web Component mode).

---

## Vuex Store Modules (7)

`auth`, `product`, `cart`, `event`, `main`, `shop`, `ProductAttributes`

---

## Views & Key Components

**Views:** `Home`, `Dashboard`, `Cart`, `Order`, `Orders`, `OrderListing`, `OrderDetail`, `Payment`, `Thankyou`, `Addresses`, `MerchantShop`, `ShopPreview`, `shopLockerRoom`, `LockerRoom`, `ThreeDView`, `ConfirmOrderTab`, `CollectionViewPDF`, `UploadCustomDesign`, `DirectAccessSampleApproval`, `ShareRoster`, `ThirdPartyFeedback`

**Key Components (70+):**
| Component | Purpose |
|---|---|
| `Scene.vue` | Fabric.js 2D canvas (main customization) |
| `ThreeDScene.vue` | Three.js 3D product preview |
| `ChooseColor.vue` | Color picker with Pantone palettes |
| `RosterTable.vue` / `EditRosterArea.vue` | Team roster management |
| `CollectionPDF.vue` | PDF design spec generation |
| `SaveDesignModal.vue` | Save design to locker room |
| `SaveLogoModal.vue` | Save logo to library |
| `CartModal.vue` | Cart overlay |
| `YearlyPlanner.vue` | Production schedule integration |
| `LockerRoom.vue` | Team saved designs |
| `ProductionScene.vue` | Production artwork canvas |
| `ThirdPartyFeedback.vue` | External stakeholder feedback |
| `DirectAccessSampleApproval.vue` | Sample approval without auth |
| `MerchantShop/*` | B2B merchant storefront components |

---

## Key Features

### 2D Canvas (Fabric.js v5)
- Loads product SVG design files
- Real-time recoloring of SVG layers (solid, gradient, Pantone Coated/TCX)
- Logo drag/resize/rotate with custom controls
- Text rendering via `opentype.js` (glyph → SVG path — no system font dependency)
- Fixed logo positions (locked to specific canvas coordinates)
- High-res canvas capture for order submission

### 3D Preview (Three.js)
- GLTF product model loading
- Design texture applied to 3D mesh in real time
- `OrbitControls` for rotation/zoom
- HDR lighting for realistic material rendering

### Pantone Color System
Full Pantone Coated and Pantone TCX palettes embedded as static TypeScript data. Active palette selected by company configuration.

### Roster Management
Team/player roster with name + number + size per member. Bulk customization for sports teams. `ShareRoster.vue` for shareable roster links.

### Locker Room
Team design storage. Save customized designs, organize into collections, share with team members.

### Dexie IndexedDB Persistence
`indexedDBPersistence.js` saves in-progress customization state to IndexedDB via Dexie. `lz-string` compresses stored data. Survives browser refresh/session loss.

### PDF Spec Sheets
`CollectionViewPDF.vue` and `CollectionPDF.vue` generate exportable design specification PDFs for factory production orders.

### Merchant Shop
Multi-tenant merchant storefront (`MerchantShop.vue`). Each merchant has a branded shop URL displaying their customizable product catalog.

---

## Getting Started

```bash
npm install
npm run serve                  # Development
npm run build:customizer       # Production eCommerce Web Component
npm run build:customizer-all   # Production standalone Web Component
```

## Related Repositories

| Repo | Purpose |
|---|---|
| `development_custimoo_builder_v2` | Current Vue 3 version (recommended) |
| `custimoo` | Laravel 12 backend API |
| `development_admin` | Legacy Vue 2 admin panel |
