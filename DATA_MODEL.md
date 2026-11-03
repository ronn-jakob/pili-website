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
Traveler profile, created by the traveler sign-up flow. The document ID is the Firebase Auth UID.
- `email`, `firstName`, `lastName`, `phone`, `alternatePhone`, `photoURL`
- `dateOfBirth`, `nationality`, `gender`
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
- `role: operator`
- `status: active | suspended`
- `ratingAvg`, `reviewCount`, `joinedAt`, `approvedBy`, `approvedAt`
- Approval from `operatorApplications/{uid}` creates this marker; the same Firebase Auth account keeps its `users/{uid}` traveler profile.

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
- `coverImage` — optional website card/hero image
- `images[]`, `inclusions[]`, `exclusions[]`, `rules[]`
- `itinerary[]` → `{ day, title, description, location { name, address, lat, lng, source } }`
  - `title` is required before submission; `description` is optional.
  - `location` is optional in drafts but required for every itinerary day before submission.
  - `source` is `geocoded` or `manual`.
  - Public itinerary days with a location show a Leaflet/MapTiler map modal.
- `pricing { adult, child, infant, minGroupSize, groupDiscountPercent, earlyBirdPercent, earlyBirdDays, taxesFeesMode }`
- `discounts { earlyBird, group, student, seniorPwd }`
- Checkout applies group and early-bird discounts when enabled and eligible. Taxes are included; student/senior controls are not exposed in the current UI.
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
- `paymentMethod`, `stripePaymentIntentId`
- `holdExpiresAt`, `specialRequests`
- `cancellation { requestedAt, reason, refundAmount, processedAt }`
- `refundAmount`, `refundedAt`
- `createdAt`, `updatedAt`, `confirmedAt`, `completedAt`, `cancelledAt`

### `bookingChanges/{requestId}`
- `bookingId`, `bookingReference`, `travelerId`, `operatorId`, `tourId`
- `fromDepartureId`, `toDepartureId`
- `fromDepartureSnapshot`, `toDepartureSnapshot`
- `reason`, `status: requested | approved | rejected`
- `resolvedBy`, `resolvedAt`, `rejectionReason`, `createdAt`, `updatedAt`
- Created by the traveler for a same-tour departure change. Approval is a transaction that releases the old departure capacity, reserves the new departure, and updates the booking departure snapshot.

### `payments/{paymentId}`
- Document ID is the Stripe Checkout Session ID.
- `bookingId`, `travelerId`, `provider: 'stripe'`, `providerReference`, `amount`, `currency`, `status`, `receiptUrl`, `refundId`, `createdAt`, `refundedAt`
- Stripe test-mode PaymentIntents are created and verified by the local `server/` Express API. There is no payment webhook; confirmation happens when the Payment Element completes and the client confirms the `payment_intent`.
- Cancelling a paid booking requires an approved refund request; the server issues a Stripe test refund and changes the payment status to `refunded`. Client writes to `payments` are denied; the server uses Firebase Admin.

### `cancellationRequests/{bookingId}`
Document ID equals booking ID to enforce one refund request per booking.
- `bookingId`, `bookingReference`, `travelerId`, `operatorId`, `tourId`
- `reason`, `refundAmount`
- `status: requested | processed | rejected`
- `adminNote`, `resolvedBy`, `resolvedAt`, `createdAt`, `updatedAt`
- The traveler creates the request; the booking remains confirmed/paid and capacity stays reserved until an admin approves or rejects. Admin approval runs through the privileged server endpoint and issues the Stripe test refund.

### `reviews/{bookingId}`
Document ID equals booking ID to enforce one review per booking.
- `bookingId`, `bookingReference`, `tourId`, `tourTitle`, `operatorId`, `travelerId`, `travelerName`
- `rating` 1–5, `title`, `comment`, `photos[]`
- `moderationStatus: pending | published | hidden`
- `createdAt`, `moderatedBy`, `moderatedAt`
- Public reads require `moderationStatus == 'published'`; travelers can read their own review; admins can read all.
- Eligible reviews require a confirmed/completed, paid booking whose departure has ended or whose departure was manually marked completed by the operator. Admin approval/hiding only.

### `notifications/{notificationId}`
- `userId`, `role`, `type`, `title`, `message`
- optional `link`, `bookingId`, `tourId`, `reviewId`
- `readAt`, `createdAt`
- Travelers read their own notifications and may update only `readAt`; admins create review-moderation notifications. The Stripe server (Admin SDK) creates booking-confirmed, booking-cancelled and refund-processed notifications.
- Additional types used by the app: `booking_created`, `booking_change_requested`, `booking_change_approved`, `booking_change_rejected`, `departure_cancelled`, `operator_approved`, `operator_rejected`, `tour_approved`, `tour_rejected`, `tour_hidden`, `tour_archived`, `review_submitted`, `review_published`, `review_hidden`.

### `auditLogs/{logId}`
- `actorId`, `actorRole`, `action`, `targetType`, `targetId`, `summary`, `createdAt`
- Admin client actions (tour/review moderation, users, operators, departures) and server-side admin booking cancellation write audit entries. Only admins can read/create; entries are immutable.

### `settings/platform`
- `currency`, `timezone`, `serviceFee`, `taxesFeesMode`, `bookingHoldMinutes`, `updatedAt`

## Booking transaction

No Cloud Functions means booking creation must be a Firestore transaction. Implemented in `src/lib/bookings.js` (`createBooking`), with `markBookingPaid` handling the simulated payment transition.

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

Cancellation/refund releases capacity through the traveler cancellation endpoint. Automatic hold expiry is unavailable on Spark; run `npm run cleanup:bookings` (or `--dry-run` first) to release expired pending bookings.

## State machines

- **Operator application:** `pending → approved | rejected`
- **Tour:** `draft → pending_review → published | rejected`; public tours can become `hidden/archived`
- **Departure:** `scheduled → full → completed | cancelled`
- **Booking:** `pending → confirmed → completed | cancelled`
- **Payment:** `unpaid → deposit_paid → paid | refund_pending → refunded`
- **Review:** `pending → published | hidden`
- **Booking change:** `requested → approved | rejected`

## Permissions

- Public: active destinations, published tours, published reviews.
- Traveler: own profile, bookings, booking changes, notifications, wishlist; create/cancel own pending booking actions.
- Operator: own operator profile, own tours, own departures, own bookings and change requests; cannot edit another operator’s data.
- Admin: destinations, categories, users (status), operator applications/operators, moderation statuses, bookings, refunds, reviews, reports, audit logs.
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
