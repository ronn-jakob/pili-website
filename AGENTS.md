# Pili Website — Agent Instructions

Pili is a React + Vite marketing site for Philippine tours and travel, with a homepage and a `/destinations` listing page. There is no backend, database, or authentication.

## Context loading

| Task | Read |
|---|---|
| Small text/markup change | This file + the component being edited |
| Component change | This file + the component `.jsx`, its `.module.css`, and the UI primitives it imports |
| New page or section | This file + `PROJECT_CONTEXT.md` (structure, primitives, conventions) + the components you reuse |
| Visual/Figma matching | This file + `PROJECT_CONTEXT.md` (scale and styling) + the relevant section of `DESIGN_REFERENCE.md` |
| Shared primitive, token, or architecture change | This file + `PROJECT_CONTEXT.md` + the design-reference entry for every consumer |
| Firebase / Firestore data task | This file + `DATA_MODEL.md` + `src/lib/firebase.js` + `src/lib/firestoreSchema.js` + `firestore.rules` + the Firebase notes in `PROJECT_CONTEXT.md` |
| Build/runtime bug | The error and the failing source file. Do not read unrelated documentation first |

`PROJECT_CONTEXT.md` and `DESIGN_REFERENCE.md` are **not auto-loaded**; open only the sections the task needs.

## Stack (verified)

- React 19.2.8 + React DOM 19.2.8, Vite 8.3.0, JavaScript/JSX (no TypeScript).
- React Router 7 (`react-router-dom`) with `BrowserRouter`: `/`, `/destinations`, `/packages`, `/packages/:packageId`, `/packages/:packageId/book`, `/packages/:packageId/book/review`, `/packages/:packageId/book/payment`, `/bookings`, `/settings`, `/admin`, `/admin/login`, `/admin/tours`, `/admin/categories`, `/admin/destinations`, `/operator`, `/operator/login`, `/operator/tours`, `/operator/tours/new`, `/operator/tours/:tourId/edit`, `/operator/tours/:tourId/departures`.
- Plain CSS Modules; global tokens in `src/styles/index.css`.
- ESLint 10 flat config (`eslint.config.js`).
- Firebase 13 client SDK; `src/lib/firebase.js` initializes Auth and Firestore (`db`). Admin and operator consoles use Firebase Auth with `admins/{uid}` / `operators/{uid}` markers; the public site still uses its mock auth UI.
- Leaflet + React Leaflet for itinerary maps, with MapTiler tiles/geocoding when `VITE_MAPTILER_KEY` is set and OSM tiles as the no-key fallback. Itinerary pins are stored per day in `tours.itinerary[].location`.
- Cloudinary unsigned uploads for destination and tour images (`VITE_CLOUDINARY_*` in `.env.local`); Firestore stores only Cloudinary URLs/public IDs.
- No state library, icon library, animation library, tests or custom server.

## Architecture

- `src/main.jsx` wraps `BrowserRouter`; `src/App.jsx` owns `ScrollManager` and the route tree, rendering public routes through `SiteLayout`, admin routes through `AdminLayout` and operator routes through `OperatorLayout`.
- Pages live in `src/pages/<Name>/<Name>.jsx` (optional `*.module.css` beside it): `Home` (`/`), `DestinationsPage` (`/destinations`), `PackagesPage` (`/packages`), `PackageDetailPage` (`/packages/:packageId`), `BookingPage` (`/packages/:packageId/book`), `BookingReviewPage` (`/packages/:packageId/book/review`), `BookingPaymentPage` (`/packages/:packageId/book/payment`), `BookingsPage` (`/bookings`), `SettingsPage` (`/settings`), `AdminDashboardPage` (`/admin`), `AdminToursPage` (`/admin/tours`), `AdminCategoriesPage` (`/admin/categories`), `AdminDestinationsPage` (`/admin/destinations`), `AdminLoginPage` (`/admin/login`), `OperatorDashboardPage` (`/operator`), `OperatorLoginPage` (`/operator/login`), `OperatorToursPage` (`/operator/tours`), `OperatorEditTourPage` (`/operator/tours/new` and `/operator/tours/:tourId/edit`) and `OperatorDeparturesPage` (`/operator/tours/:tourId/departures`).
- Shared operator tour state lives in `src/context/` (`OperatorToursContext.js`, `OperatorToursProvider.jsx`, `useOperatorTours.js`).
- Firestore collection names and enum values live in `src/lib/firestoreSchema.js`; the full model and Spark constraints are documented in `DATA_MODEL.md`.
- Seed data: `src/data/categories.js`, `src/data/destinations.js`, `src/data/operatorTourPackages.js`, `scripts/seedFirestore.mjs` (categories, destinations, 14 unified tours, settings) and `scripts/seedDepartures.mjs` (future departures for published tours).
- Layout shells live in `src/components/layout/`: `SiteLayout` (public Header/Footer), `AdminLayout` (protected admin header/sidebar/footer) and `OperatorLayout` (reuses the admin header/sidebar/footer). `/admin` and `/operator` must stay outside `SiteLayout`.
- Shared primitives live in `src/components/ui/<Name>/` (Container, Button, Logo, CarouselButton, AuthModal, WishlistButton, MapPicker, ItineraryMapModal, PasswordToggle).
- Page sections live in `src/components/sections/<page>/<Section>/` as `<Section>.jsx` + `<Section>.module.css` — groups: `shared`, `home`, `destinations`, `packages`, `package-detail`, `booking`, `bookings`, `settings`, `admin` (including `AdminDestinationForm`), `operator`.
- Assets live in `src/Images/` (`destinations/`, `packages/`, `payments/`, `social/`); package/detail content lives in `src/data/packages.js`, bookings in `src/data/bookings.js`, profile defaults in `src/data/profile.js`, admin content in `src/data/adminNav.js` / `adminDashboard.js`, operator content in `src/data/operatorNav.js` / `operatorDashboard.js` / `operatorTourPackages.js`, destination seed data in `src/data/destinations.js`, and province/region mapping in `src/data/philippineLocations.js`. Use relative imports; PascalCase components, camelCase CSS classes.
- Firebase config lives in `src/lib/firebase.js` (`app`, `auth`, `db`). Project files: `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`. Portal auth helpers live in `src/lib/adminAuth.js` and `src/lib/operatorAuth.js`; destination CRUD is in `src/lib/destinations.js`; category CRUD is in `src/lib/categories.js`; tour CRUD and itinerary mapping are in `src/lib/tours.js`; departure CRUD is in `src/lib/departures.js`; public catalog mapping is in `src/lib/publicCatalog.js`; map tiles/geocoding helpers are in `src/lib/maps.js`; Cloudinary upload/compression is in `src/lib/cloudinary.js`.

