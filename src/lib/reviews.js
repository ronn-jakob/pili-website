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
import {
  COLLECTIONS,
  REVIEW_STATUS,
} from './firestoreSchema';
import { logAdminAction } from './auditLogs';
import { createNotification } from './notifications';
import { notifyReviewSubmitted } from './paymentApi';

const STATUS_LABEL = {
  [REVIEW_STATUS.pending]: 'Awaiting moderation',
  [REVIEW_STATUS.published]: 'Published',
  [REVIEW_STATUS.hidden]: 'Hidden',
};

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function reviewError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function mapReview(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAtDate: toDate(data.createdAt),
    moderatedAtDate: toDate(data.moderatedAt),
  };
}

export function reviewStatusLabel(status) {
  return STATUS_LABEL[status] ?? 'Awaiting moderation';
}

export function travelerDisplayName(booking) {
  const first = booking?.travelerSnapshot?.firstName?.trim() || 'Traveler';
  const last = booking?.travelerSnapshot?.lastName?.trim() || '';

  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

export function getReviewEligibility(
  booking,
  review,
  departureStatus = '',
) {
  if (!booking) {
    return {
      eligible: false,
      reason: 'Booking not found.',
    };
  }

  if (review) {
    return {
      eligible: false,
      reason: `You already submitted a review. ${reviewStatusLabel(
        review.moderationStatus,
      )}.`,
    };
  }

  if (booking.status === 'cancelled') {
    return {
      eligible: false,
      reason: 'Cancelled bookings cannot be reviewed.',
    };
  }

  if (!['confirmed', 'completed'].includes(booking.status)) {
    return {
      eligible: false,
      reason: 'You can review this booking after it is confirmed.',
    };
  }

  if (booking.paymentStatus !== 'paid') {
    return {
      eligible: false,
      reason: 'You can review this booking after payment is complete.',
    };
  }

  const endAt = booking.departureEndAt;
  const departureCompleted =
    booking.status === 'completed' || departureStatus === 'completed';

  if (
    !departureCompleted &&
    (!endAt || endAt.getTime() > Date.now())
  ) {
    return {
      eligible: false,
      reason: 'You can review this trip after the departure ends or the operator marks it completed.',
    };
  }

  return {
    eligible: true,
    reason: '',
  };
}

export async function createReview({
  bookingId,
  rating,
  title,
  comment,
}) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw reviewError(
      'reviews/not-signed-in',
      'Sign in as a traveler to submit a review.',
    );
  }

  const bookingRef = doc(
    db,
    COLLECTIONS.bookings,
    bookingId,
  );
  const bookingSnapshot = await getDoc(bookingRef);

  if (!bookingSnapshot.exists()) {
    throw reviewError(
      'reviews/booking-not-found',
      'That booking could not be found.',
    );
  }

  const booking = bookingSnapshot.data();

  if (booking.travelerId !== currentUser.uid) {
    throw reviewError(
      'reviews/not-owner',
      'You can only review your own booking.',
    );
  }

  const endAt = toDate(booking.departureSnapshot?.endAt);
  const departureEnded = endAt && endAt.getTime() <= Date.now();
  const departureSnapshot = booking.departureId
    ? await getDoc(
        doc(db, COLLECTIONS.departures, booking.departureId),
      )
    : null;
  const departureCompleted =
    booking.status === 'completed' ||
    (departureSnapshot?.exists() &&
      departureSnapshot.data().status === 'completed');

  if (
    !['confirmed', 'completed'].includes(booking.status) ||
    booking.paymentStatus !== 'paid' ||
    (!departureCompleted && !departureEnded)
  ) {
    throw reviewError(
      'reviews/not-eligible',
      'This booking is not eligible for a review yet.',
    );
  }

  const reviewRef = doc(
    db,
    COLLECTIONS.reviews,
    bookingId,
  );
  const existingReview = await getDoc(reviewRef);

  if (existingReview.exists()) {
    throw reviewError(
      'reviews/already-reviewed',
      'You already submitted a review for this booking.',
    );
  }

  const review = {
    bookingId,
    bookingReference: booking.reference ?? '',
    tourId: booking.tourId ?? '',
    tourTitle: booking.tourSnapshot?.title ?? 'Tour booking',
    operatorId: booking.operatorId ?? '',
    travelerId: currentUser.uid,
    travelerName: travelerDisplayName(booking),
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    moderationStatus: REVIEW_STATUS.pending,
    createdAt: serverTimestamp(),
    moderatedBy: null,
    moderatedAt: null,
  };

  await setDoc(reviewRef, review);

  try {
    await notifyReviewSubmitted(bookingId);
  } catch {
    // The review is saved even if the admin notification fails.
  }

  return {
    id: bookingId,
    ...review,
    createdAtDate: new Date(),
    moderatedAtDate: null,
  };
}

