# Pili Tour and Travel — Project Context

> Verified against the source on 2026-10-20. The repository is **not** a git repository.
> Exact visual specifications live in [`DESIGN_REFERENCE.md`](./DESIGN_REFERENCE.md).

---

## 1. Overview and scope

**Pili** is a React + Vite marketing site for a Philippine tour and travel brand. It is intended to help visitors discover destinations, browse tour packages and special offers, and eventually book trips.

**Currently implemented:** the public homepage, Firestore-backed destinations/packages listings, package detail pages with departures and date filtering, traveler Firebase auth and profiles, operator applications and dual-role access, guarded three-step checkout with shared pricing/discounts, Stripe test-mode payment through the local Express API, real Firestore My Bookings and same-price departure change requests, traveler notifications, admin destination/category/user/operator/booking/report management and tour/review moderation, and operator tour/departure/reservation/manifest/feedback/report management.

**Not implemented:** destination detail pages beyond the listing cards, admin/operator notification consoles, wishlist persistence, real payment capture, production backend deployment, automated end-to-end tests, and production Firestore rules deployment.

**Running the app:** `npm run dev` (Vite, port 5173). For Stripe checkout, also run `npm run server` (Express, port 4242) with `server/.env` configured.

---

## 2. Technology stack (verified)

| Area | Technology |
|---|---|
| UI | React `^19.2.8`, React DOM `^19.2.8` |
| Build/dev server | Vite `^8.3.0` with `@vitejs/plugin-react` `^6.1.1` |
| Language | JavaScript + JSX (no TypeScript) |
| Styling | Plain CSS Modules; global custom properties in `src/styles/index.css` |
| Routing | `react-router-dom` `^7.18.4` (`BrowserRouter`, layout routes, `/`, `/destinations`, `/packages`, `/packages/:packageId`, `/packages/:packageId/book`, `/book/review`, `/book/payment`, `/bookings`, `/bookings/:bookingId`, `/notifications`, `/settings`, `/admin`, `/admin/login`, `/admin/tours`, `/admin/categories`, `/admin/reviews`, `/admin/users`, `/admin/operators`, `/admin/bookings`, `/admin/refunds`, `/admin/departures`, `/admin/reports`, `/admin/notifications`, `/admin/destinations`, `/operator`, `/operator/login`, `/operator/tours`, `/operator/reservations`, `/operator/reviews`, `/operator/reports`, `/operator/notifications`, `/operator/tours/:tourId/edit`) |
| Lint | ESLint `^10.10.0` flat config, React Hooks + React Refresh plugins |
| Fonts | Google Fonts CDN: Poppins (body), Inter (headings), Kaushan Script (accents) |
| Integrations | Figma MCP and Firebase MCP (Firestore only) declared in `opencode.json`; Cloudinary unsigned image uploads; Stripe test-mode Checkout through the local Express server |
| Database | Firebase / Cloud Firestore project `pili-website`, database `(default)` in `asia-southeast1`; client initialized in `src/lib/firebase.js` |

Firebase 13 powers traveler auth, the public catalog, operator tours/departures/reservations, admin destinations/categories/users/operators/bookings/reports, Settings profiles, booking changes and traveler bookings. The Stripe test-mode Payment Element uses the local `server/` Express API. Dashboard KPIs and some public enrichment content remain static. No state-management library, CSS framework, icon package, animation library, or test framework is installed.

