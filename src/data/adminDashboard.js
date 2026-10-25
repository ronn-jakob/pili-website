export const adminStats = [
  {
    id: 'users',
    label: 'Total Users',
    value: '12,480',
    delta: '+8.2% this month',
    tone: 'dark',
  },
  {
    id: 'operators',
    label: 'Active Operators',
    value: '86',
    delta: '+4 new this month',
    tone: 'green',
  },
  {
    id: 'tours',
    label: 'Live Tours',
    value: '214',
    delta: '12 pending approval',
    tone: 'blue',
  },
  {
    id: 'reservations',
    label: 'Reservations',
    value: '3,964',
    delta: '+11.4% vs last month',
    tone: 'violet',
  },
];

export const bookingBars = [
  { month: 'May', value: 45, height: 28 },
  { month: 'Jun', value: 62, height: 40 },
  { month: 'Jul', value: 55, height: 34 },
  { month: 'Aug', value: 88, height: 55 },
  { month: 'Sep', value: 105, height: 65 },
  { month: 'Oct', value: 149, height: 84 },
];

export const pendingActions = [
  { id: 'applications', label: 'Operator applications', count: 7, tone: 'amber' },
  {
    id: 'packages',
    label: 'Tour packages for review',
    count: 12,
    tone: 'amber',
  },
  { id: 'refunds', label: 'Refund requests', count: 9, tone: 'amber' },
  { id: 'reviews', label: 'Reported reviews', count: 5, tone: 'red' },
];

export const recentReservations = [
  {
    id: '#PL-2041',
    traveler: 'Maria Reyes',
    tour: 'Boracay Island Hopping',
    date: 'Oct 21, 2026',
    amount: '₱12,900',
    status: 'Confirmed',
  },
  {
    id: '#PL-2040',
    traveler: 'John Cruz',
    tour: 'Palawan Island Escape',
    date: 'Oct 21, 2026',
    amount: '₱18,500',
    status: 'Pending',
  },
  {
    id: '#PL-2039',
    traveler: 'Ana Santos',
    tour: 'Siargao Surf Trip',
    date: 'Oct 20, 2026',
    amount: '₱9,750',
    status: 'Confirmed',
  },
  {
    id: '#PL-2038',
    traveler: 'Paolo Dizon',
    tour: 'Cebu Canyonering',
    date: 'Oct 20, 2026',
    amount: '₱6,300',
    status: 'Cancelled',
  },
];
