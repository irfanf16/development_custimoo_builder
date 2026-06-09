# Custimoo Builder v1

**Vue 2 customer-facing product customizer** for the Custimoo platform. Deployed as a standalone SPA or as a `v-customizer` Vue Web Component embedded into Shopify, WooCommerce, or self-hosted storefronts. Customers customize colors/logos/text/rosters on a Fabric.js 2D canvas with optional Three.js 3D preview.

![Vue](https://img.shields.io/badge/Vue-2.6-4FC08D?style=flat&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-4.1-3178C6?style=flat&logo=typescript)
![Vuex](https://img.shields.io/badge/Vuex-3.4-4FC08D?style=flat)
![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3-F0A500?style=flat)
![Three.js](https://img.shields.io/badge/Three.js-0.151-000000?style=flat&logo=threedotjs)
![Vue I18n](https://img.shields.io/badge/Vue_I18n-8.28-4FC08D?style=flat)
![Dexie](https://img.shields.io/badge/Dexie-3.2-IndexedDB-blue?style=flat)

## Features

**Customization** — SVG group-based color picking with Pantone/TCX color matching, gradient support; 3D product preview (Three.js); logo upload + marker.js annotation edit + color extraction; custom text with opentype.js font rendering; per-garment roster entry with Excel import.

**Cart & Orders** — Add to cart with full customization payload, order history, order detail, sample approval flow.

**Locker Room** — Save and share configured product designs.

**Collections** — Design collection PDF view and sharing via URL.

**Merchant Shop** — Storefront mode for merchant-sold products.

**State Persistence** — Vuex state persisted to IndexedDB via Dexie; survives page reload.

**i18n** — Vue I18n with `src/lang/en.json`.

## Build Targets

```bash
npm run buildv2:ecommercecustomizer:production  # v-customizer WC for Shopify/WooCommerce
npm run buildv2:selfcustomizer:production        # v-customizer WC for self-hosted
npm run buildv2:orderdetail:production           # v-order-detail WC
```

## Getting Started

```bash
npm install && npm run serve
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `VUE_APP_API_BASE_URL` | Custimoo backend API URL |
| `VUE_APP_STORAGE_URL` | AWS S3 base URL |

## License
MIT
