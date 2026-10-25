# Pili Firestore Data Model

The project uses Firebase Auth + Cloud Firestore on the **Spark plan**. There are no Cloud Functions, so capacity, ownership and pricing invariants must be enforced with **client transactions + security rules**.

## Identity and roles

- Firebase Auth UID is the primary identity.
- Roles are stored in Firestore until custom claims are available:
  - `admins/{uid}` — administrator
  - `operators/{uid}` — approved tour operator
  - `users/{uid}` — traveler
- The first admin is created manually in Firebase Console.
- Current operator: `operator@gmail.com` (UID `0whDtGFwIYYgWw6ccyCdVZl0sbq2`).
- Current admin: `admin@gmail.com` (UID `RC4w2G2zOodp3m2xntJDnANRIio2`).

## Ownership rules

- Admin owns the destination catalog.
- Operator owns tour content.
- Admin only moderates tours (approve, reject, hide); admins do not edit tour content.
- Operators can only use active destinations created by an admin.
- No destination requests in the current scope.
- If no active destination exists, Add Tour is blocked.

## Collections

### `users/{uid}`
Traveler profile.
- `email`, `firstName`, `lastName`, `phone`, `photoURL`
- `address { street, city, province, postalCode }`
- `emergencyContact { name, relationship, phone }`
- `preferences { language, currency }`
- `status: active | disabled`
- `createdAt`, `updatedAt`

Optional:
- `users/{uid}/wishlist/{tourId}` → `{ addedAt }`

### `admins/{uid}`
- `email`, `displayName`, `permissions[]`, `active`, timestamps

### `operators/{uid}`
- `businessName`, `contactName`, `email`, `phone`, `logoURL`, `description`
- `status: active | suspended`
- `ratingAvg`, `reviewCount`, `joinedAt`, `approvedBy`

### `operatorApplications/{uid}`
- business/contact fields, documents
- `status: pending | approved | rejected`
- `submittedAt`, `reviewedBy`, `reviewedAt`, `rejectionReason`

### `destinations/{destinationId}`
Admin-owned master data.
- `name`, `slug`, `region`, `province`, `description`
- `image` (Cloudinary secure URL or external URL), `imagePublicId`, `imageProvider: cloudinary | url | seed`
- `status: active | inactive`
- `featured`, `sortOrder`
- `createdBy`, `createdAt`, `updatedAt`

Deactivation hides the destination and its tours publicly but retains bookings/history. No hard delete for destinations with tours. Region/province come from the static PSGC mapping; destination coordinates are intentionally omitted (precise coordinates belong to tour meeting points/departures later). Destination images upload through Cloudinary (unsigned preset) and only the secure URL/public ID are stored.

### `categories/{categoryId}`
Admin-owned tour categories used by the operator dropdown.
- `name`, `slug`
- `status: active | inactive`
- `sortOrder`, `createdAt`, `updatedAt`

Operators can only select active categories. Deactivation keeps existing tour category names but removes the category from new selections. No hard delete.

### `tours/{tourId}`
Unified catalog used by public, operator and admin.
- `operatorId`, `destinationId`, `destinationName`
- `categoryId`, `category`
- `title`, `slug`, `description`
- `durationLabel`, `durationDays`, `durationNights`
- `meetingPoint { name, address, lat, lng, source }`
- `images[]`, `inclusions[]`, `exclusions[]`, `rules[]`
- `itinerary[]` → `{ day, title, description, location { name, address, lat, lng, source } }`
  - `title` is required before submission; `description` is optional.
  - `location` is optional in drafts but required for every itinerary day before submission.
  - `source` is `geocoded` or `manual`.
  - Public itinerary days with a location show a Leaflet/MapTiler map modal.
- `pricing { adult, child, infant, minGroupSize, groupDiscountPercent, taxesFeesMode }`
- `discounts { earlyBird, group, student, seniorPwd }`
- `status: draft | pending_review | published | rejected | hidden | archived`
- `submittedAt`, `reviewedBy`, `reviewedAt`, `rejectionReason`, `publishedAt`
- `ratingAvg`, `reviewCount`
- `createdAt`, `updatedAt`

Trip duration uses linked whole-number inputs: `durationNights = durationDays - 1`, with a minimum of one day and zero nights. `durationLabel` is generated from the pair (for example, `3 days / 2 nights`) and is not free text.

Published tour content changes require admin re-approval (`status → pending_review`); the tour is hidden from the public catalog while it is under review. Rejected tours remain hidden until the operator updates and resubmits them. Only `draft` tours can be deleted. These rules are enforced in `src/lib/tours.js` and `firestore.rules`. Admin moderation is implemented at `/admin/tours` and updates only status/review fields.

Published tours require `destination.status === active` to be publicly visible/bookable.

### `departures/{departureId}`
Top-level scheduled run of a tour.
- `tourId`, `operatorId`, `destinationId`
- `startAt`, `endAt`, `meetingTime`, `meetingPoint`, `cutoffAt`, `timezone`
- `capacity`, `bookedTravelers`
- `lastBookingId` — used to correlate counter updates with a booking
- `status: scheduled | full | completed | cancelled`
- `cancellationReason`, `createdAt`, `updatedAt`

