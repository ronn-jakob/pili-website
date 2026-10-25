# Pili Tour and Travel — Project Context

> Verified against the source on 2026-10-20. The repository is **not** a git repository.
> Exact visual specifications live in [`DESIGN_REFERENCE.md`](./DESIGN_REFERENCE.md).

---

## 1. Overview and scope

**Pili** is a React + Vite marketing site for a Philippine tour and travel brand. It is intended to help visitors discover destinations, browse tour packages and special offers, and eventually book trips.

**Currently implemented:** the homepage — sticky header, hero with rotating background photos and a (non-functional) destination search, popular destinations row, popular packages grid, "Why Choose Pili" photo bands, footer, and login/sign-up modals opened from the header (UI only) — plus a **Destinations listing page** at `/destinations` (hero, five destination cards, story section, featured packages), a **Packages listing page** at `/packages` (hero, search card, six package cards, filters, pagination), **package detail pages** at `/packages/:packageId` (hero, itinerary, tabs, booking sidebar, gallery, reviews), and a **three-step booking flow**: details (`/book`), review (`/book/review`) and payment (`/book/payment`), plus a **My Bookings account page** at `/bookings`, a **My Profile settings page** at `/settings`, a protected **Admin Console** at `/admin` with a separate sidebar/header/footer and sign-in at `/admin/login`, and a protected **Operator Console** at `/operator` with sign-in at `/operator/login`.

**Not implemented:** destination detail pages, backend/API, database, authentication, booking/payment flow, wishlist persistence, featured tours, testimonials, newsletter, tests. Do not invent these when modifying the site.

**Running the app:** `npm run dev` (Vite, port 5173).

---

## 2. Technology stack (verified)

| Area | Technology |
|---|---|
| UI | React `^19.2.8`, React DOM `^19.2.8` |
| Build/dev server | Vite `^8.3.0` with `@vitejs/plugin-react` `^6.1.1` |
| Language | JavaScript + JSX (no TypeScript) |
| Styling | Plain CSS Modules; global custom properties in `src/styles/index.css` |
| Routing | `react-router-dom` `^7.18.4` (`BrowserRouter`, layout routes, `/`, `/destinations`, `/packages`, `/packages/:packageId`, `/packages/:packageId/book`, `/book/review`, `/book/payment`, `/bookings`, `/settings`, `/admin`, `/admin/login`, `/admin/destinations`, `/operator`, `/operator/login`, `/operator/tours`, `/operator/tours/:tourId/edit`) |
| Lint | ESLint `^10.10.0` flat config, React Hooks + React Refresh plugins |
| Fonts | Google Fonts CDN: Poppins (body), Inter (headings), Kaushan Script (accents) |
| Integrations | Figma MCP and Firebase MCP (Firestore only) declared in `opencode.json`; Cloudinary unsigned image uploads for admin destinations |
| Database | Firebase / Cloud Firestore project `pili-website`, database `(default)` in `asia-southeast1`; client initialized in `src/lib/firebase.js` |

Firebase 13 is installed and Firestore is initialized, but the UI still reads static data. No state-management library, CSS framework, icon package, animation library, custom server, or test framework is installed.

---

## 3. Directory structure (verified paths)

