import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  COLLECTIONS,
  DESTINATION_STATUS,
  TOUR_STATUS,
} from './firestoreSchema';
import { normalizeLocation } from './maps';

export const TOUR_STATUS_LABEL = Object.freeze({
  [TOUR_STATUS.draft]: 'Draft',
  [TOUR_STATUS.pendingReview]: 'Pending review',
  [TOUR_STATUS.published]: 'Published',
  [TOUR_STATUS.rejected]: 'Rejected',
  [TOUR_STATUS.hidden]: 'Hidden',
  [TOUR_STATUS.archived]: 'Archived',
});

const THUMB_TONES = ['blue', 'green', 'violet', 'orange', 'cyan'];

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
}

function durationDaysFromLabel(label) {
  const match = /(\d+)\s*(?:d\b|day)/i.exec(label ?? '');
  return match ? Math.max(1, Number(match[1])) : 1;
}

export function formatDurationLabel(days, nights) {
  const normalizedDays = Math.max(1, Math.floor(toNumber(days, 1)));
  const requestedNights = Math.max(
    0,
    Math.floor(toNumber(nights, normalizedDays - 1)),
  );
  const normalizedNights = Math.min(
    requestedNights,
    Math.max(0, normalizedDays - 1),
  );
  const dayLabel = normalizedDays === 1 ? 'day' : 'days';

  if (normalizedNights === 0) {
    return `${normalizedDays} ${dayLabel}`;
  }

  const nightLabel = normalizedNights === 1 ? 'night' : 'nights';
  return `${normalizedDays} ${dayLabel} / ${normalizedNights} ${nightLabel}`;
}

function slugify(value) {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function thumbTone(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }

  return THUMB_TONES[hash % THUMB_TONES.length];
}

function thumbLabel(value) {
  const label = (value || 'Tour')
    .split(',')[0]
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');

  return label.toUpperCase().slice(0, 14);
}

function mapTour(snapshot) {
  const data = snapshot.data();
  const pricing = data.pricing ?? {};
  const discounts = data.discounts ?? {};
  const durationDays = Math.max(
    1,
    Math.floor(
      toNumber(
        data.durationDays ?? durationDaysFromLabel(data.durationLabel),
        1,
      ),
    ),
  );
  const durationNights = Math.max(0, durationDays - 1);
  const durationLabel = formatDurationLabel(durationDays, durationNights);
  const category = data.category ?? '';
  const destinationName = data.destinationName ?? '';
  const taxesFeesMode =
    pricing.taxesFeesMode === 'added_at_checkout'
      ? 'added_at_checkout'
      : 'included';

  return {
    id: snapshot.id,
    operatorId: data.operatorId ?? '',
    destinationId: data.destinationId ?? '',
    destination: destinationName,
    destinationName,
    title: data.title ?? '',
    description: data.description ?? '',
    duration: durationLabel,
    durationDays,
    durationNights,
    categoryId: data.categoryId ?? '',
    category,
    meetingPoint: data.meetingPoint?.name ?? '',
    meetingPointAddress: data.meetingPoint?.address ?? '',
    meetingPointLocation: normalizeLocation(data.meetingPoint),
    price: toNumber(pricing.adult),
    childPrice: toNumber(pricing.child),
    infantPrice: toNumber(pricing.infant),
    minGroupSize: toNumber(pricing.minGroupSize, 1),
    groupDiscount: toNumber(pricing.groupDiscountPercent),
    taxesFeesMode,
    taxesAndFees:
      taxesFeesMode === 'added_at_checkout'
        ? 'Added at checkout'
        : 'Included in displayed price',
    discounts: {
      earlyBird: Boolean(discounts.earlyBird),
      group: Boolean(discounts.group),
      student: Boolean(discounts.student),
      senior: Boolean(discounts.seniorPwd),
    },
    status: data.status ?? TOUR_STATUS.draft,
    rejectionReason: data.rejectionReason ?? '',
    reviewedBy: data.reviewedBy ?? '',
    summary: [durationLabel, category].filter(Boolean).join(' · '),
    bookings: toNumber(data.bookingCount),
    photos: Array.isArray(data.images) ? data.images : [],
    inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
    exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
    rules: Array.isArray(data.rules) ? data.rules : [],
    itinerary: (Array.isArray(data.itinerary) ? data.itinerary : []).map(
      (item, index) => ({
        day: item.day ?? index + 1,
        title: item.title ?? '',
        text: item.description ?? item.text ?? '',
        location: normalizeLocation(item.location),
      }),
    ),
    thumbLabel: thumbLabel(destinationName || category),
    thumbTone: thumbTone(destinationName || category || snapshot.id),
    submittedAtMs: toMillis(data.submittedAt),
    reviewedAtMs: toMillis(data.reviewedAt),
    publishedAtMs: toMillis(data.publishedAt),
    createdAtMs: toMillis(data.createdAt),
    updatedAtMs: toMillis(data.updatedAt),
  };
}

