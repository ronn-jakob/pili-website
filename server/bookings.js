import { getFirebaseServices } from './firebaseAdmin.js';
import { createNotification } from './notifications.js';
import { writeAuditLog } from './auditLogs.js';
import { calculateBookingAmounts } from '../src/utils/pricing.js';

function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function toISOString(value) {
  return value?.toDate ? value.toDate().toISOString() : null;
}

function serializeBooking(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    departureSnapshot: data.departureSnapshot
      ? {
          ...data.departureSnapshot,
          startAt: toISOString(data.departureSnapshot.startAt),
          endAt: toISOString(data.departureSnapshot.endAt),
          cutoffAt: toISOString(data.departureSnapshot.cutoffAt),
        }
      : null,
    holdExpiresAt: toISOString(data.holdExpiresAt),
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
    confirmedAt: toISOString(data.confirmedAt),
    cancelledAt: toISOString(data.cancelledAt),
  };
}

function getBookingTotal(booking) {
  const total = Number(booking.amounts?.total);

  if (!Number.isFinite(total) || total <= 0) {
    throw httpError(
      400,
      'booking/invalid-total',
      'This booking does not have a payable total.',
    );
  }

  return total;
}

function calculateExpectedAmount(
  tour,
  settings,
  travelers = {},
  departureStartAt = null,
  bookedAt = new Date(),
) {
  const pricing = tour.pricing ?? {};
  const amounts = calculateBookingAmounts({
    adultPrice: pricing.adult,
    childPrice: pricing.child,
    infantPrice: pricing.infant,
    travelers,
    serviceFee: settings.serviceFee,
    minGroupSize: pricing.minGroupSize,
    groupDiscountPercent: pricing.groupDiscountPercent,
    earlyBirdPercent: pricing.earlyBirdPercent,
    earlyBirdDays: pricing.earlyBirdDays,
    discounts: tour.discounts,
    departureStartAt,
    bookedAt,
  });

  return {
    amount: Math.round(amounts.total * 100),
    currency: (settings.currency || 'PHP').toLowerCase(),
  };
}

async function readTravelerBooking(
  bookingId,
  travelerId,
  { allowAny = false } = {},
) {
  const { db } = getFirebaseServices();
  const bookingRef = db.collection('bookings').doc(bookingId);
  const snapshot = await bookingRef.get();

  if (!snapshot.exists) {
    throw httpError(
      404,
      'booking/not-found',
      'That booking could not be found.',
    );
  }

  const booking = snapshot.data();

  if (!allowAny && booking.travelerId !== travelerId) {
    throw httpError(
      403,
      'booking/not-owner',
      'You do not have permission to pay for this booking.',
    );
  }

  return { bookingRef, snapshot, booking };
}