```text
pili-website/
├── index.html                  # HTML entry; #root; favicon → src/Images/pili-logo.svg
├── package.json                # scripts: dev, build, lint, preview
├── vite.config.js              # react plugin only
├── eslint.config.js            # flat config, ignores dist
├── opencode.json               # Figma + Firebase MCP servers
├── DATA_MODEL.md               # Firestore collections, states, Spark booking rules
├── firebase.json               # Firestore rules/indexes config
├── .firebaserc                 # default project: pili-website
├── firestore.rules             # local rules (markers only; not deployed)
├── firestore.indexes.json
├── .env.example                # Cloudinary env placeholders
├── .env.local                  # real Cloudinary cloud/preset (ignored)
├── scripts/
│   └── seedFirestore.mjs       # seed destinations, tours and platform settings
├── public/
│   ├── favicon.svg             # unused (index.html points at src/Images)
│   └── icons.svg               # unused
├── src/
│   ├── main.jsx                # StrictMode + BrowserRouter → App
│   ├── App.jsx                 # layout: ScrollManager, #top, Header, Routes, Footer
│   ├── pages/
│   │   ├── Home/                # Home.jsx
│   │   ├── DestinationsPage/    # DestinationsPage.jsx
│   │   ├── PackagesPage/        # PackagesPage.jsx
│   │   ├── PackageDetailPage/   # PackageDetailPage.jsx
│   │   ├── BookingPage/         # BookingPage.jsx + module.css
│   │   ├── BookingReviewPage/   # BookingReviewPage.jsx + module.css
│   │   ├── BookingPaymentPage/  # BookingPaymentPage.jsx + module.css
│   │   ├── BookingsPage/        # BookingsPage.jsx + module.css
│   │   ├── SettingsPage/        # SettingsPage.jsx + module.css
│   │   ├── AdminDashboardPage/  # AdminDashboardPage.jsx + module.css
│   │   ├── AdminToursPage/      # AdminToursPage.jsx + module.css
│   │   ├── AdminCategoriesPage/ # AdminCategoriesPage.jsx + module.css
│   │   ├── AdminDestinationsPage/ # AdminDestinationsPage.jsx + module.css
│   │   ├── AdminLoginPage/      # AdminLoginPage.jsx + module.css
│   │   ├── OperatorDashboardPage/ # OperatorDashboardPage.jsx + module.css
│   │   ├── OperatorLoginPage/   # OperatorLoginPage.jsx + module.css
│   │   ├── OperatorToursPage/   # OperatorToursPage.jsx + module.css
│   │   ├── OperatorDeparturesPage/ # OperatorDeparturesPage.jsx + module.css
│   │   └── OperatorEditTourPage/ # OperatorEditTourPage.jsx + module.css
│   ├── context/
│   │   ├── OperatorToursContext.js
│   │   ├── OperatorToursProvider.jsx # subscribes to the operator's Firestore tours
│   │   └── useOperatorTours.js
│   ├── utils/
│   │   └── booking.js            # money/date/cancellation helpers
│   ├── lib/
│   │   ├── firebase.js           # Firebase app + Auth + Firestore instance (exports app, auth, db)
│   │   ├── firestoreSchema.js    # collection names + status enums
│   │   ├── destinations.js       # destination CRUD + tour-count queries
│   │   ├── categories.js         # admin categories + active category queries
│   │   ├── tours.js              # operator tour CRUD, active destinations, status mapping
│   │   ├── departures.js         # operator departure CRUD and capacity fields
│   │   ├── publicCatalog.js      # Firestore published tours → public package cards
│   │   ├── maps.js               # MapTiler/OSM tile config, geocoding, location validation
│   │   ├── cloudinary.js         # destination/tour image validation/compression/upload
│   │   ├── adminAuth.js          # admin email/doc check + login error messages
│   │   └── operatorAuth.js       # operator email/doc check + login error messages
│   ├── data/
│   │   ├── packages.js           # shared package records + detail content
│   │   ├── bookings.js           # mock account bookings + summary helper
│   │   ├── profile.js            # mock profile details + sidebar nav
│   │   ├── adminNav.js           # admin sidebar items (Dashboard, Tour Packages, Destinations active)
│   │   ├── adminDashboard.js     # static admin stats/chart/actions/reservations
│   │   ├── operatorNav.js        # operator sidebar (Dashboard/My Tours active; rest inert)
│   │   ├── operatorDashboard.js  # static operator KPIs/tours/bookings/week chart
│   │   ├── operatorTourPackages.js # five operator tour seed records for Firestore seeding
│   │   ├── categories.js        # 8 admin-owned tour category seeds
│   │   ├── itineraryLocations.js # curated day-by-day itinerary pin coordinates
│   │   ├── destinations.js       # 11 admin-owned destination seeds
│   │   └── philippineLocations.js # 17 regions + provinces, province→region map
│   ├── styles/index.css        # design tokens, reset, scroll behavior
│   ├── Images/                 # brand/hero/section photos, destinations/, packages/, payments/, social/
│   ├── assets/                 # Vite template SVGs (unused)
│   └── components/
│       ├── ui/
│       │   ├── AuthModal/
│       │   ├── Button/
│       │   ├── CarouselButton/
│       │   ├── Container/
│       │   ├── ItineraryMapModal/
│       │   ├── Logo/
│       │   ├── MapPicker/
│       │   └── WishlistButton/
│       ├── layout/
│       │   ├── SiteLayout/       # public Header + Outlet + Footer
│       │   ├── AdminLayout/      # admin/operator Header/Sidebar/Footer/ProfileMenu
│       │   └── OperatorLayout/   # operator guard; reuses admin shell pieces
│       └── sections/
│           ├── shared/
│           │   ├── Header/
│           │   ├── Footer/
│           │   └── ProfileMenu/
│           ├── home/
│           │   ├── Hero/
│           │   ├── Destinations/
│           │   ├── PopularPlaces/
│           │   └── WhyChoose/
│           ├── destinations/
│           │   ├── DestinationsHero/
│           │   ├── PopularDestinations/
│           │   ├── StorySection/
│           │   └── FeaturedPackages/
│           ├── packages/
│           │   ├── PackagesHero/
│           │   └── PackagesListing/
│           ├── package-detail/
│           │   ├── PackageDetailHero/
│           │   ├── PackageDetailBody/
│           │   ├── PackageGallery/
│           │   └── PackageReviews/
│           ├── booking/
│           │   ├── BookingHeader/
│           │   ├── BookingTourCard/
│           │   ├── BookingDetailsForm/
│           │   ├── BookingSummary/
│           │   ├── BookingReviewDetails/
│           │   ├── BookingReviewSummary/
│           │   ├── BookingPaymentForm/
│           │   └── BookingPaymentSummary/
│           ├── bookings/
│           │   ├── BookingsSummary/
│           │   ├── BookingsFilters/
│           │   ├── BookingCard/
│           │   └── BookingsNote/
│           ├── settings/
│           │   ├── SettingsSidebar/
│           │   ├── SettingsPhotoRow/
│           │   ├── SettingsProfileForm/
│           │   ├── SettingsSecurity/
│           │   └── SettingsActions/
│           ├── admin/
│           │   ├── AdminStatCards/
│           │   ├── AdminBookingChart/
│           │   ├── AdminPendingActions/
│           │   ├── AdminRecentReservations/
│           │   ├── AdminTourReview/
│           │   ├── AdminCategoryForm/
│           │   └── AdminDestinationForm/
│           └── operator/
│               ├── OperatorWelcome/
│               ├── OperatorKpis/
│               ├── OperatorTours/
│               ├── OperatorRecentBookings/
│               ├── OperatorDepartureForm/
│               └── OperatorWeekChart/
└── dist/                       # build output (gitignored, present locally)
```

