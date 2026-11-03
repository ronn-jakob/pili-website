import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  BOOKING_STATUS,
  COLLECTIONS,
  DEPARTURE_STATUS,
  DESTINATION_STATUS,
  PAYMENT_STATUS,
  TOUR_STATUS,
} from './firestoreSchema';
import { calculateBookingAmounts } from '../utils/pricing';

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function toMillis(value) {
  const date = toDate(value);
  return date ? date.getTime() : 0;
}

function bookingError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeTravelers(travelers = {}) {
  let adults = Math.max(0, Math.floor(toNumber(travelers.adults)));
  let children = Math.max(0, Math.floor(toNumber(travelers.children)));
  let infants = Math.max(0, Math.floor(toNumber(travelers.infants)));
  const requestedTotal = Math.max(
    0,
    Math.floor(toNumber(travelers.total)),
  );

  if (adults + children + infants === 0 && requestedTotal > 0) {
    adults = requestedTotal;
  }

  return {
    adults,
    children,
    infants,
    total: adults + children + infants,
  };
}

function bookingReference(bookingId) {
  const year = new Date().getFullYear();
  const suffix = bookingId.slice(-5).toUpperCase();
  return `PILI-${year}-${suffix}`;
}

function calculatePricing(
  tour,
  settings,
  travelers,
  departureStartAt = null,
  bookedAt = new Date(),
) {
  const pricing = tour.pricing ?? {};
  const discounts = tour.discounts ?? {};
  const adultPrice = toNumber(pricing.adult);
  const childPrice = toNumber(pricing.child);
  const infantPrice = toNumber(pricing.infant);

  if (adultPrice <= 0) {
    throw bookingError(
      'booking/pricing-unavailable',
      'This tour does not have a bookable price yet.',
    );
  }

  const amounts = calculateBookingAmounts({
    adultPrice,
    childPrice,
    infantPrice,
    travelers,
    serviceFee: settings.serviceFee,
    minGroupSize: pricing.minGroupSize,
    groupDiscountPercent: pricing.groupDiscountPercent,
    earlyBirdPercent: pricing.earlyBirdPercent,
    earlyBirdDays: pricing.earlyBirdDays,
    discounts,
    departureStartAt,
    bookedAt,
  });
  const minGroupSize = Math.max(
    1,
    toNumber(pricing.minGroupSize, 1),
  );
  const groupDiscountPercent = Math.min(
    100,
    Math.max(0, toNumber(pricing.groupDiscountPercent)),
  );
  const earlyBirdPercent = Math.min(
    100,
    Math.max(0, toNumber(pricing.earlyBirdPercent)),
  );
  const earlyBirdDays = Math.max(0, toNumber(pricing.earlyBirdDays));
  const currency = settings.currency || 'PHP';

  return {
    pricingSnapshot: {
      adultPrice,
      childPrice,
      infantPrice,
      minGroupSize,
      groupDiscountPercent,
      earlyBirdPercent,
      earlyBirdDays,
      taxesFeesMode: pricing.taxesFeesMode ?? 'included',
      groupDiscount: amounts.groupDiscount,
      earlyBirdDiscount: amounts.earlyBirdDiscount,
      daysUntilDeparture: amounts.daysUntilDeparture,
    },
    amounts: {
      subtotal: amounts.subtotal,
      discount: amounts.discount,
      taxes: amounts.taxes,
      fees: amounts.fees,
      total: amounts.total,
      depositPaid: 0,
      balanceDue: amounts.total,
      currency,
    },
  };
}

function mapBooking(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    departureStartAt: toDate(data.departureSnapshot?.startAt),
    departureEndAt: toDate(data.departureSnapshot?.endAt),
    departureCutoffAt: toDate(data.departureSnapshot?.cutoffAt),
    createdAtDate: toDate(data.createdAt),
    updatedAtDate: toDate(data.updatedAt),
    holdExpiresAtDate: toDate(data.holdExpiresAt),
    confirmedAtDate: toDate(data.confirmedAt),
    cancelledAtDate: toDate(data.cancelledAt),
    refundedAtDate: toDate(data.refundedAt),
  };
}

