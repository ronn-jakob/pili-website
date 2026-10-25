# Pili Website — Consolidated Implementation Plan

Last updated: 22 October 2026

This file consolidates the project checklist, decisions, completed work, and remaining roadmap. It is the working source of truth until the project documentation is updated again.

---

## 1. Product scope

Pili is a React + Vite tour and travel platform with three sides:

1. **Traveler / client** — browse tours, register, book, pay, manage bookings, review.
2. **Tour operator** — create tours, schedule departures, manage capacity and reservations.
3. **Administrator** — manage destinations, moderate tours, manage users/operators, monitor bookings and reports.

There is no backend server. Firebase Spark and Cloudinary provide the backend services.

### Hard constraints

- Firebase Spark plan: no Cloud Functions, Firebase Storage, custom claims, scheduled jobs, or payment webhooks.
- Firestore client transactions plus security rules enforce capacity and ownership.
- Cloudinary unsigned uploads are used for images.
- Payments remain simulated until an external backend is available.
- Admin and operator consoles use Firebase Auth with `admins/{uid}` and `operators/{uid}` markers.
- The public site currently still uses mock authentication and static catalog data.
- The project is not a Git repository. Changes are direct file edits.
- Do not deploy Firestore rules or write production data without explicit confirmation.

---

## 2. Checklist status

Legend: **Done** = implemented and verified; **Partial** = UI exists but is static/mock or incomplete; **Not started**.

### A. Client / Traveler

| Module | Status | Current state |
|---|---|---|
| Homepage | Partial | Static featured tours, destinations and promotions |
| User registration | Not started | Mock auth modal only |
| Login / logout | Not started | No real traveler Firebase session |
| Tour listing | Partial | Static package data |
| Search and filters | Partial | Mostly visual; no date filter |
| Tour details | Partial | Static itinerary, inclusions, exclusions, rules |
| Departure schedule | Not started | No departure records or UI |
| Reservation form | Partial | Captures date/travelers in route state only |
| Price calculation | Partial | Static client calculation |
| My Bookings | Partial | Static mock records |
| Booking status | Partial | Displayed but no real state machine |
| Cancellation / modifications | Not started | No request workflow |
| Payment / confirmation | Partial | Simulated payment UI; no booking creation |
| Reviews and ratings | Partial | Static reviews displayed only |
| Traveler profile | Partial | Settings saves in local React state only |
| Notifications | Not started | No page or notification data |

### B. Tour Operator

| Module | Status | Current state |
|---|---|---|
| Operator registration | Not started | Seeded operator login only |
| Dashboard | Partial | Static KPIs and charts |
| Add Tour Package | Done | Firestore-backed Add Tour |
| Edit Tour Package | Done | Firestore-backed editor and review workflow |
| Delete Tour Package | Done with restriction | Draft-only delete; published tours are hidden/archived, not hard-deleted |
| Image upload | Partial | Destination images use Cloudinary; tour photos are visual-only |
| Departure scheduling | Not started | Planned Phase 3 |
| Capacity management | Not started | Planned Phase 3/6 |
| Reservation management | Not started | No operator bookings page |
| Traveler manifest | Not started | No manifest data |
| Pricing and discounts | Done in editor | Saved to Firestore; not yet applied by booking engine |
| Tour status management | Partial | Tour moderation statuses exist; departure statuses do not |
| Earnings and reports | Not started | Static dashboard only |
| Customer feedback | Not started | No operator reviews view |

### C. Administrator

| Module | Status | Current state |
|---|---|---|
| Admin login | Done | Firebase Auth + `admins/{uid}` marker |
| Admin dashboard | Partial | Static values |
| User management | Not started | No traveler users yet |
| Operator management | Not started | No approval/deactivation UI |
| Tour package management | Not started | Phase 2, next |
| Reservation monitoring | Not started | No bookings data |
| Schedule oversight | Not started | No departures |
| Cancellation / refund monitoring | Not started | No requests |
| Review moderation | Not started | No reviews |
| Reports and analytics | Not started | Static dashboard only |
| Destination management | Done | Firestore CRUD, Cloudinary, activation |
| Access control | Partial | Local rules exist; deployed rules are still open |

### D. System rules

| Requirement | Status |
|---|---|
| Slot availability | Not started |
| Concurrent reservations / overbooking prevention | Not started |
| Correct price calculation | Partial: static client calculation only |
| Operator ownership | Done in local rules and Firestore queries; rules not deployed |
| Booking deadline | Not started |
| Cancellation handling / slot release | Not started |
| Tour cancellation notifications | Not started |
| Review eligibility | Not started |
| API integration | Not started; maps/geocoding were previously removed |