Sections are grouped by the page that uses them (`shared`, `home`, `destinations`, `packages`, `package-detail`, `booking`, `bookings`, `settings`, `admin`, `operator`). Each component still has its own folder with `<Name>.jsx` and `<Name>.module.css`.

Pages also use one folder per page (`src/pages/<Name>/<Name>.jsx`, with `*.module.css` beside it). Imports therefore use `../../components`, `../../data` and `../../lib`.

---

## 4. Rendering flow and component relationships

`main.jsx` mounts `BrowserRouter` → `App` in `StrictMode`. `App` is the layout:

```text
<div id="top" />   ← zero-height anchor used by the header's Home link
ScrollManager      ← scrolls to top on route change, or to #hash targets
Header             ← sticky, two tiers on ≥768px, hamburger menu below
Routes
  /               → Home
  /destinations   → DestinationsPage
  /packages       → PackagesPage
  /packages/:packageId → PackageDetailPage
  /packages/:packageId/book → BookingPage
  /packages/:packageId/book/review → BookingReviewPage
  /packages/:packageId/book/payment → BookingPaymentPage
  /bookings       → BookingsPage
  /settings       → SettingsPage
  /admin/login    → AdminLoginPage (standalone)
  /admin          → AdminLayout → AdminDashboardPage
  /admin/tours    → AdminToursPage
  /admin/categories → AdminCategoriesPage
  /admin/destinations → AdminDestinationsPage
  /operator/login → OperatorLoginPage (standalone)
  /operator       → OperatorLayout → OperatorDashboardPage
  /operator/tours → OperatorToursPage
  /operator/tours/new → OperatorEditTourPage
  /operator/tours/:tourId/edit → OperatorEditTourPage
  /operator/tours/:tourId/departures → OperatorDeparturesPage
Footer             ← contacts, payment badges, copyright, socials + Admin/Operator links (id="contacts")
```