export async function getReviewForBooking(bookingId) {
  if (!bookingId) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.reviews, bookingId),
  );

  return snapshot.exists() ? mapReview(snapshot) : null;
}

export async function getPublishedReviewsForTour(tourId) {
  if (!tourId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.reviews),
      where(
        'moderationStatus',
        '==',
        REVIEW_STATUS.published,
      ),
    ),
  );

  return snapshot.docs
    .map(mapReview)
    .filter((review) => review.tourId === tourId)
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function getAdminReviews() {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.reviews),
  );

  return snapshot.docs
    .map(mapReview)
    .sort((first, second) => {
      const firstPending =
        first.moderationStatus === REVIEW_STATUS.pending ? 1 : 0;
      const secondPending =
        second.moderationStatus === REVIEW_STATUS.pending ? 1 : 0;

      return (
        secondPending - firstPending ||
        (second.createdAtDate?.getTime() ?? 0) -
          (first.createdAtDate?.getTime() ?? 0)
      );
    });
}

export async function getTravelerReviews(travelerId) {
  if (!travelerId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.reviews),
      where('travelerId', '==', travelerId),
    ),
  );

  return snapshot.docs.map(mapReview);
}

export async function getOperatorReviews(operatorId) {
  if (!operatorId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.reviews),
      where('operatorId', '==', operatorId),
    ),
  );

  return snapshot.docs
    .map(mapReview)
    .filter(
      (review) =>
        review.moderationStatus === REVIEW_STATUS.published,
    )
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    );
}

export async function moderateReview(
  reviewId,
  moderationStatus,
) {
  if (
    ![REVIEW_STATUS.published, REVIEW_STATUS.hidden].includes(
      moderationStatus,
    )
  ) {
    throw reviewError(
      'reviews/invalid-status',
      'Choose Published or Hidden.',
    );
  }

  const reviewRef = doc(db, COLLECTIONS.reviews, reviewId);
  const snapshot = await getDoc(reviewRef);

  if (!snapshot.exists()) {
    throw reviewError(
      'reviews/not-found',
      'That review could not be found.',
    );
  }

  const review = snapshot.data();

  await updateDoc(reviewRef, {
    moderationStatus,
    moderatedBy: auth.currentUser?.uid ?? '',
    moderatedAt: serverTimestamp(),
  });

  await logAdminAction({
    action: `review.${moderationStatus}`,
    targetType: 'review',
    targetId: reviewId,
    summary: `Set review for ${
      review.tourTitle || 'tour'
    } to ${moderationStatus}.`,
  });

  try {
    await createNotification({
      id: `review-${moderationStatus}-${reviewId}`,
      userId: review.travelerId,
      role: 'traveler',
      type:
        moderationStatus === REVIEW_STATUS.published
          ? 'review_published'
          : 'review_hidden',
      title:
        moderationStatus === REVIEW_STATUS.published
          ? 'Review published'
          : 'Review hidden',
      message:
        moderationStatus === REVIEW_STATUS.published
          ? `Your review for ${
              review.tourTitle || 'your tour'
            } is now visible on the tour page.`
          : `Your review for ${
              review.tourTitle || 'your tour'
            } was hidden by an administrator.`,
      link: `/bookings/${review.bookingId}`,
      bookingId: review.bookingId ?? '',
      tourId: review.tourId ?? '',
      reviewId,
    });
  } catch {
    // Moderation succeeded even if the notification could not be created.
  }
}

export function reviewErrorMessage(error) {
  switch (error?.code) {
    case 'reviews/not-signed-in':
      return 'Sign in as a traveler to submit a review.';
    case 'reviews/booking-not-found':
      return 'That booking could not be found.';
    case 'reviews/not-owner':
      return 'You can only review your own booking.';
    case 'reviews/not-eligible':
      return 'This booking is not eligible for a review yet.';
    case 'reviews/already-reviewed':
      return 'You already submitted a review for this booking.';
    case 'reviews/not-found':
      return 'That review could not be found.';
    case 'reviews/invalid-status':
      return 'Choose Published or Hidden.';
    case 'permission-denied':
      return 'You do not have permission to do that.';
    default:
      return (
        error?.message ||
        'Could not save this review. Please try again.'
      );
  }
}
