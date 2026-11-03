import { getFirebaseServices } from './firebaseAdmin.js';

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
  if (!id || !userId || !type) {
    return false;
  }

  try {
    const { db, FieldValue } = getFirebaseServices();
    const notificationRef = db
      .collection('notifications')
      .doc(id);
    const snapshot = await notificationRef.get();

    if (snapshot.exists) {
      return false;
    }

    await notificationRef.set({
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
      createdAt: FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Could not create notification:', error);
    return false;
  }
}