**Home** renders `Hero` (rotating photos), Firestore-backed `Destinations` (horizontal scroll carousel), Firestore-backed `PopularPlaces` (4 more per click), and static `WhyChoose`.
**DestinationsPage** loads active Firestore destinations and renders `DestinationsHero`, the top five `PopularDestinations` by admin sort order, `StorySection`, and the remaining destinations in `FeaturedPackages`.
**PackagesPage** loads published Firestore tours, then renders `PackagesHero` (functional search/category links) and `PackagesListing` (Firestore cards, functional category/duration/budget filters, sort and pagination).
**PackageDetailPage** uses static package data when available and otherwise maps a published Firestore tour, merges Firestore content/departures, and renders `PackageDetailHero`, `PackageDetailBody`, `PackageGallery` and `PackageReviews`. Firestore-only tours show a booking-coming-soon state; unknown IDs redirect to `/packages`.
**BookingPage** reads the selected date/travelers from router state (falling back to 2 travelers and the default date), then renders `BookingHeader`, `BookingTourCard`, `BookingDetailsForm` and `BookingSummary`. Unknown IDs redirect to `/packages`.
**BookingReviewPage** and **BookingPaymentPage** require `{ date, travelers, details }` in router state; direct visits without details redirect to the booking details step. The review page renders trip/lead-traveler cards, the order summary and cancellation policy. The payment page renders express checkout, card fields, the order summary and secure-checkout card.
**BookingsPage** renders the mock account bookings from `src/data/bookings.js`: `BookingsSummary`, `BookingsFilters`, a list of `BookingCard`s and `BookingsNote`.
**SettingsPage** renders the mock profile from `src/data/profile.js` with `SettingsSidebar`, `SettingsPhotoRow`, `SettingsProfileForm`, `SettingsSecurity` and `SettingsActions`.
**AdminLoginPage** is a standalone Firebase sign-in screen. **AdminLayout** guards `/admin`, then renders `AdminHeader` (logo + profile menu only), `AdminSidebar`, the page content and `AdminFooter`. **AdminDashboardPage** composes `AdminStatCards`, `AdminBookingChart`, `AdminPendingActions` and `AdminRecentReservations` from static admin data. **AdminToursPage** reads all `tours`, shows moderation summaries and filters, and opens `AdminTourReview` for approve/reject/hide/archive actions. **AdminCategoriesPage** manages active/inactive tour categories through `AdminCategoryForm`. **AdminDestinationsPage** reads the `destinations` collection, shows tour counts, searches/filters, and creates/edits/deactivates destinations through `AdminDestinationForm`.
**OperatorLoginPage** is the equivalent standalone operator sign-in. **OperatorLayout** guards `/operator`, reuses `AdminHeader`, `AdminSidebar`, `AdminFooter` with operator nav/labels, and renders `OperatorDashboardPage` (`OperatorWelcome`, `OperatorKpis`, `OperatorTours`, `OperatorRecentBookings`, `OperatorWeekChart`) from static operator data. Its nested routes also render **OperatorToursPage** (searchable/filterable tour list), **OperatorEditTourPage** (Firestore-backed tour form) and **OperatorDeparturesPage** (departure schedule and capacity management).

**State:** local `useState` only.
- `Header` — `menuOpen` (mobile menu), `authMode` (`null | 'login' | 'signup'`) and `user` (mock signed-in session, resets on reload).
- `WishlistButton` — `wishlisted` per instance (homepage package card, destination card or package card; not persisted).
- `PackageDetailBody` — departure date, travelers (1–8), active detail tab, derived total and active itinerary map modal.
- `BookingsPage` — `activeFilter` (`All | Pending | Confirmed | Completed | Cancelled`); the visible cards and empty state derive from it.
- `SettingsPage` — `savedProfile` / `draft` (editable profile fields + photo), `activeSection` for the sidebar, upload error and save status. Save copies draft → saved; Cancel restores the last saved values.
- `AdminLayout` — Firebase session (`loading`, `user`), verifies the admin email/`admins/{uid}` marker, signs out unauthorized users, and redirects to `/admin/login`.
- `AdminDestinationsPage` — Firestore destination list/tour counts, search/status filter, create/edit modal and active/inactive toggle.
- `AdminToursPage` — Firestore tour moderation list, summary counts, search/status filter and `AdminTourReview` modal.
- `AdminCategoriesPage` — Firestore category list, search/status filter, create/edit modal and active/inactive toggle.
- `AdminLoginPage` — email, password, submitting/checking flags and error; redirects an already-signed-in admin to `/admin`.
- `OperatorLayout` — Firebase session, verifies the operator email/`operators/{uid}` marker, signs out unauthorized users, and redirects to `/operator/login`.
- `OperatorLoginPage` — same login state/error flow; redirects a signed-in operator to `/operator`.
- `OperatorToursProvider` — Firestore subscription to the signed-in operator’s tours.
- `OperatorToursPage` — search query and status filter across Draft, Pending review, Published, Rejected, Hidden and Archived.
- `OperatorEditTourPage` — Firestore-backed Add/Edit Tour with linked Days/Nights, itinerary map pins, pricing/discount toggles, Save Draft, Submit for Review and draft-only deletion.
- `OperatorDeparturesPage` — Firestore-backed departure schedule with add/edit/cancel, meeting-point map pins, capacity progress and status filtering.