export async function createBooking({
  departureId,
  traveler,
  details = {},
  travelers: travelerCounts,
}) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw bookingError(
      'booking/not-signed-in',
      'Sign in as a traveler before booking.',
    );
  }

  if (!departureId) {
    throw bookingError(
      'booking/departure-missing',
      'Choose a departure before booking.',
    );
  }

  const travelers = normalizeTravelers(travelerCounts);

  if (travelers.total <= 0) {
    throw bookingError(
      'booking/travelers-invalid',
      'Choose at least one traveler.',
    );
  }

  const bookingRef = doc(collection(db, COLLECTIONS.bookings));

  const result = await runTransaction(db, async (transaction) => {
    const departureRef = doc(
      db,
      COLLECTIONS.departures,
      departureId,
    );
    const departureSnapshot = await transaction.get(departureRef);

    if (!departureSnapshot.exists()) {
      throw bookingError(
        'booking/departure-missing',
        'That departure is no longer available.',
      );
    }

    const departure = departureSnapshot.data();
    const now = Date.now();
    const startAtMs = toMillis(departure.startAt);
    const cutoffAtMs =
      toMillis(departure.cutoffAt) || startAtMs;

    if (
      departure.status !== DEPARTURE_STATUS.scheduled ||
      !startAtMs ||
      startAtMs <= now ||
      (cutoffAtMs && cutoffAtMs <= now)
    ) {
      throw bookingError(
        'booking/departure-unavailable',
        'That departure is no longer accepting bookings.',
      );
    }

    const capacity = toNumber(departure.capacity);
    const bookedTravelers = toNumber(departure.bookedTravelers);

    if (
      capacity <= 0 ||
      bookedTravelers + travelers.total > capacity
    ) {
      throw bookingError(
        'booking/capacity',
        'There are not enough slots left on this departure.',
      );
    }

    const tourRef = doc(
      db,
      COLLECTIONS.tours,
      departure.tourId,
    );
    const tourSnapshot = await transaction.get(tourRef);

    if (
      !tourSnapshot.exists() ||
      tourSnapshot.data().status !== TOUR_STATUS.published
    ) {
      throw bookingError(
        'booking/tour-unavailable',
        'This tour is not available for booking.',
      );
    }

    const tour = tourSnapshot.data();

    if (tour.destinationId) {
      const destinationSnapshot = await transaction.get(
        doc(
          db,
          COLLECTIONS.destinations,
          tour.destinationId,
        ),
      );

      if (
        !destinationSnapshot.exists() ||
        destinationSnapshot.data().status !==
          DESTINATION_STATUS.active
      ) {
        throw bookingError(
          'booking/destination-inactive',
          'This destination is not currently available.',
        );
      }
    }

    const settingsSnapshot = await transaction.get(
      doc(db, COLLECTIONS.settings, 'platform'),
    );
    const settings = settingsSnapshot.exists()
      ? settingsSnapshot.data()
      : {};
    const { pricingSnapshot, amounts } = calculatePricing(
      tour,
      settings,
      travelers,
      toDate(departure.startAt),
      new Date(now),
    );
    const holdMinutes = Math.max(
      5,
      toNumber(settings.bookingHoldMinutes, 30),
    );
    const nextBookedTravelers =
      bookedTravelers + travelers.total;
    const nextDepartureStatus =
      nextBookedTravelers >= capacity
        ? DEPARTURE_STATUS.full
        : DEPARTURE_STATUS.scheduled;
    const booking = {
      reference: bookingReference(bookingRef.id),
      travelerId: currentUser.uid,
      operatorId: departure.operatorId ?? tour.operatorId ?? '',
      tourId: departure.tourId,
      departureId,
      destinationId:
        tour.destinationId ?? departure.destinationId ?? '',
      tourSnapshot: {
        title: tour.title ?? '',
        image: Array.isArray(tour.images) ? tour.images[0] ?? '' : '',
        durationLabel: tour.durationLabel ?? '',
        destinationName: tour.destinationName ?? '',
        category: tour.category ?? '',
        meetingPoint: tour.meetingPoint?.name ?? '',
        inclusions: Array.isArray(tour.inclusions)
          ? tour.inclusions
          : [],
      },
      departureSnapshot: {
        startAt: departure.startAt ?? null,
        endAt: departure.endAt ?? null,
        meetingTime: departure.meetingTime ?? '',
        meetingPoint: departure.meetingPoint ?? null,
        cutoffAt: departure.cutoffAt ?? null,
        timezone: departure.timezone ?? 'Asia/Manila',
      },
      travelerSnapshot: {
        firstName:
          details.firstName?.trim() ||
          traveler?.firstName ||
          '',
        lastName:
          details.lastName?.trim() ||
          traveler?.lastName ||
          '',
        email: details.email?.trim() || traveler?.email || '',
        mobile:
          details.mobile?.trim() || traveler?.phone || '',
        pickup: details.pickup?.trim() ?? '',
        hotel: details.hotel?.trim() ?? '',
        emergencyContact: traveler?.emergencyContact ?? null,
      },
      travelers,
      pricingSnapshot,
      amounts,
      promoCode: details.promo?.trim() ?? '',
      specialRequests: details.requests?.trim() ?? '',
      status: BOOKING_STATUS.pending,
      paymentStatus: PAYMENT_STATUS.unpaid,
      paymentMethod: '',
      holdExpiresAt: Timestamp.fromMillis(
        now + holdMinutes * 60 * 1000,
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(bookingRef, booking);
    transaction.update(departureRef, {
      bookedTravelers: nextBookedTravelers,
      lastBookingId: bookingRef.id,
      status: nextDepartureStatus,
      updatedAt: serverTimestamp(),
    });

    return {
      ...booking,
      id: bookingRef.id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  });

  return result;
}

export async function getTravelerBookings(travelerId) {
  if (!travelerId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookings),
      where('travelerId', '==', travelerId),
    ),
  );

  return snapshot.docs
    .map(mapBooking)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function getBookingById(bookingId) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.bookings, bookingId),
  );

  return snapshot.exists() ? mapBooking(snapshot) : null;
}