**Stripe server:** copy `server/.env.example` to `server/.env`, set `STRIPE_SECRET_KEY`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `CLIENT_URL=http://localhost:5173` and `PORT=4242`, then run `npm run server`. Add `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` to the client `.env.local`. Vite proxies `/api` to port 4242. No webhook is used; the Payment Element confirms through `GET /api/payment-intent` on completion. Never commit `server/.env` or `server/service-account.json`.

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
├── firestore.rules             # local rules for markers, users, destinations, categories, tours and departures (not deployed)
├── firestore.indexes.json
├── .env.example                # Cloudinary, MapTiler and optional Stripe API base placeholders
├── .env.local                  # real client env values (ignored)
├── server/                     # local Stripe PaymentIntent API
│   ├── index.js                # Express routes and auth middleware
│   ├── bookings.js             # Checkout Session create/confirm + capacity release
│   ├── firebaseAdmin.js        # Firebase Admin credentials
│   └── .env.example
├── scripts/
│   ├── seedFirestore.mjs       # seed destinations, tours and platform settings
│   └── cleanupExpiredBookings.mjs # release expired pending bookings and capacity holds
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
│   │   ├── BookingDetailPage/   # BookingDetailPage.jsx + module.css
│   │   ├── SettingsPage/        # SettingsPage.jsx + module.css
│   │   ├── AdminDashboardPage/  # AdminDashboardPage.jsx + module.css
│   │   ├── AdminToursPage/      # AdminToursPage.jsx + module.css
│   │   ├── AdminCategoriesPage/ # AdminCategoriesPage.jsx + module.css
│   │   ├── AdminReviewsPage/    # AdminReviewsPage.jsx + module.css
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
│   │   ├── useOperatorTours.js
│   │   ├── TravelerAuthContext.js
│   │   ├── TravelerAuthProvider.jsx # Firebase Auth session + users/{uid} profile subscription
│   │   └── useTravelerAuth.js
│   ├── hooks/
│   │   └── usePublicPackage.js   # Firestore-backed package loading for checkout
│   ├── utils/
│   │   ├── booking.js            # money/date/cancellation helpers
│   │   └── travelers.js          # adult/child/infant normalization, labels and pricing
│   ├── lib/
│   │   ├── firebase.js           # Firebase app + Auth + Firestore instance (exports app, auth, db)
│   │   ├── firestoreSchema.js    # collection names + status enums
│   │   ├── destinations.js       # destination CRUD + tour-count queries
│   │   ├── categories.js         # admin categories + active category queries
│   │   ├── tours.js              # operator tour CRUD, active destinations, status mapping
│   │   ├── departures.js         # operator departure CRUD and capacity fields
│   │   ├── bookings.js           # booking creation, capacity transaction, traveler queries
│   │   ├── bookingMapper.js      # booking docs → My Bookings cards/stats
│   │   ├── reviews.js            # review creation/queries + admin moderation
│   │   ├── paymentApi.js         # calls to the local Stripe PaymentIntent API
│   │   ├── publicCatalog.js      # Firestore published tours → public package cards
│   │   ├── maps.js               # MapTiler/OSM tile config, geocoding, location validation
│   │   ├── cloudinary.js         # destination/tour image validation/compression/upload
│   │   ├── adminAuth.js          # admin email/doc check + login error messages
│   │   ├── operatorAuth.js       # operator email/doc check + login error messages
│   │   ├── travelerAuth.js       # traveler signup/login/logout + users/{uid} profile creation
│   │   └── travelerProfile.js    # users/{uid} profile ↔ Settings form mapping and updates
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
│       │   ├── RequireTraveler/  # traveler guard; redirects guests to the login modal
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
  /packages/:packageId/book → RequireTraveler → BookingPage
  /packages/:packageId/book/review → RequireTraveler → BookingReviewPage
  /packages/:packageId/book/payment → RequireTraveler → BookingPaymentPage
  /bookings       → RequireTraveler → BookingsPage
  /bookings/:bookingId → RequireTraveler → BookingDetailPage
  /notifications  → RequireTraveler → NotificationsPage
  /reviews        → RequireTraveler → NeedsReviewPage
  /wishlist       → RequireTraveler → WishlistPage
  /settings       → RequireTraveler → SettingsPage (includes operator application)
  /admin/login    → AdminLoginPage (standalone)
  /admin          → AdminLayout → AdminDashboardPage
  /admin/tours    → AdminToursPage
  /admin/categories → AdminCategoriesPage
  /admin/reviews → AdminReviewsPage
  /admin/users → AdminUsersPage
  /admin/operators → AdminOperatorsPage
  /admin/bookings → AdminBookingsPage
  /admin/refunds → AdminRefundsPage
  /admin/departures → AdminDeparturesPage
  /admin/reports → AdminReportsPage
  /admin/notifications → NotificationsPage
  /admin/destinations → AdminDestinationsPage
  /operator/login → OperatorLoginPage (standalone)
  /operator       → OperatorLayout → OperatorDashboardPage
  /operator/tours → OperatorToursPage
  /operator/reservations → OperatorReservationsPage
  /operator/reviews → OperatorReviewsPage
  /operator/reports → OperatorReportsPage
  /operator/notifications → NotificationsPage
  /operator/tours/new → OperatorEditTourPage
  /operator/tours/:tourId/edit → OperatorEditTourPage
  /operator/tours/:tourId/departures → OperatorDeparturesPage
