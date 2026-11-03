import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';
import { getRecentAuditLogs } from './auditLogs';
import { formatMoney } from '../utils/booking';

function toDate(value) {
  return value?.toDate ? value.toDate() : null;
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('en-PH', { month: 'short' }).format(date);
}

function statusLabel(status) {
  if (!status) {
    return 'Pending';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function getAdminDashboardData() {
  const [
    usersSnapshot,
    operatorsSnapshot,
    toursSnapshot,
    bookingsSnapshot,
    reviewsSnapshot,
    applicationsSnapshot,
    recentAudit,
  ] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.users)),
    getDocs(collection(db, COLLECTIONS.operators)),
    getDocs(collection(db, COLLECTIONS.tours)),
    getDocs(collection(db, COLLECTIONS.bookings)),
    getDocs(collection(db, COLLECTIONS.reviews)),
    getDocs(collection(db, COLLECTIONS.operatorApplications)),
    getRecentAuditLogs(6),
  ]);
  const bookings = bookingsSnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
    createdAtDate: toDate(item.data().createdAt),
  }));
  const pendingTours = toursSnapshot.docs.filter(
    (item) => item.data().status === 'pending_review',
  ).length;
  const activeOperators = operatorsSnapshot.docs.filter(
    (item) => item.data().status !== 'suspended',
  ).length;
  const pendingApplications = applicationsSnapshot.docs.filter(
    (item) => item.data().status === 'pending',
  ).length;
  const pendingReviews = reviewsSnapshot.docs.filter(
    (item) => item.data().moderationStatus === 'pending',
  ).length;
  const refundRequests = bookings.filter(
    (item) => item.paymentStatus === 'refund_pending',
  ).length;
  const paidBookings = bookings.filter(
    (item) =>
      item.paymentStatus === 'paid' && item.status !== 'cancelled',
  );
  const now = new Date();
  const months = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const next = new Date(
      now.getFullYear(),
      now.getMonth() - index + 1,
      1,
    );
    const count = bookings.filter(
      (booking) =>
        booking.createdAtDate &&
        booking.createdAtDate >= date &&
        booking.createdAtDate < next,
    ).length;
    months.push({ month: monthLabel(date), value: count });
  }

  const maxMonth = Math.max(1, ...months.map((month) => month.value));
  const bookingBars = months.map((month) => ({
    ...month,
    height: Math.max(4, Math.round((month.value / maxMonth) * 100)),
  }));
  const recentReservations = [...bookings]
    .sort(
      (first, second) =>
        (second.createdAtDate?.getTime() ?? 0) -
        (first.createdAtDate?.getTime() ?? 0),
    )
    .slice(0, 5)
    .map((booking) => ({
      id: booking.reference || booking.id,
      traveler: `${
        booking.travelerSnapshot?.firstName ?? ''
      } ${booking.travelerSnapshot?.lastName ?? ''}`.trim() || 'Traveler',
      tour: booking.tourSnapshot?.title ?? 'Tour',
      date: booking.createdAtDate
        ? new Intl.DateTimeFormat('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(booking.createdAtDate)
        : '—',
      amount: formatMoney(
        booking.amounts?.total ?? 0,
        booking.amounts?.currency || 'PHP',
      ),
      status: statusLabel(booking.status),
    }));

  return {
    stats: [
      {
        id: 'users',
        label: 'Total Users',
        value: String(usersSnapshot.size),
        delta: 'Registered traveler accounts',
        tone: 'dark',
      },
      {
        id: 'operators',
        label: 'Active Operators',
        value: String(activeOperators),
        delta: `${pendingApplications} pending application${
          pendingApplications === 1 ? '' : 's'
        }`,
        tone: 'green',
      },
      {
        id: 'tours',
        label: 'Live Tours',
        value: String(
          toursSnapshot.docs.filter(
            (item) => item.data().status === 'published',
          ).length,
        ),
        delta: `${pendingTours} pending approval`,
        tone: 'blue',
      },
      {
        id: 'reservations',
        label: 'Reservations',
        value: String(bookings.length),
        delta: `${paidBookings.length} paid booking${
          paidBookings.length === 1 ? '' : 's'
        }`,
        tone: 'violet',
      },
    ],
    bookingBars,
    pendingActions: [
      {
        id: 'applications',
        label: 'Operator applications',
        count: pendingApplications,
        tone: 'amber',
      },
      {
        id: 'packages',
        label: 'Tour packages for review',
        count: pendingTours,
        tone: 'amber',
      },
      {
        id: 'refunds',
        label: 'Refund requests',
        count: refundRequests,
        tone: 'amber',
      },
      {
        id: 'reviews',
        label: 'Reviews awaiting moderation',
        count: pendingReviews,
        tone: 'red',
      },
    ],
    recentReservations,
    recentAudit,
  };
}
