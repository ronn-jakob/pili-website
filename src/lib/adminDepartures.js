import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';
import { logAdminAction } from './auditLogs';
import { createNotification } from './notifications';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

export async function getAdminDepartures() {
  const [departureSnapshot, tourSnapshot, operatorSnapshot] =
    await Promise.all([
      getDocs(collection(db, COLLECTIONS.departures)),
      getDocs(collection(db, COLLECTIONS.tours)),
      getDocs(collection(db, COLLECTIONS.operators)),
    ]);
  const tours = new Map(
    tourSnapshot.docs.map((item) => [
      item.id,
      item.data().title ?? 'Tour',
    ]),
  );
  const operators = new Map(
    operatorSnapshot.docs.map((item) => [
      item.id,
      item.data().businessName ?? item.data().email ?? 'Operator',
    ]),
  );

  return departureSnapshot.docs
    .map((item) => {
      const data = item.data();

      return {
        id: item.id,
        ...data,
        startAtDate: toDate(data.startAt),
        endAtDate: toDate(data.endAt),
        tourTitle: tours.get(data.tourId) ?? 'Tour',
        operatorName: operators.get(data.operatorId) ?? 'Operator',
      };
    })
    .sort(
      (first, second) =>
        (first.startAtDate?.getTime() ?? 0) -
        (second.startAtDate?.getTime() ?? 0),
    );
}

export async function cancelAdminDeparture(departureId, reason) {
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new Error('Enter a reason for cancelling this departure.');
  }

  const departureRef = doc(db, COLLECTIONS.departures, departureId);
  await updateDoc(departureRef, {
    status: 'cancelled',
    cancellationReason: trimmedReason,
    updatedAt: serverTimestamp(),
  });

  await logAdminAction({
    action: 'departure.cancel',
    targetType: 'departure',
    targetId: departureId,
    summary: `Cancelled departure ${departureId}: ${trimmedReason}`,
  });

  const bookingsSnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookings),
      where('departureId', '==', departureId),
    ),
  );
  const activeBookings = bookingsSnapshot.docs.filter(
    (item) => item.data().status !== 'cancelled',
  );

  await Promise.all(
    activeBookings.map(async (item) => {
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
          } was cancelled. Reason: ${trimmedReason}`,
          link: `/bookings/${item.id}`,
          bookingId: item.id,
          tourId: booking.tourId ?? '',
          departureId,
        });
      } catch {
        // Cancellation succeeds even if a notification cannot be created.
      }
    }),
  );

  return activeBookings.length;
}

export function adminDepartureErrorMessage(error) {
  return error?.message || 'Could not update this departure.';
}