function mapDestination(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name ?? '',
    region: data.region ?? '',
    province: data.province ?? '',
    sortOrder: toNumber(data.sortOrder),
  };
}

function buildTourContent(values) {
  const durationDays = Math.max(
    1,
    Math.floor(toNumber(values.durationDays, 1)),
  );
  const durationNights = Math.max(0, durationDays - 1);
  const durationLabel = formatDurationLabel(durationDays, durationNights);

  return {
    destinationId: values.destinationId,
    destinationName: (values.destinationName ?? values.destination ?? '').trim(),
    title: (values.title ?? '').trim(),
    description: (values.description ?? '').trim(),
    durationLabel,
    durationDays,
    durationNights,
    categoryId: values.categoryId ?? '',
    category: (values.category ?? '').trim(),
    meetingPoint: normalizeLocation(values.meetingPointLocation) ?? {
      name: (values.meetingPoint ?? '').trim(),
      address: (values.meetingPointAddress ?? '').trim(),
    },
    images: Array.isArray(values.photos) ? values.photos : [],
    inclusions: Array.isArray(values.inclusions) ? values.inclusions : [],
    exclusions: Array.isArray(values.exclusions) ? values.exclusions : [],
    rules: Array.isArray(values.rules) ? values.rules : [],
    itinerary: (Array.isArray(values.itinerary) ? values.itinerary : [])
      .map((item, index) => ({
        day: index + 1,
        title: (item.title ?? '').trim(),
        description: (item.text ?? '').trim(),
        location: normalizeLocation(item.location),
      }))
      .filter((item) => item.title || item.description),
    pricing: {
      adult: toNumber(values.price),
      child: toNumber(values.childPrice),
      infant: toNumber(values.infantPrice),
      minGroupSize: Math.max(1, toNumber(values.minGroupSize, 1)),
      groupDiscountPercent: Math.min(
        100,
        Math.max(0, toNumber(values.groupDiscount)),
      ),
      taxesFeesMode:
        values.taxesAndFees === 'Added at checkout'
          ? 'added_at_checkout'
          : 'included',
    },
    discounts: {
      earlyBird: Boolean(values.discounts?.earlyBird),
      group: Boolean(values.discounts?.group),
      student: Boolean(values.discounts?.student),
      seniorPwd: Boolean(values.discounts?.senior),
    },
  };
}

export function subscribeOperatorTours(operatorId, onNext, onError) {
  const toursQuery = query(
    collection(db, COLLECTIONS.tours),
    where('operatorId', '==', operatorId),
  );

  return onSnapshot(
    toursQuery,
    (snapshot) => {
      const tours = snapshot.docs
        .map(mapTour)
        .sort(
          (first, second) =>
            second.updatedAtMs - first.updatedAtMs ||
            first.title.localeCompare(second.title),
        );

      onNext(tours);
    },
    onError,
  );
}