`AuthModal` renders into `document.body` via a portal; while open it locks body scroll, traps focus, and closes on Escape, backdrop click, or the × button. Switching between login and sign-up keeps it open and moves focus to the first field. Submitting the **Login** form calls `onLogin`, which sets the mock `user` and closes the modal.

`ProfileMenu` (under `sections/shared/`) replaces Sign up/Login with a 36px circular avatar when `user` is set. Clicking it opens a dropdown with My Bookings, Notifications, Settings and Logout; it closes on outside click/Escape, and Logout clears `user`. My Bookings opens `/bookings`, Settings opens `/settings`, and Notifications remains a placeholder. The avatar is also visible on mobile next to the hamburger, and the mobile menu hides its guest auth actions.

Firestore fetching now exists for public packages, destinations, package details, departures and homepage destination/popular-place sections. Static fallback content remains in `Destinations.jsx`, `PopularPlaces.jsx`, `WhyChoose.jsx`, `FeaturedPackages.jsx` and `Footer.jsx`; package seed/detail copy and cancellation windows live in `src/data/packages.js`, mock account bookings in `src/data/bookings.js`, profile defaults in `src/data/profile.js`, and the portal dashboards use `adminDashboard.js` / `operatorDashboard.js`.

**Firebase:** the MCP server is connected as `viquieraronnjakob@gmail.com`; project `pili-website` is active. Cloud Firestore has one `(default)` database in `asia-southeast1`. It currently contains the `admins/{uid}` and `operators/{uid}` markers, **11 seeded destinations**, **14 unified tours** owned by `operator@gmail.com`, and `settings/platform`. The full model is in `DATA_MODEL.md`; collection/status constants are in `src/lib/firestoreSchema.js`. The deployed rules are Firebase’s temporary open rules expiring **20 November 2026**; the local `firestore.rules` now allows public reads of active destinations/published tours, admin writes to destinations, operator reads of their own tours, and admin/operator marker reads. It has **not** been deployed.

**Navigation:** the logo, the header's Destinations/Packages links and the homepage “See more” links use React Router (`NavLink` for the active section). Home / About us / Contacts link to `/#top`, `/#why-choose` and `/#contacts`; `ScrollManager` handles the hash and `scroll-padding-top` keeps targets below the sticky header. The header's Login and Sign up buttons open the auth modal; submitting Login switches the header to the avatar/profile menu (UI-only). **My Bookings** in that menu opens `/bookings`; **Settings** opens `/settings`; Notifications is still a placeholder; Logout returns to the guest header. The public footer’s bottom row includes **Admin** and **Operator** links to `/admin/login` and `/operator/login`; `/admin` and `/operator` redirect signed-out users to their login pages. Admin sidebar **Destinations** opens `/admin/destinations`, where destinations are created/deactivated before operators can publish tours under them. Homepage destination cards and the Destinations page Popular Destinations cards lead to `/packages?search=<destination>`; homepage Popular Places cards open `/packages/:packageId`; both “See more” links lead to `/packages`. Package cards and the three Featured Packages cards open `/packages/:packageId`. The detail page’s **Book Now** opens `/book` with the date and travelers; **Continue to review** opens `/book/review` with the filled details; **Continue to payment** opens `/book/payment`. Review/payment require that state, and Back/Edit links preserve it (details prefill on return). Wishlist, Special Offers and the story CTA remain placeholder links.

**Search:** both hero forms call `preventDefault()`; no search, validation, or data source exists.

**Carousels:** the destination row scrolls natively. `CarouselButton` renders a 48px next control on ≥1024px but has no click handler; the popular grid has no second page.

---

## 5. Shared UI primitives

