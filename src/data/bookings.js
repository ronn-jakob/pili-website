import palawanImage from '../Images/destinations/palawan.png';
import siargaoImage from '../Images/destinations/siargao.png';
import boholImage from '../Images/destinations/bohol.png';
import cebuImage from '../Images/destinations/cebu.png';

export const bookings = [
  {
    id: 'pili-2026-08421',
    reference: 'PILI-2026-08421',
    status: 'Confirmed',
    title: 'Palawan Island Hopping',
    location: 'El Nido & Coron, Palawan',
    image: palawanImage,
    priceValue: 12900,
    priceLabel: '₱12,900',
    checkIn: 'Mar 12, 2026',
    checkOut: 'Mar 15, 2026',
    duration: '4 days / 3 nights',
    guests: '2 adults',
    meetingPoint: 'El Nido Town Proper, 7:00 AM',
    includes: 'Boat transfers, lunch, island fees, guide',
    policy: 'Free cancellation until 7 days before departure',
    paymentStatus: 'Paid in full',
    paymentTone: 'paid',
    paymentMethod: 'GCash · Mar 1, 2026',
    remaining: '₱0 remaining',
    canRequestChange: true,
    canCancel: true,
  },
  {
    id: 'pili-2026-09103',
    reference: 'PILI-2026-09103',
    status: 'Pending',
    title: 'Siargao Surf & Chill',
    location: 'General Luna, Siargao',
    image: siargaoImage,
    priceValue: 15500,
    priceLabel: '₱15,500',
    checkIn: 'Apr 2, 2026',
    checkOut: 'Apr 6, 2026',
    duration: '5 days / 4 nights',
    guests: '1 adult',
    meetingPoint: 'Cloud 9 Boardwalk, 8:30 AM',
    includes: 'Surf lessons, board rental, hostel stay, breakfast',
    policy: '50% refund if cancelled 14+ days before',
    paymentStatus: 'Deposit paid',
    paymentTone: 'deposit',
    paymentMethod: 'Card · Mar 18, 2026',
    remaining: '₱7,750 remaining',
    canRequestChange: true,
    canCancel: true,
  },
  {
    id: 'pili-2026-05217',
    reference: 'PILI-2026-05217',
    status: 'Completed',
    title: 'Bohol Countryside Tour',
    location: 'Panglao, Bohol',
    image: boholImage,
    priceValue: 8700,
    priceLabel: '₱8,700',
    checkIn: 'Jan 18, 2026',
    checkOut: 'Jan 20, 2026',
    duration: '3 days / 2 nights',
    guests: '2 adults, 1 child',
    meetingPoint: 'Panglao Airport transfer, 9:00 AM',
    includes: 'Chocolate Hills, tarsier sanctuary, river cruise, meals',
    policy: 'Trip completed — feedback available',
    paymentStatus: 'Paid in full',
    paymentTone: 'paid',
    paymentMethod: 'Maya · Jan 5, 2026',
    remaining: '₱0 remaining',
    canRequestChange: false,
    canCancel: false,
  },
  {
    id: 'pili-2026-06744',
    reference: 'PILI-2026-06744',
    status: 'Cancelled',
    title: 'Cebu City Heritage Day',
    location: 'Cebu City',
    image: cebuImage,
    priceValue: 2400,
    priceLabel: '₱2,400',
    checkIn: 'Feb 8, 2026',
    checkOut: 'Feb 8, 2026',
    duration: '1 day',
    guests: '2 adults',
    meetingPoint: 'Basilica del Santo Niño, 8:00 AM',
    includes: 'Guided walking tour, entrance fees, lunch',
    policy: 'Cancelled by guest · full refund within 5–7 days',
    paymentStatus: 'Refunded',
    paymentTone: 'refunded',
    paymentMethod: 'Refunded to card · Feb 2, 2026',
    remaining: 'Full refund processed',
    canRequestChange: false,
    canCancel: false,
  },
];

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
