import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';
import { logAdminAction } from './auditLogs';
import { createNotification } from './notifications';
import { notifyRefundRequested } from './paymentApi';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function mapRequest(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAtDate: toDate(data.createdAt),
    resolvedAtDate: toDate(data.resolvedAt),
  };
}

function requestError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function refundRequestStatusLabel(status) {
  switch (status) {
    case 'requested':
      return 'Refund pending admin approval';
    case 'processed':
      return 'Refund approved and processed';
    case 'rejected':
      return 'Refund request rejected';
    default:
      return 'No refund request';
  }
}

export async function getCancellationRequest(bookingId) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.cancellationRequests, bookingId),
  );

  return snapshot.exists() ? mapRequest(snapshot) : null;
}

export async function getTravelerCancellationRequests(travelerId) {
  if (!travelerId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.cancellationRequests),
      where('travelerId', '==', travelerId),
    ),
  );

  return snapshot.docs
    .map(mapRequest)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function getAdminCancellationRequests() {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.cancellationRequests),
  );

  return snapshot.docs
    .map(mapRequest)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function createCancellationRequest({
  booking,
  travelerId,
  reason,
}) {
  if (!auth.currentUser || auth.currentUser.uid !== travelerId) {
    throw requestError(
      'refund-request/not-signed-in',
      'Sign in as the traveler who owns this booking.',
    );
  }

  if (
    !booking ||
    booking.travelerId !== travelerId ||
    booking.paymentStatus !== 'paid' ||
    !['confirmed', 'completed'].includes(booking.status)
  ) {
    throw requestError(
      'refund-request/not-eligible',
      'This booking is not eligible for a refund request.',
    );
  }

  const requestRef = doc(
    db,
    COLLECTIONS.cancellationRequests,
    booking.id,
  );
  const existing = await getDoc(requestRef);

  if (existing.exists()) {
    throw requestError(
      'refund-request/already-requested',
      'A refund request already exists for this booking.',
    );
  }

  await setDoc(requestRef, {
    bookingId: booking.id,
    bookingReference: booking.reference ?? '',
    travelerId,
    operatorId: booking.operatorId ?? '',
    tourId: booking.tourId ?? '',
    reason: reason.trim(),
    refundAmount: Number(booking.amounts?.total) || 0,
    status: 'requested',
    adminNote: '',
    resolvedBy: '',
    resolvedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await notifyRefundRequested(booking.id);
  } catch {
    // The request is saved even if the admin notification fails.
  }

  return getCancellationRequest(booking.id);
}

export async function rejectCancellationRequest(
  bookingId,
  adminNote,
  adminUid,
) {
  const note = adminNote.trim();

  if (!note) {
    throw requestError(
      'refund-request/note-required',
      'Enter a note for rejecting this request.',
    );
  }

  const requestRef = doc(
    db,
    COLLECTIONS.cancellationRequests,
    bookingId,
  );
  const snapshot = await getDoc(requestRef);

  if (!snapshot.exists()) {
    throw requestError(
      'refund-request/not-found',
      'That refund request could not be found.',
    );
  }

  const request = snapshot.data();

  if (request.status !== 'requested') {
    throw requestError(
      'refund-request/already-resolved',
      'This refund request has already been resolved.',
    );
  }

  await updateDoc(requestRef, {
    status: 'rejected',
    adminNote: note,
    resolvedBy: adminUid,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await logAdminAction({
    action: 'refund.reject',
    targetType: 'cancellationRequest',
    targetId: bookingId,
    summary: `Rejected refund request for booking ${
      request.bookingReference || bookingId
    }: ${note}`,
  });

  try {
    await createNotification({
      id: `refund-rejected-${bookingId}`,
      userId: request.travelerId,
      role: 'traveler',
      type: 'refund_rejected',
      title: 'Refund request rejected',
      message: `Your refund request for booking ${
        request.bookingReference || bookingId
      } was rejected. ${note}`,
      link: `/bookings/${bookingId}`,
      bookingId,
      tourId: request.tourId ?? '',
    });
  } catch {
    // The rejection is saved even if the notification fails.
  }
}

export function refundRequestErrorMessage(error) {
  switch (error?.code) {
    case 'refund-request/not-signed-in':
      return 'Sign in as the traveler who owns this booking.';
    case 'refund-request/not-eligible':
      return 'This booking is not eligible for a refund request.';
    case 'refund-request/already-requested':
      return 'A refund request already exists for this booking.';
    case 'refund-request/note-required':
      return 'Enter a note for rejecting this request.';
    case 'refund-request/not-found':
      return 'That refund request could not be found.';
    case 'refund-request/already-resolved':
      return 'This refund request has already been resolved.';
    case 'permission-denied':
      return 'You do not have permission to update this refund request.';
    default:
      return error?.message || 'Could not update this refund request.';
  }
}
