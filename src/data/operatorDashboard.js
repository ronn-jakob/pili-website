export const operatorWelcome = {
  greeting: 'Good afternoon, Operator',
  title: 'Your tours are moving.',
  summary: '3 departures this week · 12 new bookings · ₱18,400 earned today',
};

export const operatorKpis = [
  {
    id: 'earnings',
    label: 'Total earnings',
    value: '₱128,450',
    delta: '↑ 8.2% this month',
    tone: 'blue',
  },
  {
    id: 'reservations',
    label: 'Reservations',
    value: '86',
    delta: '↑ 12 new this month',
    tone: 'green',
  },
  {
    id: 'travellers',
    label: 'Travellers',
    value: '214',
    delta: '↑ 15 this month',
    tone: 'amber',
  },
  {
    id: 'active',
    label: 'Active tours',
    value: '12',
    delta: '3 departing soon',
    tone: 'violet',
  },
];

export const operatorTours = [
  {
    id: 'palawan',
    title: 'Palawan Island Hopping',
    seats: '14 seats left',
    status: 'Selling fast',
    tone: 'fast',
    background: 'linear-gradient(135deg, #2f7f8f 0%, #5aa6a0 100%)',
  },
  {
    id: 'siargao',
    title: 'Siargao Surf Weekend',
    seats: '8 seats left',
    status: 'Popular',
    tone: 'popular',
    background: 'linear-gradient(135deg, #2d7777 0%, #4f9a86 100%)',
  },
  {
    id: 'bohol',
    title: 'Bohol Countryside',
    seats: '20 seats left',
    status: 'Open',
    tone: 'open',
    background: 'linear-gradient(135deg, #4f7f4f 0%, #7d9e5a 100%)',
  },
  {
    id: 'baguio',
    title: 'Baguio Highlands',
    seats: '4 seats left',
    status: 'Almost full',
    tone: 'almost',
    background: 'linear-gradient(135deg, #5f5877 0%, #8478a0 100%)',
  },
];

export const operatorBookings = [
  {
    id: 'maria',
    traveler: 'Maria Reyes',
    tour: 'Palawan Island Hopping',
    amount: '₱12,900',
    status: 'Confirmed',
  },
  {
    id: 'james',
    traveler: 'James Cruz',
    tour: 'Siargao Surf Weekend',
    amount: '₱15,500',
    status: 'Pending',
  },
  {
    id: 'ana',
    traveler: 'Ana Santos',
    tour: 'Bohol Countryside',
    amount: '₱8,700',
    status: 'Confirmed',
  },
  {
    id: 'carlo',
    traveler: 'Carlo Lim',
    tour: 'Baguio Highlands',
    amount: '₱6,800',
    status: 'Confirmed',
  },
];

export const operatorWeek = [
  { day: 'M', value: 50 },
  { day: 'T', value: 80 },
  { day: 'W', value: 65 },
  { day: 'T', value: 100 },
  { day: 'F', value: 70 },
  { day: 'S', value: 130, peak: true },
  { day: 'S', value: 90 },
];
