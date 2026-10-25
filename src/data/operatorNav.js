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
    available: false,
  },
  {
    id: 'operations',
    label: 'Tour Operations',
    icon: 'packages',
    available: false,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: 'reports',
    available: false,
  },
];