## Design rules

- The **homepage and auth modals** implement their Figma comps at **80% scale**. Values such as `82.4px`, `614.4px`, `14.4px`, and `0.55rem` are exact — never round or "tidy" them.
- The **destination and packages pages** (`/destinations`, `/packages`) are authored at **1.0 scale** with 1480/1498 editorial grids (`Container size="page"`, 1549.2px max), Inter typography and the `--color-page-*` / `--color-package-*` palettes. Do not force them into the 80% values or those palettes into other pages.
- Reuse existing primitives and design tokens. Do not change shared tokens or primitives unless the task requires it.
- Icons are inline SVGs (or brand SVG files). Do not add an icon package.
- Header section links use `/#top`, `/#why-choose`, `/#contacts` (handled by `ScrollManager`); Destinations uses a router `Link` to `/destinations`. Smooth scrolling uses `scroll-padding-top: var(--header-offset)`; keep the offset in sync with the header height.
- Figma source of record: file `uqzVhcY0Jioe1sX3ZpNP2I`, frames `Home Page 3` (`50:109`), `Login Modal` (`108:667`), `Sign-up Modal` (`155:835`), `Destination Page` (`87:312`), `Package Page` (`124:2`), `Tour Details Page` (`194:96`), `Booking Page` (`243:462`), `Booking Review` (`248:462`), `Booking Payment` (`253:591`), `My bookings` (`211:225`), `Profile` (`219:279`), `ADmin Dashboard` (`448:4003`), `Organizer Dashboard` (`255:720`), `My Tours — Packages` (`255:847`), `My Tours — Package Editor` (`255:960`). Exact specs are in `DESIGN_REFERENCE.md`.

## Efficient working rules

- Understand the requested outcome, then inspect the smallest relevant set of files (component + stylesheet + direct imports).
- Prefer one focused implementation pass; do not refactor or restyle unrelated code.
- Do not add dependencies without a concrete reason.
- Do not deploy Firestore rules or write production data without explicit user confirmation. The deployed rules currently expire on 20 November 2026; the local `firestore.rules` allows public reads of active destinations/published tours, admin writes to destinations, operator reads of their own tours, and admin/operator marker reads.
- Admin routes must use `AdminLayout`; operator routes must use `OperatorLayout`. Neither may render the public Header/Footer. Both headers mirror the public top tier (logo + profile only, no nav or second tier). Dashboards are static; sidebar items without pages must stay inert placeholders.
- Figma: retrieve only the frame/component relevant to the task, reuse that information, and stop after two failed attempts.
- Commands: run checks after meaningful changes, not after every edit. Do not repeat an identical command whose result you have not acted on. Fix the actual error. Stop after two attempts at the same failure.
- Do not rewrite working files with near-identical content. Review your final diff.
- Never discard the user's uncommitted work. This project has **no git repository** — do not run destructive git commands.

## Verification

```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # production build → dist/
npm run lint     # eslint .
npm run preview  # preview dist/
```

Run `build` and `lint` once after meaningful changes. Report actual output; never claim success unverified.

## Completion report

- Files changed.
- What was implemented or fixed.
- Verification commands and results.
- Remaining issues or unverified assumptions.