export async function markBookingPaid(
  bookingId,
  paymentMethod = 'Simulated card',
) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw bookingError(
      'booking/not-signed-in',
      'Sign in as a traveler before paying.',
    );
  }

  const bookingRef = doc(
    db,
    COLLECTIONS.bookings,
    bookingId,
  );
  const snapshot = await getDoc(bookingRef);

  if (!snapshot.exists()) {
    throw bookingError(
      'booking/not-found',
      'That booking could not be found.',
    );
  }

  const booking = snapshot.data();

  if (booking.travelerId !== currentUser.uid) {
    throw bookingError(
      'booking/not-owner',
      'You do not have permission to pay for this booking.',
    );
  }

  if (booking.paymentStatus === PAYMENT_STATUS.paid) {
    return mapBooking(snapshot);
  }

  await updateDoc(bookingRef, {
    status: BOOKING_STATUS.confirmed,
    paymentStatus: PAYMENT_STATUS.paid,
    paymentMethod,
    confirmedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return mapBooking(await getDoc(bookingRef));
}

export function bookingErrorMessage(error) {
  switch (error?.code) {
    case 'booking/not-signed-in':
      return 'Sign in as a traveler before booking.';
    case 'booking/departure-missing':
      return 'That departure is no longer available.';
    case 'booking/departure-unavailable':
      return 'That departure is no longer accepting bookings.';
    case 'booking/capacity':
      return 'There are not enough slots left on this departure.';
    case 'booking/tour-unavailable':
      return 'This tour is not available for booking.';
    case 'booking/destination-inactive':
      return 'This destination is not currently available.';
    case 'booking/pricing-unavailable':
      return 'This tour does not have a bookable price yet.';
    case 'booking/travelers-invalid':
      return 'Choose at least one traveler.';
    case 'booking/not-found':
      return 'That booking could not be found.';
    case 'booking/not-owner':
      return 'You do not have permission to update this booking.';
    case 'permission-denied':
      return 'You do not have permission to complete this booking.';
    case 'unavailable':
      return 'Firestore is unavailable. Check your connection and try again.';
    default:
      return (
        error?.message ||
        'Could not complete this booking. Please try again.'
      );
  }
}
