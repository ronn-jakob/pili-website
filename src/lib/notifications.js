import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapNotification(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAtDate: toDate(data.createdAt),
    readAtDate: toDate(data.readAt),
  };
}

export function subscribeToNotifications(
  userId,
  onItems,
  onError,
) {
  const notificationsQuery = query(
    collection(db, COLLECTIONS.notifications),
    where('userId', '==', userId),
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      onItems(
        snapshot.docs
          .map(mapNotification)
          .sort(
            (first, second) =>
              (second.createdAtDate?.getTime() ?? 0) -
              (first.createdAtDate?.getTime() ?? 0),
          ),
      );
    },
    onError,
  );
}

export async function getNotifications(userId) {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.notifications),
      where('userId', '==', userId),
    ),
  );

  return snapshot.docs
    .map(mapNotification)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function markNotificationRead(notificationId) {
  await updateDoc(
    doc(db, COLLECTIONS.notifications, notificationId),
    {
      readAt: serverTimestamp(),
    },
  );
}

export async function markAllNotificationsRead(notifications) {
  const unread = notifications.filter(
    (notification) => !notification.readAt,
  );

  if (unread.length === 0) {
    return;
  }

  const batch = writeBatch(db);

  for (const notification of unread) {
    batch.update(
      doc(db, COLLECTIONS.notifications, notification.id),
      {
        readAt: serverTimestamp(),
      },
    );
  }

  await batch.commit();
}

export async function createNotification({
  id,
  userId,
  role = 'traveler',
  type,
  title,
  message,
  link = '',
  bookingId = '',
  tourId = '',
  departureId = '',
  changeRequestId = '',
  applicationId = '',
  reviewId = '',
}) {
  const notificationRef = doc(
    db,
    COLLECTIONS.notifications,
    id,
  );
  const snapshot = await getDoc(notificationRef);

  if (snapshot.exists()) {
    return false;
  }

  await setDoc(notificationRef, {
    userId,
    role,
    type,
    title,
    message,
    link,
    bookingId,
    tourId,
    departureId,
    changeRequestId,
    applicationId,
    reviewId,
    readAt: null,
    createdAt: serverTimestamp(),
  });

  return true;
}

export function notificationErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to view these notifications.';
    case 'unavailable':
      return 'Notifications are unavailable. Check your connection and try again.';
    default:
      return (
        error?.message ||
        'Could not load notifications. Please try again.'
      );
  }
}
