import path from 'node:path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { getFirebaseServices } from '../server/firebaseAdmin.js';

dotenv.config({
  path: path.resolve(process.cwd(), 'server/.env'),
});

const dryRun = process.argv.includes('--dry-run');
const { db, FieldValue } = getFirebaseServices();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

async function cancelPaymentIntent(paymentIntentId) {
  if (!stripe || !paymentIntentId) {
    return 'skipped';
  }

  try {
    const paymentIntent =
      await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return 'paid';
    }

    if (
      paymentIntent.status === 'canceled' ||
      paymentIntent.status === 'processing'
    ) {
      return paymentIntent.status;
    }

    await stripe.paymentIntents.cancel(paymentIntentId);
    return 'cancelled';
  } catch {
    return 'error';
  }
}

async function releaseExpiredBooking(bookingRef) {
  return db.runTransaction(async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists) {
      return 'missing';
    }

    const booking = bookingSnapshot.data();

    if (
      booking.status !== 'pending' ||
      booking.paymentStatus !== 'unpaid'
    ) {
      return 'not-pending';
    }

    transaction.update(bookingRef, {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return 'cancelled';
  });
}

async function recalculateDeparture(departureId) {
  const departureRef = db
    .collection('departures')
    .doc(departureId);
  const departureSnapshot = await departureRef.get();

  if (!departureSnapshot.exists) {
    return null;
  }

  const departure = departureSnapshot.data();
  const bookingsSnapshot = await db
    .collection('bookings')
    .where('departureId', '==', departureId)
    .get();
  const activeBookings = bookingsSnapshot.docs.filter((document) =>
    ['pending', 'confirmed'].includes(document.data().status),
  );
  const bookedTravelers = activeBookings.reduce(
    (total, document) =>
      total +
      (Number(document.data().travelers?.total) || 0),
    0,
  );
  const capacity = Number(departure.capacity) || 0;
  const activeIds = new Set(
    activeBookings.map((document) => document.id),
  );
  const lastBookingId = activeIds.has(departure.lastBookingId)
    ? departure.lastBookingId
    : null;

  await departureRef.update({
    bookedTravelers,
    status:
      bookedTravelers >= capacity ? 'full' : 'scheduled',
    lastBookingId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    departureId,
    bookedTravelers,
    capacity,
    status:
      bookedTravelers >= capacity ? 'full' : 'scheduled',
  };
}

async function main() {
  const now = Date.now();
  const snapshot = await db
    .collection('bookings')
    .where('status', '==', 'pending')
    .get();
  const expired = snapshot.docs.filter((document) => {
    const data = document.data();
    const holdExpiresAt = toDate(data.holdExpiresAt);

    return (
      data.paymentStatus === 'unpaid' &&
      holdExpiresAt &&
      holdExpiresAt.getTime() <= now
    );
  });

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Found ${expired.length} expired pending booking(s).`,
  );

  let released = 0;
  let skipped = 0;
  const affectedDepartures = new Set();

  for (const document of expired) {
    const data = document.data();
    const intentStatus = await cancelPaymentIntent(
      data.stripePaymentIntentId,
    );

    if (dryRun) {
      console.log(
        `- ${data.reference || document.id}: intent=${intentStatus}`,
      );
      continue;
    }

    if (intentStatus === 'paid') {
      console.warn(
        `Skipped ${data.reference || document.id}: PaymentIntent already paid.`,
      );
      skipped += 1;
      continue;
    }

    const result = await releaseExpiredBooking(document.ref);

    if (result === 'cancelled') {
      released += 1;
      affectedDepartures.add(data.departureId);
      console.log(
        `Released ${data.reference || document.id} (intent=${intentStatus}).`,
      );
    } else {
      skipped += 1;
      console.log(
        `Skipped ${data.reference || document.id}: ${result}.`,
      );
    }
  }

  if (!dryRun && affectedDepartures.size > 0) {
    for (const departureId of affectedDepartures) {
      const updated = await recalculateDeparture(departureId);

      if (updated) {
        console.log(
          `Recalculated ${updated.departureId}: ${updated.bookedTravelers}/${updated.capacity} booked (${updated.status}).`,
        );
      }
    }
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Released ${released}, skipped ${skipped}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