| Primitive | Responsibility | Key points |
|---|---|---|
| `Button` | Styled `<button>` | Variants `primary`, `secondary`, `outlined`, `ghost`, `gradient`; sizes small/medium/large; shapes `pill`/`rounded`; `disabled` + `loading`. No `as`/link rendering. |
| `Container` | Centered max-width wrapper | `default` and `wide` use `--container-max-width` (1075.2px); `page` is 1549.2px for the 1498px destination grid; `narrow` is 768px. Horizontal gutters grow at 768px and 1024px. |
| `Logo` | Brand lockup | Variants `full`/`icon`; sizes small/medium/large. Renders a React Router `<Link to="/">` unless `link={false}`. Wordmark is cropped with a per-size `--name-scale`; see the design reference before touching it. |
| `CarouselButton` | Circular "next" control | Absolute-positioned; section owns `right`/`top`; hidden below 1024px; no handler. |
| `AuthModal` | Login / sign-up dialog | Portal-rendered overlay with darkened backdrop, enter/exit transitions, focus trap, scroll lock and a close button outside the panel. Two modes: single-column login and two-column sign-up. Forms are UI-only. Specs in `DESIGN_REFERENCE.md` §10. |
| `WishlistButton` | Heart toggle | 44px tap target with a 25px heart; `raised` variant is a 36px white rounded button for photo cards; `tone="dark"` uses a `#595959` idle heart for pastel/photo backgrounds. Local `aria-pressed` state, not persisted. Used by homepage Popular Places, destination cards and package cards. |

Exact dimensions, props, and caveats are in `DESIGN_REFERENCE.md` §9.

---

## 6. Styling architecture

- **CSS Modules** per component; no global utility classes.
- **Tokens:** all colors, type sizes, spacing, radii, shadows, and transitions are custom properties in `src/styles/index.css`. Components should consume tokens rather than hardcode values (documented exceptions exist, e.g. card type sizes and photo-band values).
- **80% scale (homepage + auth modals):** these implement the Figma comps at 80%. A 1280px design column becomes 1024px; the container max is 1075.2px including gutters. Fractional values are intentional.
- **Destination page (1.0 scale):** the `/destinations` and `/packages` frames are authored at final size with 1480/1498 editorial grids, Inter typography and their own palettes (`--color-page-*`, `--color-package-*`). Do not force them into the 80% system.
- **Breakpoints:** `768px` and `1024px` are the base breakpoints; the destination page also uses 639px and 1199px for its card grids.
- **Scroll behavior:** `html` has `scroll-behavior: smooth` and `scroll-padding-top: var(--header-offset)` (84px below 768px, 162px from 768px up). Reduced-motion users get instant jumps.
- **Icons:** inline SVG markup in components, or brand SVGs under `src/Images/`. No icon dependency.
- **Motion:** CSS transitions and one CSS keyframe animation (hero background swipe); the hero stops animating and card hover transforms are disabled under `prefers-reduced-motion`.

The full token inventory and per-section measurements are in `DESIGN_REFERENCE.md` §2–§8.

---

## 7. Data sources and integrations

- All content is static and local. No API calls, fetch, database, or auth.
- Package records, itineraries, inclusions and reviews live in `src/data/packages.js`; mock account bookings live in `src/data/bookings.js`; profile defaults live in `src/data/profile.js`.
- External network dependency: Google Fonts via `@import` at the top of `src/styles/index.css` (Poppins 300–800, Inter 400/500/600/700/800, Kaushan Script).
- Local assets only: homepage/destination photos, two homepage hero photos, destination-page hero, packages-page hero, five destination photos, three featured-package photos, three Why Choose bands, five payment SVGs, five social SVGs.
- `opencode.json` configures the Figma MCP server for design work; it has no runtime effect on the site.

---

## 8. Implemented functionality and intentional placeholders

