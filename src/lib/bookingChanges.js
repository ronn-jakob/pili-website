import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS, DEPARTURE_STATUS } from './firestoreSchema';
import { createNotification } from './notifications';
import { notifyBookingChangeRequested } from './paymentApi';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapChange(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAtDate: toDate(data.createdAt),
    resolvedAtDate: toDate(data.resolvedAt),
  };
}

function changeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function getBookingChangeForBooking(bookingId) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookingChanges),
      where('bookingId', '==', bookingId),
    ),
  );

  const changes = snapshot.docs
    .map(mapChange)
    .filter((item) => item.status === 'requested')
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );

  return changes[0] ?? null;
}

export async function getOperatorBookingChanges(operatorId) {
  if (!operatorId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookingChanges),
      where('operatorId', '==', operatorId),
    ),
  );

  return snapshot.docs
    .map(mapChange)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function createBookingChangeRequest({
  booking,
  travelerId,
  newDeparture,
  reason,
}) {
  if (!auth.currentUser || auth.currentUser.uid !== travelerId) {
    throw changeError(
      'booking-change/not-signed-in',
      'Sign in as the traveler who owns this booking.',
    );
  }

  if (!newDeparture?.id || newDeparture.id === booking.departureId) {
    throw changeError(
      'booking-change/invalid-departure',
      'Choose a different departure.',
    );
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw changeError(
      'booking-change/not-allowed',
      'This booking is not eligible for a departure change.',
    );
  }

  const total = toNumber(booking.travelers?.total);
  const remaining =
    toNumber(newDeparture.capacity) - toNumber(newDeparture.bookedTravelers);

  if (remaining < total) {
    throw changeError(
      'booking-change/capacity',
      'That departure does not have enough slots for this booking.',
    );
  }

  const reference = await addDoc(
    collection(db, COLLECTIONS.bookingChanges),
    {
      bookingId: booking.id,
      bookingReference: booking.reference ?? '',
      travelerId,
      operatorId: booking.operatorId ?? '',
      tourId: booking.tourId ?? '',
      fromDepartureId: booking.departureId ?? '',
      toDepartureId: newDeparture.id,
      fromDepartureSnapshot: booking.departureSnapshot ?? null,
      toDepartureSnapshot: {
        startAt: newDeparture.startAt ?? null,
        endAt: newDeparture.endAt ?? null,
        meetingTime: newDeparture.meetingTime ?? '',
        meetingPoint: newDeparture.meetingPoint ?? null,
        cutoffAt: newDeparture.cutoffAt ?? null,
        timezone: newDeparture.timezone ?? 'Asia/Manila',
      },
      reason: reason.trim(),
      status: 'requested',
      resolvedBy: '',
      resolvedAt: null,
      rejectionReason: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  try {
    await notifyBookingChangeRequested(reference.id);
  } catch {
    // The request is saved even if the operator notification fails.
  }

  return reference.id;
}

export async function approveBookingChange(requestId, resolverUid) {
  const requestRef = doc(db, COLLECTIONS.bookingChanges, requestId);
  const requestSnapshot = await getDoc(requestRef);

  if (!requestSnapshot.exists) {
    throw changeError(
      'booking-change/not-found',
      'That change request no longer exists.',
    );
  }

  const request = requestSnapshot.data();
  const bookingRef = doc(db, COLLECTIONS.bookings, request.bookingId);
  const oldDepartureRef = doc(
    db,
    COLLECTIONS.departures,
    request.fromDepartureId,
  );
  const newDepartureRef = doc(
    db,
    COLLECTIONS.departures,
    request.toDepartureId,
  );

  await runTransaction(db, async (transaction) => {
    const freshRequest = await transaction.get(requestRef);
    const bookingSnapshot = await transaction.get(bookingRef);
    const oldSnapshot = await transaction.get(oldDepartureRef);
    const newSnapshot = await transaction.get(newDepartureRef);

    if (
      !freshRequest.exists ||
      freshRequest.data().status !== 'requested'
    ) {
      throw changeError(
        'booking-change/already-resolved',
        'This change request has already been resolved.',
      );
    }

    if (!bookingSnapshot.exists) {
      throw changeError(
        'booking-change/booking-missing',
        'The booking no longer exists.',
      );
    }

    if (!newSnapshot.exists) {
      throw changeError(
        'booking-change/departure-missing',
        'The new departure no longer exists.',
      );
    }

    const booking = bookingSnapshot.data();
    const newDeparture = newSnapshot.data();
    const partySize = toNumber(booking.travelers?.total);
    const newBooked = toNumber(newDeparture.bookedTravelers);
    const newCapacity = toNumber(newDeparture.capacity);

    if (
      newDeparture.status !== DEPARTURE_STATUS.scheduled ||
      newBooked + partySize > newCapacity
    ) {
      throw changeError(
        'booking-change/capacity',
        'The new departure is no longer available.',
      );
    }

    if (oldSnapshot.exists) {
      const oldDeparture = oldSnapshot.data();
      const oldBooked = Math.max(
        0,
        toNumber(oldDeparture.bookedTravelers) - partySize,
      );
      const oldCapacity = toNumber(oldDeparture.capacity);

      transaction.update(oldDepartureRef, {
        bookedTravelers: oldBooked,
        status:
          oldBooked >= oldCapacity
            ? DEPARTURE_STATUS.full
            : DEPARTURE_STATUS.scheduled,
        lastBookingId:
          oldDeparture.lastBookingId === request.bookingId
            ? null
            : oldDeparture.lastBookingId ?? null,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(newDepartureRef, {
      bookedTravelers: newBooked + partySize,
      status:
        newBooked + partySize >= newCapacity
          ? DEPARTURE_STATUS.full
          : DEPARTURE_STATUS.scheduled,
      lastBookingId: request.bookingId,
      updatedAt: serverTimestamp(),
    });

    transaction.update(bookingRef, {
      departureId: request.toDepartureId,
      departureSnapshot: freshRequest.data().toDepartureSnapshot,
      updatedAt: serverTimestamp(),
    });

    transaction.update(requestRef, {
      status: 'approved',
      resolvedBy: resolverUid,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  try {
    await createNotification({
      id: `booking-change-approved-${requestId}`,
      userId: request.travelerId,
      role: 'traveler',
      type: 'booking_change_approved',
      title: 'Departure change approved',
      message: `Your booking ${request.bookingReference || ''} has been moved to the requested departure.`,
      link: `/bookings/${request.bookingId}`,
      bookingId: request.bookingId,
      tourId: request.tourId,
    });
  } catch {
    // The change is complete even if the notification fails.
  }
}

export async function rejectBookingChange(
  requestId,
  reason,
  resolverUid,
) {
  const requestRef = doc(db, COLLECTIONS.bookingChanges, requestId);
  const snapshot = await getDoc(requestRef);

  if (!snapshot.exists) {
    throw changeError(
      'booking-change/not-found',
      'That change request no longer exists.',
    );
  }

  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw changeError(
      'booking-change/reason-required',
      'Enter a reason for rejecting the change.',
    );
  }

  const request = snapshot.data();

  await updateDoc(requestRef, {
    status: 'rejected',
    rejectionReason: trimmedReason,
    resolvedBy: resolverUid,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await createNotification({
      id: `booking-change-rejected-${requestId}`,
      userId: request.travelerId,
      role: 'traveler',
      type: 'booking_change_rejected',
      title: 'Departure change rejected',
      message: trimmedReason,
      link: `/bookings/${request.bookingId}`,
      bookingId: request.bookingId,
      tourId: request.tourId,
    });
  } catch {
    // The rejection is complete even if the notification fails.
  }
}

export function bookingChangeErrorMessage(error) {
  switch (error?.code) {
    case 'booking-change/not-signed-in':
      return 'Sign in as the traveler who owns this booking.';
    case 'booking-change/invalid-departure':
      return 'Choose a different departure.';
    case 'booking-change/not-allowed':
      return 'This booking is not eligible for a departure change.';
    case 'booking-change/capacity':
      return 'That departure does not have enough slots.';
    case 'booking-change/not-found':
      return 'That change request no longer exists.';
    case 'booking-change/already-resolved':
      return 'This change request has already been resolved.';
    case 'booking-change/reason-required':
      return 'Enter a reason for rejecting the change.';
    case 'permission-denied':
      return 'You do not have permission to change this booking.';
    default:
      return error?.message || 'Could not update this change request.';
  }
}