---

## 3. Completed work

### Foundation

- Public site, booking flow, My Bookings, Settings, admin/operator login and shells.
- Admin dashboard and operator dashboard static implementations.
- Admin destination management at `/admin/destinations`.
- Firestore destination CRUD, Cloudinary image upload, province-to-region automation.
- Destination coordinates and Leaflet dependencies removed; destinations remain catalog categories.
- Seed data for 11 destinations, 14 unified tours and platform settings.
- Admin/operator route protection through Firestore marker documents.

### Phase 1 — Operator tour CRUD and review workflow

Implemented:

- `src/lib/tours.js` Firestore data layer.
- Firestore-backed `OperatorToursProvider`.
- `/operator/tours/new` Add Tour.
- Active-destination dropdown; Add Tour blocked when none are active.
- Save Draft and Submit for Review.
- Published/hidden edits move to `pending_review` and disappear publicly.
- Rejected tours remain hidden until updated and resubmitted.
- Pending-review and archived tours are read-only.
- Only drafts can be deleted.
- Operator list filters for Draft, Pending review, Published, Rejected, Hidden, Archived.
- Local rules for ownership, active destinations, status transitions and draft-only deletion.

### Phase 1.1 — Linked trip duration

Implemented:

- Separate Days and Nights number inputs.
- Invariant: `nights = days - 1`.
- Changing days updates nights; changing nights updates days.
- Generated labels such as `1 day`, `2 days / 1 night`, `3 days / 2 nights`.
- `durationNights` stored in Firestore.
- Existing tours remain compatible; nights are derived when missing.
- Seed script and documentation updated.

---

## 4. Roadmap

## Phase 2 — Admin tour moderation (next)

Purpose: complete the tour lifecycle so operators can submit and administrators can approve.

### Scope

- Enable the **Tour Packages** item in the admin sidebar.
- Add `/admin/tours` using `AdminLayout`.
- Pending-review queue with filters.
- Read-only tour detail view: content, itinerary, pricing, discounts, meeting point.
- Approve → `published`, set `publishedAt`.
- Reject → `rejected`, require a rejection reason.
- Hide → `hidden`.
- Archive → `archived`.
- Record `reviewedBy` and `reviewedAt`.
- Admin cannot edit tour content.
- Clear rejection reason on the next submission.

### Deferred

- Notifications to operators (planned Phase 7).
- Admin user/operator management.
- Bookings and departures.

### Acceptance

- Submitted tour appears in the admin queue.
- Approve/reject/hide persists after reload.
- Rejection reason appears in the operator editor.
- Admin content editing is impossible through the UI and rules.
- `npm run lint` and `npm run build` pass.

---

## Phase 3 — Departures, capacity and meeting points

Purpose: create bookable inventory separately from tour content.

### Key decision

A **tour** is the reusable product. A **departure** is one scheduled run of that tour.

Do not put capacity on the tour itself. One tour can have many departures with different dates, capacities and meeting points.

### Data

Top-level collection:

```text
departures/{departureId}
  tourId
  operatorId
  destinationId
  startAt
  endAt
  meetingTime
  meetingPoint {
    name
    address
    geo { lat, lng }
  }
  cutoffAt
  timezone
  capacity
  bookedTravelers
  lastBookingId
  status: scheduled | full | completed | cancelled
  cancellationReason
  createdAt
  updatedAt
```

### Operator UI

- Route: `/operator/tours/:tourId/departures`
- Only published tours can have new departures.
- Add/edit/cancel departures.
- Set date/time, cutoff, meeting point, capacity.
- Capacity cannot be lower than current `bookedTravelers`.
- Show available slots.

### Maps

Use React Leaflet + OSM for departure meeting points only:

- Operator map picker with address and stored `lat`/`lng`.
- Read-only map on public departure details.
- Do not reintroduce coordinates on destination documents.

OSM caveats:

- OSM public tiles require attribution and are not intended for heavy production traffic.
- For production, use a tile provider such as MapTiler, Stadia Maps or Thunderforest, or self-host tiles.
- Nominatim public geocoding is rate-limited and unsuitable for autocomplete/bulk use.
- Prefer manual pin placement over address-search dependency.

### Tour images

