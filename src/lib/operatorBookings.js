import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapBooking(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    departureStartAt: toDate(data.departureSnapshot?.startAt),
    departureEndAt: toDate(data.departureSnapshot?.endAt),
    createdAtDate: toDate(data.createdAt),
    updatedAtDate: toDate(data.updatedAt),
  };
}

export async function getOperatorBookings(operatorId) {
  if (!operatorId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.bookings),
      where('operatorId', '==', operatorId),
    ),
  );

  return snapshot.docs
    .map(mapBooking)
    .sort(
      (first, second) =>
        (first.departureStartAt?.getTime() ?? 0) -
        (second.departureStartAt?.getTime() ?? 0),
    );
}

export async function getAdminBookings() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.bookings));

  return snapshot.docs
    .map(mapBooking)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}
