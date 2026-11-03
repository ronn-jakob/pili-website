import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  BOOKING_STATUS,
  COLLECTIONS,
  DEPARTURE_STATUS,
} from './firestoreSchema';
import { createNotification } from './notifications';
import { normalizeLocation } from './maps';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapDeparture(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    tourId: data.tourId ?? '',
    operatorId: data.operatorId ?? '',
    destinationId: data.destinationId ?? '',
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    meetingTime: data.meetingTime ?? '',
    meetingPoint: normalizeLocation(data.meetingPoint),
    meetingPointName: data.meetingPoint?.name ?? '',
    meetingPointAddress: data.meetingPoint?.address ?? '',
    cutoffAt: toDate(data.cutoffAt),
    timezone: data.timezone ?? 'Asia/Manila',
    capacity: Number(data.capacity) || 0,
    bookedTravelers: Number(data.bookedTravelers) || 0,
    lastBookingId: data.lastBookingId ?? null,
    status: data.status ?? DEPARTURE_STATUS.scheduled,
    cancellationReason: data.cancellationReason ?? '',
    createdAtMs: data.createdAt?.toMillis?.() ?? 0,
    updatedAtMs: data.updatedAt?.toMillis?.() ?? 0,
  };
}

export async function getDeparturesForTour(tourId) {
  const operatorId = auth.currentUser?.uid;

  if (!operatorId) {
    throw new Error('Your operator session has expired. Sign in again.');
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.departures),
      where('operatorId', '==', operatorId),
    ),
  );

  return snapshot.docs
    .map(mapDeparture)
    .filter((departure) => departure.tourId === tourId)
    .sort(
      (first, second) =>
        (first.startAt?.getTime() ?? 0) - (second.startAt?.getTime() ?? 0),
    );
}

export async function getDepartureById(departureId) {
  if (!departureId) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.departures, departureId),
  );

  return snapshot.exists() ? mapDeparture(snapshot) : null;
}

export async function getPublicDeparturesForTour(tourId) {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.departures),
      where('tourId', '==', tourId),
    ),
  );

  return snapshot.docs
    .map(mapDeparture)
    .filter(
      (departure) =>
        (departure.status === DEPARTURE_STATUS.scheduled ||
          departure.status === DEPARTURE_STATUS.full) &&
        departure.startAt,
    )
    .sort(
      (first, second) =>
        first.startAt.getTime() - second.startAt.getTime(),
    );
}

export async function getPublicDepartureDatesByTour(tourIds = []) {
  const uniqueTourIds = [...new Set(tourIds.filter(Boolean))];

  if (uniqueTourIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueTourIds.map(async (tourId) => {
      const departures = await getPublicDeparturesForTour(tourId);
      return [tourId, departures.map((departure) => departure.startAt)];
    }),
  );

  return Object.fromEntries(entries);
}

function departurePayload(values, status) {
  return {
    startAt: Timestamp.fromDate(new Date(values.startAt)),
    endAt: Timestamp.fromDate(new Date(values.endAt)),
    meetingTime: values.meetingTime,
    meetingPoint: normalizeLocation(values.meetingPoint),
    cutoffAt: Timestamp.fromDate(new Date(values.cutoffAt)),
    timezone: values.timezone || 'Asia/Manila',
    capacity: Math.max(1, Number(values.capacity) || 1),
    status,
    updatedAt: serverTimestamp(),
  };
}

export async function createDeparture(tour, values) {
  const operatorId = auth.currentUser?.uid;

  if (!operatorId) {
    throw new Error('Your operator session has expired. Sign in again.');
  }

  const reference = await addDoc(collection(db, COLLECTIONS.departures), {
    ...departurePayload(values, DEPARTURE_STATUS.scheduled),
    tourId: tour.id,
    operatorId,
    destinationId: tour.destinationId,
    bookedTravelers: 0,
    lastBookingId: null,
    cancellationReason: '',
    createdAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateDeparture(departureId, values, bookedTravelers) {
  const capacity = Math.max(1, Number(values.capacity) || 1);
  const status =
    bookedTravelers >= capacity
      ? DEPARTURE_STATUS.full
      : DEPARTURE_STATUS.scheduled;

  await updateDoc(doc(db, COLLECTIONS.departures, departureId), {
    ...departurePayload(values, status),
    bookedTravelers,
  });
}

export async function cancelDeparture(departureId, reason) {
  await updateDoc(doc(db, COLLECTIONS.departures, departureId), {
    status: DEPARTURE_STATUS.cancelled,
    cancellationReason: reason.trim(),
    updatedAt: serverTimestamp(),
  });

  try {
    const bookingsSnapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.bookings),
        where('departureId', '==', departureId),
      ),
    );

    await Promise.all(
      bookingsSnapshot.docs
        .filter((item) => item.data().status !== 'cancelled')
        .map(async (item) => {
          const booking = item.data();

          try {
            await createNotification({
              id: `departure-cancelled-${departureId}-${item.id}`,
              userId: booking.travelerId,
              role: 'traveler',
              type: 'departure_cancelled',
              title: 'Departure cancelled',
              message: `The departure for ${
                booking.tourSnapshot?.title || 'your tour'
              } was cancelled. Reason: ${reason.trim()}`,
              link: `/bookings/${item.id}`,
              bookingId: item.id,
              tourId: booking.tourId ?? '',
              departureId,
            });
          } catch {
            // The cancellation succeeds even if a notification fails.
          }
        }),
    );
  } catch {
    // The cancellation succeeds even if notifications cannot be loaded.
  }
}

export async function completeDeparture(departureId) {
  const bookingsSnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookings),
      where('departureId', '==', departureId),
    ),
  );
  const batch = writeBatch(db);
  const completedAt = serverTimestamp();

  bookingsSnapshot.docs
    .filter(
      (item) =>
        item.data().status === BOOKING_STATUS.confirmed &&
        item.data().paymentStatus === 'paid',
    )
    .forEach((item) => {
      batch.update(item.ref, {
        status: BOOKING_STATUS.completed,
        completedAt,
        updatedAt: serverTimestamp(),
      });
    });

  batch.update(doc(db, COLLECTIONS.departures, departureId), {
    status: DEPARTURE_STATUS.completed,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export function departureErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to manage this departure.';
    case 'unavailable':
      return 'Firestore is unavailable. Check your connection and try again.';
    default:
      return error?.message || 'Could not save this departure. Please try again.';
  }
}