Add Cloudinary tour image uploads. Decide whether to create a `pili_tours` unsigned preset or reuse `pili_destinations`.

### Capacity enforcement

- Phase 3 creates the capacity fields and operator UI.
- Transactional capacity enforcement is completed in Phase 6 with bookings.

### Acceptance

- Operator can create multiple departures for one published tour.
- Capacity and status persist.
- Public departure schedule can be displayed.
- Meeting-point map works with OSM tiles and attribution.

---

## Phase 4 — Public catalog and API integration

Purpose: replace static public catalog data with Firestore.

### Scope

- Migrate `/destinations`, `/packages` and package details to Firestore.
- Show only published tours whose destination is active.
- Functional search and filters: destination, price, tour type; date filter once departures exist.
- Show departure schedules, slots, meeting point and cutoff.
- Update homepage featured tours/destinations from Firestore.
- Keep promotions static unless a promotion model is added.
- Add graceful loading/empty/error states.

### API integration

Checklist requires a working maps, geocoding, weather or other relevant API.

Recommended options:

1. **OSM + React Leaflet** — satisfies maps integration.
2. **Open-Meteo weather** — free, no key, use destination/province or departure coordinates.
3. A tile provider API if OSM public tiles are not acceptable for production.

Do not reintroduce destination coordinates for catalog data.

### Acceptance

- Public pages read Firestore.
- Inactive destinations and unpublished tours are hidden.
- Search/filter controls work.
- Departure schedules and meeting maps appear correctly.
- API failure degrades gracefully.

---

## Phase 5 — Real traveler authentication and profile

Purpose: replace the mock public auth UI.

### Scope

- Firebase traveler registration/login/logout.
- Create `users/{uid}` on registration.
- Traveler profile fields: name, email, phone, address, emergency contact, preferences.
- Replace public auth modal behavior.
- Route guards for `/bookings`, `/settings` and checkout.
- Move Settings/profile to Firestore.
- Add traveler-only security rules.

### Acceptance

- Traveler can register, log in, reload and remain authenticated.
- Profile changes persist.
- Unauthenticated users are redirected from protected pages.
- No traveler can read or modify another traveler’s profile.

---

## Phase 6 — Booking engine, capacity and payment

Purpose: complete the reservation lifecycle.

### Scope

- Reservation form selects a departure and traveler counts.
- Calculate pricing from Firestore tour pricing and discounts.
- Apply service fees/taxes according to settings.
- Create booking with a unique human-readable reference.
- Update departure capacity in a Firestore transaction.
- Prevent overbooking under concurrent requests.
- Reject bookings after `cutoffAt`.
- Simulated payment with `unpaid`, `deposit_paid`, `paid`, `refund_pending`, `refunded`.
- Booking statuses: `pending`, `confirmed`, `completed`, `cancelled`.
- My Bookings reads real traveler bookings.
- Cancellation requests release capacity according to policy.
- Manual cleanup path for expired pending holds; no scheduled functions.

### Booking transaction

1. Read departure.
2. Reject cancelled/completed/past-cutoff departures.
3. Reject if `bookedTravelers + partySize > capacity`.
4. Create booking with generated ID and reference.
5. Update departure `bookedTravelers`, `lastBookingId`, and `full` status.
6. Rules correlate the booking and counter update.

### Acceptance

- Concurrent bookings cannot exceed capacity.
- Prices match traveler counts and discounts.
- Booking references are unique.
- Cancellation releases slots.
- My Bookings and payment status persist.
- Rules prevent direct counter tampering.

---

## Phase 7 — Reviews and notifications

### Reviews

- Only travelers with a completed eligible booking can review.
- One review per booking, document ID = booking ID.
- Ratings 1–5, title, comment, optional photos.
- Moderation status: `pending`, `published`, `hidden`.
- Admin review moderation page.
- Operator feedback view.

### Notifications

- In-app notifications for:
  - booking created/confirmed/cancelled
  - tour approved/rejected
  - departure cancelled
  - refund status changes
- Notification page and unread state.
- No email/push automation on Spark.

### Acceptance

- Ineligible travelers cannot review.
- Reviews require moderation before public display.
- Notifications appear for the correct user/role and persist.

---

## Phase 8 — Remaining operator/admin modules and security deployment

### Operator

- Operator registration/application.
- Admin approval/rejection/deactivation.
- Reservation management.
- Traveler manifest per departure.
- Earnings and reports.
- Customer feedback.
- Departure status management: scheduled, full, completed, cancelled.