**Implemented**
- Router with `/`, `/destinations`, `/packages`, `/bookings`, shared Header/Footer, scroll manager and hash-aware header links.
- Two-tier sticky header, mobile hamburger menu, in-page anchor navigation, active Destinations/Packages nav state, and a mock signed-in avatar/profile menu.
- Hero with two rotating background photos (swipe-left loop, 18s cycle), headline, and search UI (submit prevented).
- Destinations row with the Aklan card and native horizontal scrolling.
- Popular Places grid with the Enchanted Kingdom card, stretched link, and local wishlist toggle.
- Three Why Choose photo bands with gradient scrims and mixed typography.
- Footer with working email/phone links, payment badges, copyright, and external social links.
- Login and sign-up modals with darkened backdrop, smooth open/close, white close button outside the panel, focus trap, mode switching, and corrected Pili terms copy.
- Destinations page: new hero with search UI, five destination cards (Palawan, Siargao, Bohol, Cebu, Banaue), story section and three featured packages.
- Packages page: night-skyline hero, overlapping search card, filter sidebar, six package cards with hearts, sort dropdown and pagination. Filters, sort, search and pagination are visual-only.
- Package detail pages: 420px hero with back button and breadcrumb, description, itinerary, working Inclusions/Exclusions/Rules tabs, booking sidebar with functional date and travelers/total, 7-image gallery and review cards. All six listing cards and three featured cards open their detail page.
- Booking page: tour summary, traveler/pickup form, promo code field, order summary with the carried date/travelers, service fee and total, free-cancellation date, help card and Return link. Book Now carries the detail page’s date and travelers into the summary.
- Booking review step: trip details, lead traveler, warning, order summary with total due, cancellation policy, Edit/Back links and Continue to payment.
- Payment step: express checkout buttons, card-details form, order summary, secure-checkout card, Back to review and a Pay button with the live total.
- Bookings page: four mock bookings with summary stats, functional status filters, per-booking trip/payment details, placeholder action buttons, a Return control and a support note. The profile menu’s My Bookings link opens it.
- Settings page: My Profile with a profile sidebar/nav/stats, editable personal, contact and emergency fields, local photo upload preview, password UI, and working Save/Cancel against local state.
- Admin console: Firebase email/password sign-in at `/admin/login`; `/admin` guarded by the admin email + `admins/{uid}` marker; reusable admin layout with a public-top-bar-style header (logo + profile only, no nav/second tier), full sidebar, static dashboard (stats, bar chart, pending actions, reservations) and separate admin footer. Public footer Admin/Operator links included. Dashboard content is static for now; most sidebar items remain inert.
- Admin destination management at `/admin/destinations`: Firestore-backed table with 11 seeded destinations, live tour counts, search/status filters, create/edit modal (unique slug, province-to-region automation, featured/sort/status), Cloudinary image upload with local preview/progress and URL fallback, plus active/inactive toggle. Deactivation preserves tours/bookings; no hard delete.
- Operator console: Firebase sign-in at `/operator/login`; `/operator` guarded by the operator email + `operators/{uid}` marker; reuses the admin header/sidebar/footer with an Operator menu and static dashboard (welcome banner, KPIs, live tours, latest bookings, weekly chart). My Tours at `/operator/tours` has working search/status filters, five tour rows and Edit Tour links; the package editor at `/operator/tours/:tourId/edit` supports local Save Draft, Publish and Delete.
- Data foundation: `DATA_MODEL.md`, `firestoreSchema.js`, 11 seeded destinations, 14 unified tours owned by `operator@gmail.com`, and `settings/platform`; seed script in `scripts/seedFirestore.mjs`.
- Wishlist hearts on homepage package cards, destination cards and package cards.
- Responsive layouts; focus-visible styles; 44px heart tap target.

**Intentional placeholders — do not “fix” without design input**
- The profile menu’s Notifications (`/notifications`) route is not built. The mock login state resets on full reload, and Logout only clears that local state.
- My Bookings is mock static data. View full details, Request change and Cancel booking are inert placeholders; there is no booking-detail page or cancellation backend.
- Public UI still reads the static package/destination arrays; only the Firestore seed exists so far. Destinations are admin-owned, tours are operator-owned, and no departures/bookings/users/reviews have been seeded.
- Settings is local-only: Save updates the page’s own state (sidebar name/photo) but nothing is persisted. Password fields are UI-only, and the Travel preferences/Notifications sidebar items have no sections yet.
- The admin dashboard uses static Figma values. User Management, Operators, Tour Packages, Reservations, Schedule Oversight, Cancellations & Refunds, Review Moderation, Reports & Analytics and Access Control are inert sidebar placeholders. Admin/operator access is a client-side guard until custom claims/backend rules exist.
- The operator dashboard uses static Figma values. Bookings, Tour Operations and Performance are inert sidebar placeholders; Add tour and View bookings are inert. My Tours edits are in-memory only and reset on reload; photo upload and the ellipsis menus are visual-only.
- Four of five homepage destination cards are grey `#D9D9D9` boxes.
- Three of four homepage popular-place cards are grey `#D9D9D9` boxes.
- Both carousel arrows are inert.
- Wishlist state is local to each heart; nothing is persisted.
- Public login/sign-up submit remains UI-only: submitting the public Login sets a mock header session; only `/admin` and `/operator` use real Firebase Auth and protected routes.
- Destination detail routes (`/destinations/aklan`, story CTA) are not built; package detail pages exist for all nine packages.
- Package detail copy for the non-Boracay packages is written placeholder content; the gallery is shared across packages.
- “Book Now” opens the booking flow. The details form, promo Apply, express-checkout buttons, card fields and **Pay** are UI-only; no Stripe integration or booking backend exists. Review and payment routes require details state.
- Packages page filters, search card, sort, “Apply filters”, “View package” and pagination are visual-only; they do not filter or navigate.
- The footer intentionally has no logo or navigation columns.