Footer             ← contacts, payment badges, copyright, socials + Admin/Operator links (id="contacts")
```

**Home** renders `Hero` (rotating photos with a working package search), Firestore-backed `Destinations` (horizontal scroll carousel), Firestore-backed `PopularPlaces` (4 more per click), and static `WhyChoose`.
**DestinationsPage** loads active Firestore destinations and renders `DestinationsHero` (working destination search), the top five `PopularDestinations` by admin sort order, `StorySection`, and the remaining destinations in `FeaturedPackages`. A `?search=` query shows filtered destination results instead.
**PackagesPage** loads published Firestore tours and their public departure dates, then renders `PackagesHero` and `PackagesListing` (Firestore cards, functional category/duration/budget/date filters, sort and pagination).
**PackageDetailPage** uses static package data when available and otherwise maps a published Firestore tour, merges Firestore content/departures, and renders `PackageDetailHero`, `PackageDetailBody`, `PackageGallery` and `PackageReviews`. Firestore-only tours are bookable when they have a price and an available departure; unknown IDs redirect to `/packages`.
**BookingPage**, **BookingReviewPage** and **BookingPaymentPage** load the package through `usePublicPackage` so direct visits and Firestore-only tours work. They require a selected `departureId` plus `{ date, travelers, details }` in router state. The payment page creates the booking and Stripe PaymentIntent, then mounts the card-only Payment Element inside the page (`StripePaymentElement.jsx`). `VITE_STRIPE_PUBLISHABLE_KEY` is required; the secret key stays in `server/.env`.
**BookingsPage** reads real bookings from `getTravelerBookings(uid)`, maps them through `bookingMapper.js`, handles the `stripe=success` / `stripe=cancelled` return states, and provides cancellation controls. Unpaid cancellations release capacity immediately; paid cancellations create a refund request that must be approved by an admin.
**BookingDetailPage** loads a single booking by ID, verifies traveler ownership, and shows the tour snapshot, departure, lead traveler, traveler counts, payment breakdown, refund/cancellation state, booking summary and support contact. It also loads the booking’s review, offers a review form when the trip is eligible, and lets the traveler request a same-price departure change through `bookingChanges`.
**PackageReviews** shows published Firestore reviews for the current tour; if none exist, it falls back to the static seeded review cards.
**NotificationsPage** subscribes to the signed-in traveler’s `notifications` documents, splits All/Unread, shows relative event details and links, marks one or all as read, and is protected by `RequireTraveler`.
**NeedsReviewPage** lists paid, confirmed/completed bookings whose departure ended or was marked completed and which have no existing review; it opens the review modal in place.
**WishlistPage** lists the traveler’s saved published tours from `users/{uid}/wishlist`, with remove-heart actions and links to package details.
**SettingsPage** loads and saves the Firestore traveler profile with `SettingsSidebar`, `SettingsPhotoRow`, `SettingsProfileForm`, `SettingsSecurity` and `SettingsActions`. It also includes `SettingsOperatorApplication`, which submits `operatorApplications/{uid}` and shows pending/rejected/approved status; approval creates `operators/{uid}` and unlocks the operator console for the same account.
**AdminLoginPage** is a standalone Firebase sign-in screen. **AdminLayout** guards `/admin`, then renders `AdminHeader` (logo + profile menu only), `AdminSidebar`, the page content and `AdminFooter`. **AdminDashboardPage** composes `AdminStatCards`, `AdminBookingChart`, `AdminPendingActions` and `AdminRecentReservations` from static admin data. **AdminToursPage** reads all `tours`, shows moderation summaries and filters, and opens `AdminTourReview` for approve/reject/hide/archive actions. **AdminCategoriesPage** manages active/inactive tour categories through `AdminCategoryForm`. **AdminReviewsPage** reads all reviews, filters pending/published/hidden, searches by tour/traveler/reference, and approves or hides reviews. **AdminUsersPage** lists/searches traveler accounts and disables/enables them. **AdminOperatorsPage** reviews operator applications, approves/rejects them and suspends/reactivates operator accounts. **AdminBookingsPage** monitors all bookings and payment states. **AdminRefundsPage** reviews customer refund requests, approves Stripe test refunds and rejects requests with an admin note. **AdminReportsPage** computes live revenue/status/tour reports with CSV export. **AdminDestinationsPage** reads the `destinations` collection, shows tour counts, searches/filters, and creates/edits/deactivates destinations through `AdminDestinationForm`.
**OperatorLoginPage** is the equivalent standalone operator sign-in. **OperatorLayout** guards `/operator`, shows a **Return to main website** link in the header, and reuses `AdminHeader`, `AdminSidebar`, `AdminFooter` with operator nav/labels. It renders **OperatorDashboardPage** from live Firestore tours/bookings (KPIs, live tours, recent bookings and weekly chart, with static fallback data). Its nested routes also render **OperatorToursPage** (searchable/filterable tour list), **OperatorReservationsPage** (bookings, change requests and departure manifests with CSV export), **OperatorReviewsPage** (published feedback), **OperatorReportsPage** (live revenue + CSV), **OperatorEditTourPage** (Firestore-backed tour form) and **OperatorDeparturesPage** (departure schedule, capacity, cancel and complete actions; completing marks confirmed/paid bookings completed and unlocks reviews).

**State:** local `useState` only.
- `Header` — `menuOpen`; `authMode` is derived from `?auth=login|signup`; the traveler session comes from `TravelerAuthProvider`.
- `WishlistButton` — `wishlisted` per instance (homepage package card, destination card or package card; not persisted).
- `PackageDetailBody` — departure date, separate adult/child/infant counters (total 1–8), active detail tab, derived total and active itinerary map modal.
- `BookingsPage` — Firestore booking list, loading/load-error state, Stripe return banners, `activeFilter` (`All | Pending | Confirmed | Completed | Cancelled`) and derived summary stats/cards.
- `SettingsPage` — loads the signed-in traveler from `users/{uid}` via `travelerToForm`, keeps `savedProfile` / `draft`, uploads profile photos through Cloudinary, tracks `activeSection`, upload error/progress and save status. Save calls `updateTravelerProfile`; Cancel restores the last saved values. `SettingsOperatorApplication` manages `operatorApplications/{uid}` and shows pending/rejected/approved state.
- `AdminLayout` — Firebase session (`loading`, `user`), verifies the admin email/`admins/{uid}` marker, signs out unauthorized users, and redirects to `/admin/login`.
- `AdminDestinationsPage` — Firestore destination list/tour counts, search/status filter, create/edit modal and active/inactive toggle.
- `AdminToursPage` — Firestore tour moderation list, summary counts, search/status filter and `AdminTourReview` modal.
- `AdminCategoriesPage` — Firestore category list, search/status filter, create/edit modal and active/inactive toggle.
- `AdminUsersPage` — Firestore traveler list/search and active/disabled toggle.
- `AdminOperatorsPage` — operator application queue, approve/reject reasons, active/suspended operator management.
- `AdminBookingsPage` — all-booking monitoring with status/payment filters and summary totals.
- `AdminReportsPage` — live revenue, booking-status and tour performance reports with CSV export.
- `AdminLoginPage` — email, password, submitting/checking flags and error; redirects an already-signed-in admin to `/admin`.
- `OperatorLayout` — Firebase session, verifies the active `operators/{uid}` marker for any approved account, signs out unauthorized users, and redirects to `/operator/login`.
- `OperatorLoginPage` — same login state/error flow; redirects a signed-in operator to `/operator`.
- `TravelerAuthProvider` — Firebase Auth session plus live `users/{uid}` and `operators/{uid}` subscriptions; exposes `traveler`, `operatorProfile`, `isOperator`, `loading`, `login`, `register` and `logout`.
- `NotificationsPage` — live notification list/loading/error state, All/Unread filter and mark-all progress.
- `useUnreadNotifications` — subscribes to the signed-in traveler’s notifications and supplies the unread count for the ProfileMenu badge.
- `OperatorToursProvider` — Firestore subscription to the signed-in operator’s tours.
- `OperatorToursPage` — search query and status filter across Draft, Pending review, Published, Rejected, Hidden and Archived.
- `OperatorReservationsPage` — operator bookings, pending change approvals/rejections, departure manifests and CSV export.
- `OperatorReviewsPage` — published customer feedback and rating summary for the operator’s tours.
- `OperatorReportsPage` — live monthly/tour revenue and CSV export.
- `OperatorEditTourPage` — Firestore-backed Add/Edit Tour with linked Days/Nights, itinerary map pins, a dedicated website cover image, tour gallery uploads, pricing/early-bird/group discount fields, Save Draft, Submit for Review and draft-only deletion.
- `OperatorDeparturesPage` — Firestore-backed departure schedule with add/edit/cancel/complete, meeting-point map pins, capacity progress and status filtering.
- `bookings.js` — `createBooking` transaction (tour/departure/settings reads, shared pricing snapshot, capacity increment) and traveler booking queries.
- `bookingChanges.js` — traveler same-price departure change requests and operator/admin approval/rejection transactions.
- `operatorBookings.js` — operator/admin booking queries and date mapping.
- `server/` — Express API that creates and verifies Stripe PaymentIntents, validates booking totals against shared pricing, confirms paid bookings, cancels/refunds bookings (traveler and admin), releases capacity, stores `payments/{paymentIntentId}`, writes traveler notifications and records admin audit logs. No webhook is used.
- `scripts/cleanupExpiredBookings.mjs` — manual cleanup for pending bookings past `holdExpiresAt`; cancels open PaymentIntents and releases capacity. Supports `--dry-run`.

`AuthModal` renders into `document.body` via a portal; while open it locks body scroll, traps focus, and closes on Escape, backdrop click, or the × button. Switching between login and sign-up keeps it open and moves focus to the first field. Login and sign-up submit through `onLogin` / `onSignup`, which call Firebase Auth and create the `users/{uid}` traveler profile; the modal shows validation, loading and Firebase error states.

`ProfileMenu` (under `sections/shared/`) replaces Sign up/Login with a 36px circular avatar when a traveler profile exists; the avatar shows the Cloudinary profile photo when present. Clicking it opens a dropdown with My Bookings, Needs Review, Notifications, Settings, an Operator dashboard link for approved operators, and Logout; it closes on outside click/Escape, and Logout signs out Firebase Auth. My Bookings, Needs Review (with count), Notifications (with count), Settings and the operator console are router links. Tour hearts are backed by `WishlistProvider`; the header Wishlist link opens `/wishlist`. The avatar is also visible on mobile next to the hamburger, and the mobile menu hides its guest auth actions.

Firestore fetching now exists for public packages, destinations, package details, departures and homepage destination/popular-place sections. Static fallback content remains in `Destinations.jsx`, `PopularPlaces.jsx`, `WhyChoose.jsx`, `FeaturedPackages.jsx` and `Footer.jsx`; package seed/detail copy and cancellation windows live in `src/data/packages.js`, mock account bookings in `src/data/bookings.js`, profile defaults in `src/data/profile.js`, and the portal dashboards use `adminDashboard.js` / `operatorDashboard.js`.

**Firebase:** the MCP server is connected as `viquieraronnjakob@gmail.com`; project `pili-website` is active. Cloud Firestore has one `(default)` database in `asia-southeast1`. It currently contains the `admins/{uid}` and `operators/{uid}` markers, **11 seeded destinations**, **14 unified tours** owned by `operator@gmail.com`, and `settings/platform`. The full model is in `DATA_MODEL.md`; collection/status constants are in `src/lib/firestoreSchema.js`. The deployed rules are Firebase’s temporary open rules expiring **20 November 2026**; the local `firestore.rules` now allows public reads of active destinations/published tours, admin writes to destinations, operator reads of their own tours, and admin/operator marker reads. It has **not** been deployed.

**Navigation:** the logo, the header's Destinations/Packages links and the homepage “See more” links use React Router (`NavLink` for the active section). Home / About us / Contacts link to `/#top`, `/#why-choose` and `/#contacts`; `ScrollManager` handles the hash and `scroll-padding-top` keeps targets below the sticky header. The header's Login and Sign up buttons open the URL-driven auth modal; successful login/signup switches the header to the avatar/profile menu. **My Bookings** in that menu opens `/bookings`; **Notifications** opens `/notifications`; **Settings** opens `/settings`; Logout signs out Firebase Auth. The public footer’s bottom row includes **Admin** and **Operator** links to `/admin/login` and `/operator/login`; `/admin` and `/operator` redirect signed-out users to their login pages. Admin sidebar **Destinations** opens `/admin/destinations`. Homepage destination cards and the Destinations page Popular Destinations cards lead to `/packages?search=<destination>`; homepage Popular Places cards open `/packages/:packageId`; both “See more” links lead to `/packages`. Package cards open `/packages/:packageId`. The detail page’s **Book Now** requires a selected departure and opens `/book` with the date, travelers and `departureId`; **Continue to review** opens `/book/review`; **Continue to payment** opens `/book/payment`. Review/payment require that state, and Back/Edit links preserve it. Wishlist, Special Offers and the story CTA remain placeholder links.

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
| `AuthModal` | Login / sign-up dialog | Portal-rendered overlay with darkened backdrop, enter/exit transitions, focus trap, scroll lock and a close button outside the panel. Two modes: single-column login and two-column sign-up. Forms call Firebase traveler auth, show loading/errors, and create `users/{uid}` on sign-up. Specs in `DESIGN_REFERENCE.md` §10. |
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
- Package records, itineraries and inclusions live in `src/data/packages.js`; published Firestore reviews replace the static review cards when available, with the static cards as fallback. Mock account bookings live in `src/data/bookings.js`; profile defaults live in `src/data/profile.js`.
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
- Booking page: tour summary, traveler/pickup form, promo code field, order summary with the carried date and adult/child/infant breakdown, service fee and total, free-cancellation date, help card and Return link. Book Now carries the detail page’s date and traveler breakdown into the summary.
- Booking review step: trip details, lead traveler, warning, order summary with total due, cancellation policy, Edit/Back links and Continue to payment.
- Payment step: order summary, a “Continue to secure payment” action, then a card-only Stripe Payment Element mounted inside the page. Paying confirms the booking without leaving Pili.
- Bookings page: real Firestore traveler bookings with summary stats, functional status filters, per-booking trip/payment details, a Return control, a support note, and Stripe success/cancel banners.
- Settings page: Firestore-backed traveler profile with a profile sidebar/nav/stats, editable personal, contact and emergency fields, local photo upload preview, password UI, and working Save/Cancel against `users/{uid}`.
- Admin console: Firebase email/password sign-in at `/admin/login`; `/admin` guarded by the admin email + `admins/{uid}` marker; reusable admin layout with a public-top-bar-style header (logo + profile only, no nav/second tier), full sidebar, static dashboard (stats, bar chart, pending actions, reservations) and separate admin footer. Public footer Admin/Operator links included. Dashboard content is static for now; most sidebar items remain inert.
- Admin destination management at `/admin/destinations`: Firestore-backed table with 11 seeded destinations, live tour counts, search/status filters, create/edit modal (unique slug, province-to-region automation, featured/sort/status), Cloudinary image upload with local preview/progress and URL fallback, plus active/inactive toggle. Deactivation preserves tours/bookings; no hard delete.
- Operator console: Firebase sign-in at `/operator/login`; `/operator` guarded by the operator email + `operators/{uid}` marker; reuses the admin header/sidebar/footer with an Operator menu and static dashboard (welcome banner, KPIs, live tours, latest bookings, weekly chart). My Tours at `/operator/tours` has working search/status filters, five tour rows and Edit Tour links; the package editor at `/operator/tours/:tourId/edit` supports local Save Draft, Publish and Delete.
- Data foundation: `DATA_MODEL.md`, `firestoreSchema.js`, 11 seeded destinations, 14 unified tours owned by `operator@gmail.com`, and `settings/platform`; seed script in `scripts/seedFirestore.mjs`.
- Wishlist hearts on homepage package cards, destination cards and package cards.
- Responsive layouts; focus-visible styles; 44px heart tap target.