export async function createPaymentIntentForBooking({
  bookingId,
  travelerId,
  stripe,
}) {
  const { bookingRef, booking } = await readTravelerBooking(
    bookingId,
    travelerId,
  );

  if (
    booking.status !== 'pending' ||
    booking.paymentStatus !== 'unpaid'
  ) {
    throw httpError(
      409,
      'booking/not-payable',
      'This booking is no longer awaiting payment.',
    );
  }

  const { db, FieldValue } = getFirebaseServices();
  const tourSnapshot = await db
    .collection('tours')
    .doc(booking.tourId)
    .get();

  if (!tourSnapshot.exists) {
    throw httpError(
      409,
      'booking/tour-unavailable',
      'This tour is no longer available for payment.',
    );
  }

  const tour = tourSnapshot.data();

  if (tour.status !== 'published') {
    throw httpError(
      409,
      'booking/tour-unavailable',
      'This tour is no longer available for payment.',
    );
  }

  const settingsSnapshot = await db
    .collection('settings')
    .doc('platform')
    .get();
  const settings = settingsSnapshot.exists
    ? settingsSnapshot.data()
    : {};
  const expected = calculateExpectedAmount(
    tour,
    settings,
    booking.travelers,
    booking.departureSnapshot?.startAt,
    booking.createdAt?.toDate?.() ?? new Date(),
  );
  const bookingAmount = Math.round(
    getBookingTotal(booking) * 100,
  );
  const bookingCurrency = (
    booking.amounts?.currency || 'PHP'
  ).toLowerCase();

  if (
    bookingAmount !== expected.amount ||
    bookingCurrency !== expected.currency
  ) {
    throw httpError(
      409,
      'booking/amount-mismatch',
      'The booking total does not match the current tour price.',
    );
  }

  const params = {
    amount: expected.amount,
    currency: expected.currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    metadata: {
      bookingId,
      travelerId,
    },
    description:
      booking.tourSnapshot?.title || 'Pili tour booking',
  };

  if (booking.travelerSnapshot?.email) {
    params.receipt_email = booking.travelerSnapshot.email;
  }

  let paymentIntent;

  try {
    paymentIntent = await stripe.paymentIntents.create(params);
  } catch (error) {
    throw httpError(
      502,
      'stripe/payment-intent-failed',
      error?.message ||
        'Stripe could not start the card payment.',
    );
  }

  try {
    await bookingRef.update({
      stripePaymentIntentId: paymentIntent.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    try {
      await stripe.paymentIntents.cancel(paymentIntent.id);
    } catch {
      // Leave the unused PaymentIntent for manual cleanup.
    }

    throw httpError(
      502,
      'booking/payment-intent-save-failed',
      error?.message ||
        'Could not attach the payment to this booking.',
    );
  }

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function confirmPaymentIntent({
  paymentIntentId,
  travelerId,
  stripe,
}) {
  let paymentIntent;

  try {
    paymentIntent =
      await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    throw httpError(
      502,
      'stripe/payment-intent-lookup-failed',
      error?.message ||
        'Stripe could not verify this card payment.',
    );
  }

  if (paymentIntent.status !== 'succeeded') {
    return {
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    };
  }

  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    throw httpError(
      400,
      'stripe/booking-missing',
      'The Stripe payment is not linked to a booking.',
    );
  }

  const { bookingRef, snapshot, booking } =
    await readTravelerBooking(bookingId, travelerId);
  const expectedAmount = Math.round(
    getBookingTotal(booking) * 100,
  );
  const receivedAmount = Number(paymentIntent.amount_received);
  const currency = (
    booking.amounts?.currency || 'PHP'
  ).toUpperCase();

  if (
    receivedAmount < expectedAmount ||
    (paymentIntent.currency || '').toUpperCase() !== currency
  ) {
    throw httpError(
      409,
      'stripe/amount-mismatch',
      'The Stripe payment does not match this booking.',
    );
  }

  if (booking.paymentStatus === 'paid') {
    return {
      status: 'paid',
      paymentIntentId: paymentIntent.id,
      booking: serializeBooking(snapshot),
    };
  }

  const { db, FieldValue } = getFirebaseServices();

  await db.runTransaction(async (transaction) => {
    const freshSnapshot = await transaction.get(bookingRef);

    if (!freshSnapshot.exists) {
      throw httpError(
        404,
        'booking/not-found',
        'That booking could not be found.',
      );
    }

    const freshBooking = freshSnapshot.data();

    if (freshBooking.paymentStatus === 'paid') {
      return;
    }

    const paymentRef = db
      .collection('payments')
      .doc(paymentIntent.id);

    transaction.update(bookingRef, {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Stripe card',
      stripePaymentIntentId: paymentIntent.id,
      confirmedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    transaction.set(
      paymentRef,
      {
        bookingId,
        travelerId,
        provider: 'stripe',
        providerReference: paymentIntent.id,
        amount: receivedAmount / 100,
        currency,
        status: 'paid',
        receiptUrl:
          paymentIntent.latest_charge?.receipt_url ?? '',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  const finalSnapshot = await bookingRef.get();

  await createNotification({
    id: `booking-confirmed-${bookingId}`,
    userId: travelerId,
    role: 'traveler',
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    message: `Your payment for ${
      booking.tourSnapshot?.title || 'your tour'
    } was received.`,
    link: `/bookings/${bookingId}`,
    bookingId,
    tourId: booking.tourId ?? '',
  });

  return {
    status: 'paid',
    paymentIntentId: paymentIntent.id,
    booking: serializeBooking(finalSnapshot),
  };
}

export async function cancelBooking({
  bookingId,
  travelerId,
  stripe,
  allowAny = false,
}) {
  const { bookingRef, booking } = await readTravelerBooking(
    bookingId,
    travelerId,
    { allowAny },
  );

  if (
    booking.status === 'pending' &&
    booking.paymentStatus === 'unpaid'
  ) {
    const result = await releaseBooking({
      bookingId,
      travelerId,
      stripe,
      paymentIntentId: booking.stripePaymentIntentId,
      allowAny,
    });

    if (result.released) {
      await createNotification({
        id: `booking-cancelled-${bookingId}`,
        userId: travelerId,
        role: 'traveler',
        type: 'booking_cancelled',
        title: 'Booking cancelled',
        message: `Your reservation for ${
          booking.tourSnapshot?.title || 'your tour'
        } was cancelled and capacity was released.`,
        link: `/bookings/${bookingId}`,
        bookingId,
        tourId: booking.tourId ?? '',
      });
    }

    return {
      cancelled: result.released,
      refunded: false,
    };
  }

  if (
    booking.status !== 'confirmed' ||
    booking.paymentStatus !== 'paid'
  ) {
    throw httpError(
      409,
      'booking/not-cancellable',
      'This booking cannot be cancelled.',
    );
  }

  let refund = null;

  if (booking.stripePaymentIntentId) {
    try {
      refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
      });
    } catch (error) {
      throw httpError(
        502,
        'stripe/refund-failed',
        error?.message ||
          'Stripe could not refund this payment.',
      );
    }
  }

  const { db, FieldValue } = getFirebaseServices();

  await db.runTransaction(async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists) {
      throw httpError(
        404,
        'booking/not-found',
        'That booking could not be found.',
      );
    }

    const freshBooking = bookingSnapshot.data();

    if (
      freshBooking.status !== 'confirmed' ||
      freshBooking.paymentStatus !== 'paid'
    ) {
      return;
    }

    const departureRef = db
      .collection('departures')
      .doc(freshBooking.departureId);
    const departureSnapshot = await transaction.get(departureRef);

    transaction.update(bookingRef, {
      status: 'cancelled',
      paymentStatus: 'refunded',
      refundAmount:
        Number(freshBooking.amounts?.total) || 0,
      refundedAt: FieldValue.serverTimestamp(),
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (freshBooking.stripePaymentIntentId) {
      transaction.set(
        db
          .collection('payments')
          .doc(freshBooking.stripePaymentIntentId),
        {
          status: 'refunded',
          refundId: refund?.id ?? '',
          refundedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    if (departureSnapshot.exists) {
      const departure = departureSnapshot.data();
      const partySize =
        Number(freshBooking.travelers?.total) || 0;
      const bookedTravelers = Math.max(
        0,
        (Number(departure.bookedTravelers) || 0) - partySize,
      );
      const capacity = Number(departure.capacity) || 0;

      transaction.update(departureRef, {
        bookedTravelers,
        status:
          bookedTravelers >= capacity ? 'full' : 'scheduled',
        lastBookingId:
          departure.lastBookingId === bookingId
            ? null
            : departure.lastBookingId ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });

  await createNotification({
    id: `booking-cancelled-${bookingId}`,
    userId: travelerId,
    role: 'traveler',
    type: 'booking_cancelled',
    title: 'Booking cancelled',
    message: `Your reservation for ${
      booking.tourSnapshot?.title || 'your tour'
    } was cancelled.`,
    link: `/bookings/${bookingId}`,
    bookingId,
    tourId: booking.tourId ?? '',
  });

  await createNotification({
    id: `booking-refunded-${bookingId}`,
    userId: travelerId,
    role: 'traveler',
    type: 'refund_processed',
    title: 'Refund processed',
    message: `Your Stripe test refund for ${
      booking.tourSnapshot?.title || 'your tour'
    } was processed.`,
    link: `/bookings/${bookingId}`,
    bookingId,
    tourId: booking.tourId ?? '',
  });

  return {
    cancelled: true,
    refunded: Boolean(refund),
    refundId: refund?.id ?? '',
  };
}

export async function adminCancelBooking({
  bookingId,
  stripe,
  adminUid,
}) {
  const { booking } = await readTravelerBooking(bookingId, '', {
    allowAny: true,
  });

  if (booking.paymentStatus === 'paid') {
    throw httpError(
      409,
      'booking/refund-request-required',
      'Paid bookings must be cancelled through the refund request queue.',
    );
  }

  const result = await cancelBooking({
    bookingId,
    travelerId: booking.travelerId,
    stripe,
    allowAny: true,
  });

  await writeAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: 'booking.cancel',
    targetType: 'booking',
    targetId: bookingId,
    summary: `Cancelled booking ${
      booking.reference || bookingId
    } (${booking.tourSnapshot?.title || 'tour'}). Refunded: ${
      result.refunded ? 'yes' : 'no'
    }.`,
  });

  return result;
}

export async function adminApproveRefundRequest({
  bookingId,
  stripe,
  adminUid,
}) {
  const { db, FieldValue } = getFirebaseServices();
  const requestRef = db
    .collection('cancellationRequests')
    .doc(bookingId);
  const requestSnapshot = await requestRef.get();

  if (!requestSnapshot.exists) {
    throw httpError(
      404,
      'refund-request/not-found',
      'That refund request could not be found.',
    );
  }

  const request = requestSnapshot.data();

  if (request.status !== 'requested') {
    throw httpError(
      409,
      'refund-request/already-resolved',
      'This refund request has already been resolved.',
    );
  }

  const result = await cancelBooking({
    bookingId,
    travelerId: request.travelerId,
    stripe,
    allowAny: true,
  });

  await requestRef.update({
    status: 'processed',
    resolvedBy: adminUid,
    resolvedAt: FieldValue.serverTimestamp(),
    refundAmount: result.refunded
      ? Number(request.refundAmount) || 0
      : 0,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: 'refund.approve',
    targetType: 'cancellationRequest',
    targetId: bookingId,
    summary: `Approved refund request for booking ${
      request.bookingReference || bookingId
    }.`,
  });

  return result;
}

export async function releaseBooking({
  bookingId,
  travelerId,
  stripe,
  paymentIntentId,
  allowAny = false,
}) {
  const { bookingRef, booking } = await readTravelerBooking(
    bookingId,
    travelerId,
    { allowAny },
  );

  if (
    booking.status !== 'pending' ||
    booking.paymentStatus !== 'unpaid'
  ) {
    return {
      released: false,
      reason: 'not-pending',
    };
  }

  const intentId =
    paymentIntentId || booking.stripePaymentIntentId;

  if (intentId && stripe) {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(intentId);

      if (paymentIntent.status === 'succeeded') {
        throw httpError(
          409,
          'stripe/already-paid',
          'This payment already completed. The booking cannot be released.',
        );
      }

      if (
        paymentIntent.status !== 'canceled' &&
        paymentIntent.status !== 'processing'
      ) {
        await stripe.paymentIntents.cancel(intentId);
      }
    } catch (error) {
      if (error?.code === 'stripe/already-paid') {
        throw error;
      }
    }
  }

  const { db, FieldValue } = getFirebaseServices();

  return db.runTransaction(async (transaction) => {
    const bookingSnapshot = await transaction.get(bookingRef);

    if (!bookingSnapshot.exists) {
      throw httpError(
        404,
        'booking/not-found',
        'That booking could not be found.',
      );
    }

    const freshBooking = bookingSnapshot.data();

    if (
      freshBooking.status !== 'pending' ||
      freshBooking.paymentStatus !== 'unpaid'
    ) {
      return {
        released: false,
        reason: 'not-pending',
      };
    }

    const departureRef = db
      .collection('departures')
      .doc(freshBooking.departureId);
    const departureSnapshot = await transaction.get(departureRef);

    transaction.update(bookingRef, {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (departureSnapshot.exists) {
      const departure = departureSnapshot.data();
      const partySize =
        Number(freshBooking.travelers?.total) || 0;
      const bookedTravelers = Math.max(
        0,
        (Number(departure.bookedTravelers) || 0) - partySize,
      );
      const capacity = Number(departure.capacity) || 0;

      transaction.update(departureRef, {
        bookedTravelers,
        status:
          bookedTravelers >= capacity ? 'full' : 'scheduled',
        lastBookingId:
          departure.lastBookingId === bookingId
            ? null
            : departure.lastBookingId ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      released: true,
    };
  });
}