### `bookings/{bookingId}`
- `reference` — unique human-readable booking code
- `travelerId`, `operatorId`, `tourId`, `departureId`
- `tourSnapshot { title, image, durationLabel, destinationName }`
- `travelerSnapshot` — lead traveler/contact/emergency contact
- `travelers { adults, children, infants, total }`
- `pricingSnapshot` + `amounts { subtotal, discount, taxes, fees, total, depositPaid, balanceDue, currency }`
- `status: pending | confirmed | completed | cancelled`
- `paymentStatus: unpaid | deposit_paid | paid | refund_pending | refunded`
- `holdExpiresAt`, `specialRequests`
- `cancellation { requestedAt, reason, refundAmount, processedAt }`
- `createdAt`, `updatedAt`, `confirmedAt`, `completedAt`, `cancelledAt`

### `payments/{paymentId}`
- `bookingId`, `travelerId`, provider, provider reference, amount, currency, status, receipt URL, timestamps
- Payment remains simulated until an external backend is available.

### `cancellationRequests/{requestId}`
- `bookingId`, traveler/operator IDs, reason, `requestedAt`
- `status: requested | approved | rejected | processed`
- `refundAmount`, `resolvedBy`, `resolvedAt`

### `reviews/{bookingId}`
Document ID equals booking ID to enforce one review per booking.
- `bookingId`, `tourId`, `operatorId`, `travelerId`
- `rating` 1–5, `title`, `comment`, `photos[]`
- `moderationStatus: pending | published | hidden`
- `createdAt`, `moderatedBy`, `moderatedAt`

### `notifications/{notificationId}`
- `userId`, `role`, `type`, `title`, `message`
- optional `bookingId`, `tourId`, `departureId`
- `readAt`, `createdAt`

### `auditLogs/{logId}`
Admin actions: actor, action, target, summary, timestamp.

### `settings/platform`
- `currency`, `timezone`, `serviceFee`, `taxesFeesMode`, `bookingHoldMinutes`, `updatedAt`

## Booking transaction

No Cloud Functions means booking creation must be a Firestore transaction:

1. Read `departures/{departureId}`.
2. Reject if cancelled/completed, past `cutoffAt`, or
   `bookedTravelers + partySize > capacity`.
3. Create a `bookings` document with `status: pending` and the generated booking ID.
4. Update the departure:
   - `bookedTravelers += partySize`
   - `lastBookingId = bookingId`
   - `status = full` if capacity is reached.
5. Rules correlate the updates:
   - Booking create requires `travelerId == auth.uid`, scheduled departure, before cutoff.
   - Departure update only changes counter/status fields.
   - Counter delta must equal the referenced booking’s traveler total.
   - Counter cannot exceed capacity.
   - Referenced booking must belong to the same departure/traveler.
6. Conflicting transactions retry against the updated counter, preventing overbooking.

Cancellation/refund releases capacity through operator/admin actions. Automatic hold expiry is unavailable on Spark; expired pending bookings require a manual cleanup action.

## State machines

- **Operator application:** `pending → approved | rejected`
- **Tour:** `draft → pending_review → published | rejected`; public tours can become `hidden/archived`
- **Departure:** `scheduled → full → completed | cancelled`
- **Booking:** `pending → confirmed → completed | cancelled`
- **Payment:** `unpaid → deposit_paid → paid | refund_pending → refunded`
- **Review:** `pending → published | hidden`

## Permissions

- Public: active destinations, published tours, published reviews.
- Traveler: own profile, bookings, notifications, wishlist; create/cancel own pending booking actions.
- Operator: own operator profile, own tours, own departures and bookings; cannot edit another operator’s data.
- Admin: destinations, moderation statuses, operator approval, refunds, reviews, audit logs.
- Direct client writes to bookings/capacity/approvals are guarded by rules; no sensitive writes are trusted.

## Spark limitations

- No custom claims; role documents and rules are authoritative.
- No scheduled functions for hold expiry, tour completion, emails or payment webhooks.
- No secure payment integration; keep payment UI simulated.
- In-app notifications only; no email/push automation.
- Student/senior discounts require manual verification.
- Client-side maps/weather calls use domain-restricted public keys. MapTiler geocoding and tiles are configured through `VITE_MAPTILER_KEY`; OSM tiles are the no-key fallback. Public itinerary maps use stored coordinates and do not call geocoding.
- Public text search uses client filtering or an external service.

## Seed data

`scripts/seedFirestore.mjs` seeds:

- 8 categories: Beaches & Islands, Mountains & Hiking, Culture & Heritage, Nature & Adventure, Theme Parks, Island Exploration, Mountain Getaway, Beach & Water.
- 11 destinations: Boracay, Palawan, Siargao, Bohol, Cebu, Banaue, Baguio, Laguna, Albay, Batanes, Vigan.
- 14 unified tours, all owned by `operator@gmail.com`:
  - 9 existing public packages
  - 5 existing operator tours
- `settings/platform` defaults.

Run while the deployed rules allow writes:

```bash
node scripts/seedFirestore.mjs
```

Current seed state:
- Categories, destinations and tours are in Firestore.
- Batanes is seeded as `draft`; the rest are `published`.
- Operator My Tours and the tour editor now read and write Firestore, including Add Tour and submit-for-review.
- All 14 seeded tours have one curated itinerary pin per day; operators can refine them through MapTiler search or manual pinning.
- 26 future departures are seeded across the 13 published tours.
- No bookings, users, reviews or notifications have been seeded yet.
- Public package listing and package detail now read published Firestore tours and departures. Destination cards and homepage featured content still use static data until the next slice.
