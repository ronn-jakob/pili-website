import { formatMoney } from '../utils/booking';

const DAY_MS = 24 * 60 * 60 * 1000;
const GRADIENTS = [
  'linear-gradient(135deg, #2f7f8f 0%, #5aa6a0 100%)',
  'linear-gradient(135deg, #2d7777 0%, #4f9a86 100%)',
  'linear-gradient(135deg, #4f7f4f 0%, #7d9e5a 100%)',
  'linear-gradient(135deg, #5f5877 0%, #8478a0 100%)',
];

function startOfDay(value) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  );
}

function startOfWeek(value) {
  const date = startOfDay(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return date;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pending';
}

function sumTotals(bookings) {
  return bookings.reduce(
    (total, booking) => total + Number(booking.amounts?.total || 0),
    0,
  );
}

export function buildOperatorDashboard(tours = [], bookings = [], now = new Date()) {
  const paid = bookings.filter(
    (booking) =>
      booking.paymentStatus === 'paid' && booking.status !== 'cancelled',
  );
  const refunded = bookings.filter(
    (booking) => booking.paymentStatus === 'refunded',
  );
  const gross = sumTotals(paid);
  const refundTotal = refunded.reduce(
    (total, booking) =>
      total + Number(booking.refundAmount || booking.amounts?.total || 0),
    0,
  );
  const earnings = gross - refundTotal;
  const travellers = bookings.reduce(
    (total, booking) => total + Number(booking.travelers?.total || 0),
    0,
  );
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthBookings = bookings.filter(
    (booking) =>
      booking.createdAtDate && booking.createdAtDate >= monthStart,
  );
  const monthPaid = paid.filter(
    (booking) =>
      booking.createdAtDate && booking.createdAtDate >= monthStart,
  );
  const monthEarnings = sumTotals(monthPaid);
  const monthTravellers = monthBookings.reduce(
    (total, booking) => total + Number(booking.travelers?.total || 0),
    0,
  );
  const weekEnd = new Date(now.getTime() + 7 * DAY_MS);
  const upcomingDepartures = new Set(
    bookings
      .filter(
        (booking) =>
          booking.departureStartAt &&
          booking.departureStartAt >= now &&
          booking.departureStartAt <= weekEnd,
      )
      .map((booking) => booking.departureId),
  ).size;
  const todayStart = startOfDay(now);
  const todayEarnings = sumTotals(
    paid.filter(
      (booking) =>
        booking.createdAtDate && booking.createdAtDate >= todayStart,
    ),
  );
  const publishedTours = tours.filter(
    (tour) => tour.status === 'published',
  );
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? 'Good morning, Operator'
      : hour < 18
        ? 'Good afternoon, Operator'
        : 'Good evening, Operator';
  const weekStart = startOfWeek(now);
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_MS);
    const next = new Date(date.getTime() + DAY_MS);
    const value = bookings.filter(
      (booking) =>
        booking.createdAtDate &&
        booking.createdAtDate >= date &&
        booking.createdAtDate < next,
    ).length;
    return { day, value };
  });
  const maxWeek = Math.max(1, ...week.map((day) => day.value));
  const peak = week.reduce(
    (best, day) => (day.value > best.value ? day : best),
    week[0],
  );

  return {
    welcome: {
      greeting,
      title: 'Your tours are moving.',
      summary: `${upcomingDepartures} departure${
        upcomingDepartures === 1 ? '' : 's'
      } this week · ${monthBookings.length} new booking${
        monthBookings.length === 1 ? '' : 's'
      } · ${formatMoney(todayEarnings, 'PHP')} earned today`,
    },
    kpis: [
      {
        id: 'earnings',
        label: 'Total earnings',
        value: formatMoney(earnings, 'PHP'),
        delta: `↑ ${formatMoney(monthEarnings, 'PHP')} this month`,
        tone: 'blue',
      },
      {
        id: 'reservations',
        label: 'Reservations',
        value: String(bookings.length),
        delta: `↑ ${monthBookings.length} new this month`,
        tone: 'green',
      },
      {
        id: 'travellers',
        label: 'Travellers',
        value: String(travellers),
        delta: `↑ ${monthTravellers} this month`,
        tone: 'amber',
      },
      {
        id: 'active',
        label: 'Active tours',
        value: String(publishedTours.length),
        delta: `${upcomingDepartures} departing soon`,
        tone: 'violet',
      },
    ],
    tours: publishedTours.slice(0, 4).map((tour, index) => ({
      id: tour.id,
      title: tour.title,
      seats: tour.duration || 'Open for booking',
      status: 'Published',
      tone: 'open',
      background: GRADIENTS[index % GRADIENTS.length],
    })),
    bookings: [...bookings]
      .sort(
        (first, second) =>
          (second.createdAtDate?.getTime() ?? 0) -
          (first.createdAtDate?.getTime() ?? 0),
      )
      .slice(0, 4)
      .map((booking) => ({
        id: booking.id,
        traveler:
          `${
            booking.travelerSnapshot?.firstName ?? ''
          } ${booking.travelerSnapshot?.lastName ?? ''}`.trim() ||
          'Traveler',
        tour: booking.tourSnapshot?.title ?? 'Tour',
        amount: formatMoney(
          booking.amounts?.total ?? 0,
          booking.amounts?.currency || 'PHP',
        ),
        status: capitalize(booking.status),
      })),
    week: week.map((day) => ({
      ...day,
      peak: day.value === maxWeek && maxWeek > 0,
    })),
    weekCaption:
      maxWeek > 0
        ? `Peak day: ${week.find((day) => day.value === maxWeek)?.day} · ${maxWeek} bookings`
        : 'No bookings this week yet',
    peakLabel: peak.day,
  };
}