### Admin

- User management.
- Operator management.
- Reservation monitoring.
- Schedule oversight.
- Cancellation/refund monitoring.
- Review moderation.
- Reports and analytics.
- Access control management.

### Firestore rules

Current local rules cover:

- admins/operators markers
- active destinations
- public published tours with active destinations
- operator tour ownership
- tour status transitions
- admin moderation fields
- draft-only tour deletion

Still needed before full deployment:

- users/profile rules
- departures rules
- bookings and capacity transaction rules
- reviews rules
- notifications rules
- audit log rules

The deployed rules are temporary open rules until **20 November 2026**. Validate and deploy the rules with explicit approval before that date.

---

## 5. Important data model decisions

### Tours

- Collection: `tours`
- Owner: `operatorId`
- Statuses: `draft`, `pending_review`, `published`, `rejected`, `hidden`, `archived`
- Duration: `durationDays`, `durationNights`, generated `durationLabel`
- Published edits move to `pending_review` and hide the tour publicly.
- Rejected tours stay hidden until resubmitted and approved.
- Only `draft` tours can be deleted.

### Destinations

- Admin-owned catalog categories.
- Active/inactive only; no hard delete.
- Deactivation hides the destination and its tours publicly while preserving history.
- Region/province come from static PSGC data.
- No destination coordinates.

### Departures

- Separate top-level collection.
- Capacity and counters live here.
- Statuses: `scheduled`, `full`, `completed`, `cancelled`.
- Meeting-point coordinates belong here, not on destinations.

### Bookings

- Reference a specific departure.
- Store tour and traveler snapshots.
- Store pricing snapshot and amounts.
- Capacity changes only through the booking transaction.

---

## 6. Current files of interest

- `src/lib/tours.js` — operator tour CRUD, duration mapping, active destinations.
- `src/context/OperatorToursProvider.jsx` — Firestore tour subscription.
- `src/pages/OperatorToursPage/` — operator tour list.
- `src/pages/OperatorEditTourPage/` — Add/Edit Tour and duration inputs.
- `src/pages/AdminDestinationsPage/` — destination management.
- `src/components/sections/admin/AdminDestinationForm/` — destination form and Cloudinary upload.
- `src/lib/destinations.js` — destination CRUD.
- `src/lib/cloudinary.js` — image validation/compression/upload.
- `firestore.rules` — local security rules.
- `DATA_MODEL.md` — Firestore schema.
- `DESIGN_REFERENCE.md` — Figma/design implementation notes.
- `PROJECT_CONTEXT.md` — architecture and file map.
- `scripts/seedFirestore.mjs` — repeatable seed script.

---

## 7. Open decisions

1. **Multi-operator support**
   - Keep the single seeded `operator@gmail.com`, or implement full operator registration and admin approval?
2. **Cloudinary tour preset**
   - Create a dedicated `pili_tours` unsigned preset, or reuse `pili_destinations`?
3. **Production map tiles**
   - Use OSM public tiles for demo only, or choose MapTiler/Stadia/Thunderforest?
4. **API integration choice**
   - OSM maps only, Open-Meteo weather, or both?
5. **Rules deployment**
   - When to validate and deploy the local Firestore rules before 20 November 2026?

---

## 8. Verification

Run after meaningful changes:

```bash
npm run lint
npm run build
```

Additional checks:

```bash
node --check scripts/seedFirestore.mjs
```

Browser verification should cover:

- Operator Add/Edit Tour, duration linking, save/reload, submit, pending lock and draft delete.
- Admin destination CRUD and Cloudinary upload.
- Admin moderation once Phase 2 exists.
- Departure creation and capacity once Phase 3 exists.
- Concurrent booking behavior once Phase 6 exists.

Temporary test data must be clearly labeled and deleted after verification.

---

## 9. Known gaps and risks

- Public catalog, auth, bookings and profile are still static/mock.
- Admin tour moderation does not exist yet; submitted tours stay pending.
- No departures, capacity, bookings, payments or reviews.
- Tour photo upload is visual-only.
- Local Firestore rules are not deployed; deployed rules are temporary open rules.
- Rules for users, departures, bookings, reviews and notifications are not written yet.
- No automated test suite.
- Firebase bundle exceeds the Vite chunk-size warning threshold; not a functional blocker.
- `npm audit` reports Firebase/gRPC transitive issues; the suggested fix is a breaking downgrade and has not been applied.