**Intentional placeholders — do not “fix” without design input**
- The profile menu’s Notifications route now opens the traveler notification center. Notification documents are created by the Stripe server for booking/payment/cancellation/refund events and by review moderation; admin/operator notification consoles remain unbuilt. Traveler auth/profile and logout are real Firebase Auth backed by `users/{uid}`.
- My Bookings uses real Firestore bookings and supports cancellation. View full details and Request change remain inert placeholders; there is no booking-detail page yet.
- Public package/destination content, departures, traveler users, bookings, reviews and traveler notifications are Firestore-backed. Email/push notifications and payment webhooks are not implemented.
- Settings profile fields persist to Firestore. Password fields are UI-only, profile photo upload is a local preview, and Travel preferences/Notifications sidebar items have no sections yet.
- The admin dashboard uses static values. User Management, Operators, Reservations, Schedule Oversight, Cancellations & Refunds, Reports & Analytics and Access Control remain placeholders. Review Moderation is implemented.
- The operator dashboard uses static values. Bookings, Tour Operations and Performance remain placeholders; operator tour/departure editing is Firestore-backed.
- Wishlist state is local to each heart; nothing is persisted.
- Destination detail routes (`/destinations/aklan`, story CTA) are not built.
- “Book Now” requires a selected departure and opens the real booking flow. The Stripe Payment Element runs in test mode through `server/`; no real money is charged and no payment webhook is used.
- Packages page filters, search, sort and pagination are functional.
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

- Routing exists, but production hosting must serve `index.html` for `/destinations`, `/packages`, `/bookings`, `/notifications`, `/settings`, `/admin`, `/admin/login`, `/admin/destinations`, `/operator`, `/operator/login`, `/operator/tours` and `/operator/tours/:tourId/edit` (SPA fallback); Vite dev/preview already do.
- Destination detail pages are not implemented. Firestore powers the catalog, traveler auth/profile, bookings, operator tours/departures and admin catalog/moderation.
- The public header restores the Firebase traveler session on reload.
- The login and sign-up modals authenticate with Firebase Auth; Forgot Password still has no destination.
- Stripe payment confirmation depends on the traveler returning to Pili because no webhook is configured.
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
