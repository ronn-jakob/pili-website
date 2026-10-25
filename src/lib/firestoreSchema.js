export const COLLECTIONS = Object.freeze({
  users: 'users',
  admins: 'admins',
  operators: 'operators',
  operatorApplications: 'operatorApplications',
  destinations: 'destinations',
  categories: 'categories',
  tours: 'tours',
  departures: 'departures',
  bookings: 'bookings',
  payments: 'payments',
  cancellationRequests: 'cancellationRequests',
  reviews: 'reviews',
  notifications: 'notifications',
  auditLogs: 'auditLogs',
  settings: 'settings',
});

export const ROLES = Object.freeze({
  traveler: 'traveler',
  operator: 'operator',
  admin: 'admin',
});

export const TOUR_STATUS = Object.freeze({
  draft: 'draft',
  pendingReview: 'pending_review',
  published: 'published',
  rejected: 'rejected',
  hidden: 'hidden',
  archived: 'archived',
});

export const DEPARTURE_STATUS = Object.freeze({
  scheduled: 'scheduled',
  full: 'full',
  completed: 'completed',
  cancelled: 'cancelled',
});

export const BOOKING_STATUS = Object.freeze({
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
});

export const PAYMENT_STATUS = Object.freeze({
  unpaid: 'unpaid',
  depositPaid: 'deposit_paid',
  paid: 'paid',
  refundPending: 'refund_pending',
  refunded: 'refunded',
});

export const REVIEW_STATUS = Object.freeze({
  pending: 'pending',
  published: 'published',
  hidden: 'hidden',
});

export const DESTINATION_STATUS = Object.freeze({
  active: 'active',
  inactive: 'inactive',
});

export const CATEGORY_STATUS = Object.freeze({
  active: 'active',
  inactive: 'inactive',
});

export const TAXES_FEES_MODE = Object.freeze({
  included: 'included',
  addedAtCheckout: 'added_at_checkout',
});

export function isPublicDestination(destination) {
  return destination.status === DESTINATION_STATUS.active;
}

export function isPublicTour(tour) {
  return tour.status === TOUR_STATUS.published;
}