---

## 9. Conventions

- **Naming:** PascalCase components/files; `ComponentName.module.css`; camelCase CSS classes; camelCase props.
- **Imports:** relative paths only (no aliases), e.g. `import Button from '../../ui/Button/Button';`.
- **State:** local `useState`; avoid prop drilling; no global store yet.
- **Accessibility:** labelled sections (`aria-labelledby`), `aria-expanded`/`aria-controls` on the menu toggle, `aria-pressed` on the wishlist heart, focus-visible outlines, minimum 44px tap targets where practical.
- **Dependencies:** keep minimal; no UI/CSS/icon/animation packages.
- **Navigation:** use `Link`/`NavLink` from `react-router-dom` for site routes; use `/#hash` links for homepage sections so they work from other pages. Plain `<a>` is reserved for external or not-yet-built routes.

---

## 10. Verified limitations and technical debt

- Routing exists, but production hosting must serve `index.html` for `/destinations`, `/packages`, `/bookings`, `/settings`, `/admin`, `/admin/login`, `/admin/destinations`, `/operator`, `/operator/login`, `/operator/tours` and `/operator/tours/:tourId/edit` (SPA fallback); Vite dev/preview already do.
- Destination detail pages, a custom server and persistence are not implemented; package detail pages, the booking/review/payment steps and My Bookings are local UI only. Firestore is connected but no app data is read or written yet, and Auth remains mock.
- The signed-in header is a mock: refreshing the page returns to the guest Log in / Sign up state.
- The login and sign-up modals do not authenticate; their submits are prevented and Forgot Password has no destination.
- No tests or test framework; visual and responsive checks are manual.
- `README.md` is still the default Vite template.
- `src/Images/pili-logo.svg` is ~423 KB because it embeds a PNG; `Pili-logo-with-name.svg` is also large.
- Unused assets: `heroImage-1.png` (1920×450), `Pili-logo-with-name.svg`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/favicon.svg`, `public/icons.svg`.
- Unused token: `--header-height: auto` in `src/styles/index.css`.
- Fonts depend on the Google Fonts CDN.
- Card text in Destinations has no scrim (faithful to the comp).
- Payment marks may overflow their 44×23 badges by design (Visa/Apple Pay).
- The sticky header is tall (~162px on ≥768px), so anchored content starts well down the viewport.
- Footer "Contacts" can only reach the top of the footer on short pages; the browser stops at the page bottom.

---

## 11. Reference map and open questions

- **Design source of record:** Figma file `uqzVhcY0Jioe1sX3ZpNP2I`, frames `Home Page 3` (`50:109`), `Login Modal` (`108:667`), `Sign-up Modal` (`155:835`), `Destination Page` (`87:312`), `Package Page` (`124:2`), `Tour Details Page` (`194:96`), `Booking Page` (`243:462`), `Booking Review` (`248:462`) and `Booking Payment` (`253:591`). Frame references were carried over from design sessions; all recorded measurements were verified against the CSS.
- **Detailed specs:** `DESIGN_REFERENCE.md` (global tokens, header, hero, destinations, popular places, why choose, footer, primitives, auth modals, destination page, packages page, tour details page, booking/ review/ payment pages, assets).
- **Agent rules:** `AGENTS.md`.

**Open questions:** backend/auth provider, destination detail page designs, TypeScript adoption, real social-media URLs, whether the popular-places grid gets a second page, and logo SVG optimization.
