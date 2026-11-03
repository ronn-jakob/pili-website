import { auth } from './firebase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
);

function paymentError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function authorizedRequest(path, options = {}) {
  const user = auth.currentUser;

  if (!user) {
    throw paymentError(
      'auth/required',
      'Sign in as a traveler to continue.',
    );
  }

  const token = await user.getIdToken();
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw paymentError(
      'server/offline',
      'The payment server is not running. Start it with npm run server.',
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw paymentError(
      payload.code ?? 'server/error',
      payload.error ?? 'The payment server could not complete that request.',
    );
  }

  return payload;
}

export function createPaymentIntent(bookingId) {
  return authorizedRequest('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function notifyBookingCreated(bookingId) {
  return authorizedRequest('/api/notifications/booking-created', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function adminCancelBooking(bookingId) {
  return authorizedRequest('/api/admin/cancel-booking', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function notifyBookingChangeRequested(changeRequestId) {
  return authorizedRequest('/api/notifications/booking-change-requested', {
    method: 'POST',
    body: JSON.stringify({ changeRequestId }),
  });
}

export function notifyReviewSubmitted(reviewId) {
  return authorizedRequest('/api/notifications/review-submitted', {
    method: 'POST',
    body: JSON.stringify({ reviewId }),
  });
}

export function notifyRefundRequested(bookingId) {
  return authorizedRequest('/api/notifications/refund-requested', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function approveRefundRequest(bookingId) {
  return authorizedRequest('/api/admin/approve-refund-request', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function confirmPaymentIntent(paymentIntentId) {
  return authorizedRequest(
    `/api/payment-intent?payment_intent=${encodeURIComponent(
      paymentIntentId,
    )}`,
  );
}

export function releaseBooking(bookingId, paymentIntentId) {
  return authorizedRequest('/api/release-booking', {
    method: 'POST',
    body: JSON.stringify({
      bookingId,
      paymentIntentId: paymentIntentId || '',
    }),
  });
}

export function cancelBooking(bookingId) {
  return authorizedRequest('/api/cancel-booking', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });
}

export function paymentErrorMessage(error) {
  switch (error?.code) {
    case 'auth/required':
      return 'Sign in as a traveler to continue.';
    case 'auth/invalid':
      return 'Your session expired. Sign in again.';
    case 'server/offline':
      return 'The payment server is not running. Start it with npm run server.';
    case 'stripe/not-configured':
      return 'Stripe is not configured on the payment server yet.';
    case 'firebase/not-configured':
      return 'Firebase Admin is not configured on the payment server yet.';
    case 'booking/not-found':
      return 'That booking could not be found.';
    case 'booking/not-owner':
      return 'You do not have permission to pay for this booking.';
    case 'booking/not-payable':
      return 'This booking is no longer awaiting payment.';
    case 'booking/invalid-total':
      return 'This booking does not have a payable total.';
    case 'booking/amount-mismatch':
    case 'stripe/amount-mismatch':
      return 'The booking total does not match the current tour price.';
    case 'booking/tour-unavailable':
      return 'This tour is no longer available for payment.';
    case 'booking/payment-intent-save-failed':
      return 'Could not attach the payment to this booking.';
    case 'booking/not-cancellable':
      return 'This booking cannot be cancelled.';
    case 'stripe/refund-failed':
      return 'Stripe could not refund this payment.';
    case 'stripe/already-paid':
      return 'This payment already completed. The booking cannot be released.';
    case 'stripe/payment-intent-failed':
    case 'stripe/payment-intent-lookup-failed':
      return 'Stripe could not verify this payment. Please try again.';
    case 'stripe/payment-intent-missing':
      return 'The Stripe payment reference is missing.';
    default:
      return (
        error?.message ||
        'Could not complete the payment. Please try again.'
      );
  }
}
