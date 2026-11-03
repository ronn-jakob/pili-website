import fallbackImage from '../Images/destinations-hero.png';
import {
  formatLongDate,
  formatMoney,
} from '../utils/booking';
import {
  normalizeTravelers,
  travelerLabel,
} from '../utils/travelers';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PAYMENT_LABELS = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit paid',
  paid: 'Paid in full',
  refund_pending: 'Refund pending',
  refunded: 'Refunded',
};

export const bookingFilters = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export function getBookingStats(items) {
  const upcoming = items.filter(
    (booking) =>
      booking.status === 'Confirmed' || booking.status === 'Pending',
  ).length;
  const completed = items.filter(
    (booking) => booking.status === 'Completed',
  ).length;
  const cancelled = items.filter(
    (booking) => booking.status === 'Cancelled',
  ).length;
  const totalSpent = items.reduce(
    (sum, booking) => sum + booking.priceValue,
    0,
  );

  return { upcoming, completed, cancelled, totalSpent };
}

function statusLabel(status) {
  return STATUS_LABELS[status] ?? 'Pending';
}

function paymentTone(status) {
  if (status === 'paid') {
    return 'paid';
  }

  if (status === 'deposit_paid') {
    return 'deposit';
  }

  if (status === 'refund_pending' || status === 'refunded') {
    return 'refunded';
  }

  return 'unpaid';
}

export function mapBookingToCard(booking) {
  const total = Number(booking.amounts?.total) || 0;
  const currency = booking.amounts?.currency || 'PHP';
  const status = statusLabel(booking.status);
  const paymentStatus = booking.paymentStatus ?? 'unpaid';
  const startAt = booking.departureStartAt;
  const endAt = booking.departureEndAt;
  const meetingPoint = booking.departureSnapshot?.meetingPoint;
  const inclusions = Array.isArray(booking.tourSnapshot?.inclusions)
    ? booking.tourSnapshot.inclusions
    : [];
  const isCancelled = status === 'Cancelled';
  const isPaid = paymentStatus === 'paid';

  return {
    id: booking.id,
    reference:
      booking.reference ||
      `PILI-${booking.id.slice(-5).toUpperCase()}`,
    status,
    title: booking.tourSnapshot?.title || 'Tour booking',
    location:
      booking.tourSnapshot?.destinationName || 'Philippines',
    image: booking.tourSnapshot?.image || fallbackImage,
    priceValue: total,
    priceLabel: formatMoney(total, currency),
    checkIn: startAt ? formatLongDate(startAt) : 'To be confirmed',
    checkOut: endAt ? formatLongDate(endAt) : 'To be confirmed',
    duration: booking.tourSnapshot?.durationLabel || 'Flexible',
    guests:
      travelerLabel(normalizeTravelers(booking.travelers)) || '—',
    meetingPoint:
      [meetingPoint?.name, booking.departureSnapshot?.meetingTime]
        .filter(Boolean)
        .join(', ') || 'To be confirmed',
    includes: inclusions.length
      ? inclusions.slice(0, 4).join(', ')
      : 'Tour package as booked',
    policy: isCancelled
      ? 'Booking cancelled'
      : 'Contact support to change or cancel.',
    paymentStatus: PAYMENT_LABELS[paymentStatus] ?? 'Unpaid',
    paymentStatusRaw: paymentStatus,
    paymentTone: paymentTone(paymentStatus),
    paymentMethod:
      booking.paymentMethod ||
      (isPaid ? 'Stripe' : 'Payment pending'),
    remaining: isCancelled
      ? paymentStatus === 'refunded'
        ? 'Refund processed'
        : 'No payment due'
      : isPaid
        ? `${formatMoney(0, currency)} remaining`
        : `${formatMoney(total, currency)} due`,
    canRequestChange: false,
    canCancel: status === 'Pending' || status === 'Confirmed',
  };
}