export async function getPublicTourById(tourId) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.tours, tourId));

  if (!snapshot.exists() || snapshot.data().status !== TOUR_STATUS.published) {
    return null;
  }

  return mapTour(snapshot);
}

export async function getToursForModeration() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.tours));
  const statusOrder = {
    [TOUR_STATUS.pendingReview]: 0,
    [TOUR_STATUS.published]: 1,
    [TOUR_STATUS.rejected]: 2,
    [TOUR_STATUS.hidden]: 3,
    [TOUR_STATUS.archived]: 4,
    [TOUR_STATUS.draft]: 5,
  };

  return snapshot.docs.map(mapTour).sort((first, second) => {
    const statusDifference =
      (statusOrder[first.status] ?? 9) - (statusOrder[second.status] ?? 9);

    return (
      statusDifference ||
      second.submittedAtMs - first.submittedAtMs ||
      second.updatedAtMs - first.updatedAtMs ||
      first.title.localeCompare(second.title)
    );
  });
}

export async function moderateTour(tourId, status, rejectionReason = '') {
  const adminId = auth.currentUser?.uid;

  if (!adminId) {
    throw new Error('Your admin session has expired. Sign in again.');
  }

  if (
    ![
      TOUR_STATUS.published,
      TOUR_STATUS.rejected,
      TOUR_STATUS.hidden,
      TOUR_STATUS.archived,
    ].includes(status)
  ) {
    throw new Error('Invalid moderation status.');
  }

  const payload = {
    status,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (status === TOUR_STATUS.published) {
    payload.publishedAt = serverTimestamp();
  }

  if (status === TOUR_STATUS.rejected) {
    payload.rejectionReason = rejectionReason.trim();
  } else {
    payload.rejectionReason = '';
  }

  await updateDoc(doc(db, COLLECTIONS.tours, tourId), payload);
}

export async function getActiveDestinations() {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.destinations),
      where('status', '==', DESTINATION_STATUS.active),
    ),
  );

  return snapshot.docs
    .map(mapDestination)
    .sort(
      (first, second) =>
        first.sortOrder - second.sortOrder ||
        first.name.localeCompare(second.name),
    );
}

export async function createOperatorTour(values, status) {
  const operatorId = auth.currentUser?.uid;

  if (!operatorId) {
    throw new Error('Your operator session has expired. Sign in again.');
  }

  const reference = doc(collection(db, COLLECTIONS.tours));
  const slug = slugify(values.title) || `tour-${reference.id.slice(0, 8)}`;

  await setDoc(reference, {
    ...buildTourContent(values),
    operatorId,
    slug,
    status,
    submittedAt:
      status === TOUR_STATUS.pendingReview ? serverTimestamp() : null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: '',
    publishedAt: null,
    ratingAvg: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateOperatorTour(tourId, values, status) {
  const payload = {
    ...buildTourContent(values),
    status,
    submittedAt:
      status === TOUR_STATUS.pendingReview ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  };

  if (status === TOUR_STATUS.pendingReview) {
    payload.rejectionReason = '';
  }

  await updateDoc(doc(db, COLLECTIONS.tours, tourId), payload);
}

export async function deleteDraftTour(tourId) {
  await deleteDoc(doc(db, COLLECTIONS.tours, tourId));
}

export function tourErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to save this tour. Confirm you are signed in as an operator.';
    case 'unavailable':
      return 'Firestore is unavailable. Check your connection and try again.';
    case 'failed-precondition':
      return 'The tour database is missing a required index. Refresh and try again.';
    default:
      return error?.message || 'Could not save the tour. Please try again.';
  }
}

export function moderationErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to moderate this tour. Confirm you are signed in as an admin.';
    case 'unavailable':
      return 'Firestore is unavailable. Check your connection and try again.';
    default:
      return error?.message || 'Could not update this tour. Please try again.';
  }
}

export function getTourStatusLabel(status) {
  return TOUR_STATUS_LABEL[status] ?? 'Draft';
}
