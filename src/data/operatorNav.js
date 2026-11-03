export const operatorNav = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/operator',
    end: true,
    available: true,
  },
  {
    id: 'tours',
    label: 'My Tours',
    icon: 'destinations',
    to: '/operator/tours',
    available: true,
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: 'reservations',
    to: '/operator/reservations',
    available: true,
  },
  {
    id: 'operations',
    label: 'Tour Operations',
    icon: 'packages',
    available: false,
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    icon: 'reviews',
    to: '/operator/reviews',
    available: true,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: 'reports',
    to: '/operator/reports',
    available: true,
  },
];
