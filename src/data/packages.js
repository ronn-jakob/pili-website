import destinationsHero from '../Images/destinations-hero.png';
import palawanImage from '../Images/destinations/palawan.png';
import siargaoImage from '../Images/destinations/siargao.png';
import boholImage from '../Images/destinations/bohol.png';
import cebuImage from '../Images/destinations/cebu.png';
import banaueImage from '../Images/destinations/banaue.png';
import enchantedKingdomImage from '../Images/enchanted-kingdom.jpg';
import featuredPalawanImage from '../Images/packages/palawan-island-boat.png';
import featuredSiargaoImage from '../Images/packages/siargao-slow-days.png';
import featuredBoholImage from '../Images/packages/bohol-hills-sea.png';

const sharedGallery = [
  siargaoImage,
  palawanImage,
  boholImage,
  cebuImage,
  banaueImage,
  enchantedKingdomImage,
  boholImage,
];

const sharedReviews = [
  {
    quote:
      'Everything matched the listing. Pickup was on time and the guide knew the area well.',
    author: 'Mara S.',
    date: 'March 2026',
  },
  {
    quote: 'Clear inclusions and no surprise fees at checkout.',
    author: 'Joel R.',
    date: 'January 2026',
  },
  {
    quote:
      'A well-paced trip — enough free time without feeling rushed, and the transfers were seamless.',
    author: 'Ana L.',
    date: 'February 2026',
  },
];

const boracayReviews = [
  {
    quote:
      'The boat day was the whole trip. Our guide knew which cove to skip when the wind picked up.',
    author: 'Mara S.',
    date: 'March 2026',
  },
  {
    quote:
      'The hotel was actually on the beach, not a shuttle away. Transfers were waiting both ways.',
    author: 'Joel R.',
    date: 'January 2026',
  },
  {
    quote:
      'Clear on what was included. We booked two travelers and the total matched the page.',
    author: 'Ana L.',
    date: 'February 2026',
  },
];

const listingPackages = [
  {
    id: 'boracay-island-escape',
    title: 'Boracay Island Escape',
    location: 'Aklan, Philippines',
    shortPlace: 'Boracay',
    duration: '3D/2N',
    durationLabel: '3D / 2N',
    durationWords: '3 days',
    category: 'Beaches & Islands',
    rating: '4.8',
    reviewCount: 124,
    priceLabel: '₱12,900',
    priceValue: 12900,
    currency: 'PHP',
    serviceFee: 500,
    color: '#b8dbf0',
    listingSummary: 'Hotel, island hopping, transfers',
    heroImage: destinationsHero,
    description:
      'Spend three sun-filled days on Boracay’s world-famous White Beach. This package covers beachfront accommodation, round-trip transfers from Caticlan, and a guided island-hopping tour that stops at Puka Beach, Crocodile Island, and hidden coves. Enjoy free time to explore D’Mall, try local seafood, and catch the sunset with a cold drink in hand.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival in Caticlan, transfer to hotel, welcome drinks, and free evening at White Beach.',
        image: siargaoImage,
      },
      {
        title: 'Day 2',
        text: 'Island-hopping tour with lunch, snorkeling, and sunset sailing.',
        image: palawanImage,
      },
      {
        title: 'Day 3',
        text: 'Free morning, checkout, and transfer back to Caticlan.',
        image: boholImage,
      },
    ],
    inclusions: [
      '2 nights beachfront hotel accommodation',
      'Daily breakfast',
      'Round-trip Caticlan airport transfers',
      'Island-hopping tour with lunch',
      'Local English-speaking guide',
      'Travel insurance',
    ],
    exclusions: [
      'Airfare to and from Caticlan',
      'Meals and drinks not listed',
      'Optional water sports and activities',
      'Personal expenses and gratuities',
    ],
    rules: [
      'Valid government ID required at check-in',
      'Free cancellation up to 48 hours before departure',
      'Children 2–11 stay at 50% when sharing with two adults',
      'Itinerary may shift with weather or coast guard advisories',
    ],
    reviews: boracayReviews,
  },
  {
    id: 'enchanted-kingdom-day-pass',
    title: 'Enchanted Kingdom Day Pass',
    location: 'Laguna, Philippines',
    shortPlace: 'Laguna',
    duration: '1 Day',
    durationLabel: '1 Day',
    durationWords: '1 day',
    category: 'Theme Parks',
    rating: '4.6',
    reviewCount: 98,
    priceLabel: '₱1,850',
    priceValue: 1850,
    currency: 'PHP',
    serviceFee: 500,
    color: '#d9c7f0',
    listingSummary: 'Park ticket, round-trip shuttle',
    heroImage: enchantedKingdomImage,
    description:
      'A full day at Enchanted Kingdom with a park pass and round-trip shuttle from Metro Manila. Ride the classics, catch a live show, and let the shuttle handle the drive so you can stay until the closing fireworks.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Morning shuttle pickup, full-day park access, free time for rides and shows, evening return.',
        image: enchantedKingdomImage,
      },
    ],
    inclusions: [
      'Enchanted Kingdom day pass',
      'Round-trip shuttle from Metro Manila',
      'Access to regular rides and shows',
      'Local host on the shuttle',
    ],
    exclusions: [
      'Meals and snacks inside the park',
      'Express pass and premium attractions',
      'Personal expenses and souvenirs',
    ],
    rules: [
      'Valid ID required for shuttle boarding',
      'Children below 3 enter free',
      'Park rules and ride height restrictions apply',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'mayon-volcano-adventure',
    title: 'Mayon Volcano Adventure',
    location: 'Albay, Philippines',
    shortPlace: 'Legazpi',
    duration: '2D/1N',
    durationLabel: '2D / 1N',
    durationWords: '2 days',
    category: 'Mountains & Hiking',
    rating: '4.9',
    reviewCount: 76,
    priceLabel: '₱6,400',
    priceValue: 6400,
    currency: 'PHP',
    serviceFee: 500,
    color: '#f0d1c2',
    listingSummary: 'ATV tour, guide, breakfast',
    heroImage: banaueImage,
    description:
      'A short Legazpi escape built around Mayon Volcano. Ride an ATV along the lava trail with a local guide, catch the cone at sunrise, and warm up with a proper Bicol breakfast before heading home.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival and check-in, afternoon ATV lava trail with guide, free evening in Legazpi.',
        image: banaueImage,
      },
      {
        title: 'Day 2',
        text: 'Sunrise viewing, breakfast, checkout, and transfer to the airport.',
        image: destinationsHero,
      },
    ],
    inclusions: [
      '1 night hotel accommodation',
      'ATV tour with local guide',
      'Breakfast on day 2',
      'Round-trip airport transfers',
    ],
    exclusions: [
      'Airfare to Legazpi',
      'Lunch and dinner',
      'Travel insurance',
      'Personal expenses',
    ],
    rules: [
      'ATV drivers must be at least 18 years old',
      'Tours may be cancelled for volcanic activity',
      'Free cancellation up to 72 hours before departure',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'coron-lagoons-tour',
    title: 'Coron Lagoons Tour',
    location: 'Palawan, Philippines',
    shortPlace: 'Coron',
    duration: '4D/3N',
    durationLabel: '4D / 3N',
    durationWords: '4 days',
    category: 'Beaches & Islands',
    rating: '4.9',
    reviewCount: 210,
    priceLabel: '₱18,500',
    priceValue: 18500,
    currency: 'PHP',
    serviceFee: 500,
    color: '#c2e5d1',
    listingSummary: 'Hotel, boat tours, lunch',
    heroImage: palawanImage,
    description:
      'Four days in Coron with the boat days already sorted. Swim in Kayangan Lake, drift through Twin Lagoon, and spend a full day around Malcapuya and Banana Island, with hotel pickup and lunch on the water.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival in Busuanga, transfer to Coron town, check-in, free evening.',
        image: palawanImage,
      },
      {
        title: 'Day 2',
        text: 'Kayangan Lake, Twin Lagoon, Skeleton Wreck, and Siete Pecados with lunch.',
        image: siargaoImage,
      },
      {
        title: 'Day 3',
        text: 'Malcapuya and Banana Island boat day with lunch and beach time.',
        image: boholImage,
      },
      {
        title: 'Day 4',
        text: 'Breakfast, checkout, and transfer to Busuanga airport.',
        image: destinationsHero,
      },
    ],
    inclusions: [
      '3 nights hotel accommodation',
      'Daily breakfast',
      'Two guided boat tours with lunch',
      'Round-trip airport transfers',
      'Boat permits and environmental fees',
      'Local guide',
    ],
    exclusions: [
      'Airfare to Busuanga',
      'Dinner and drinks',
      'Rentals and underwater camera',
      'Personal expenses',
    ],
    rules: [
      'Valid ID required at hotel check-in',
      'Boat schedules depend on weather and coast guard clearance',
      'Free cancellation up to 72 hours before departure',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'cebu-whale-shark-canyoneering',
    title: 'Cebu Whale Shark & Canyoneering',
    location: 'Cebu, Philippines',
    shortPlace: 'Cebu',
    duration: '2D/1N',
    durationLabel: '2D / 1N',
    durationWords: '2 days',
    category: 'Beaches & Islands',
    rating: '4.7',
    reviewCount: 153,
    priceLabel: '₱7,800',
    priceValue: 7800,
    currency: 'PHP',
    serviceFee: 500,
    color: '#f0e0b8',
    listingSummary: 'Snorkeling, canyoneering, meals',
    heroImage: cebuImage,
    description:
      'An early start in Oslob for the whale sharks, then a canyoneering run through Badian’s turquoise gorges. Two days, all the logistics handled, and enough time left for a proper Cebu lechon dinner.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Early whale-shark snorkeling in Oslob, breakfast, then transfer to Badian.',
        image: cebuImage,
      },
      {
        title: 'Day 2',
        text: 'Canyoneering with guide and gear, lunch, return transfer to Cebu City.',
        image: boholImage,
      },
    ],
    inclusions: [
      '1 night accommodation',
      'Whale-shark snorkeling with guide',
      'Canyoneering with equipment',
      'Breakfast and lunch',
      'Round-trip transfers from Cebu City',
    ],
    exclusions: [
      'Airfare',
      'Dinner',
      'GoPro rental',
      'Personal expenses',
    ],
    rules: [
      'Whale-shark viewing follows local interaction rules',
      'Canyoneering requires basic swimming ability',
      'Free cancellation up to 48 hours before departure',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'banaue-rice-terraces-trek',
    title: 'Banaue Rice Terraces Trek',
    location: 'Ifugao, Philippines',
    shortPlace: 'Banaue',
    duration: '3D/2N',
    durationLabel: '3D / 2N',
    durationWords: '3 days',
    category: 'Mountains & Hiking',
    rating: '4.8',
    reviewCount: 61,
    priceLabel: '₱8,200',
    priceValue: 8200,
    currency: 'PHP',
    serviceFee: 500,
    color: '#c7d6f0',
    listingSummary: 'Guide, homestay, meals',
    heroImage: banaueImage,
    description:
      'Three days above the clouds in Banaue. Walk the rice terraces with a local guide, stay with a family in a village homestay, and take the mountain road slowly enough to actually enjoy it.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Overnight bus or morning arrival, check-in, Batad viewpoint and village walk.',
        image: banaueImage,
      },
      {
        title: 'Day 2',
        text: 'Full-day terraces trek with local guide, homestay dinner and overnight.',
        image: cebuImage,
      },
      {
        title: 'Day 3',
        text: 'Sunrise over the terraces, breakfast, return transfer to Banaue town.',
        image: enchantedKingdomImage,
      },
    ],
    inclusions: [
      '2 nights accommodation (1 homestay)',
      'Local guide for the terraces trek',
      'Daily breakfast and homestay dinner',
      'Round-trip transfers from Banaue town',
    ],
    exclusions: [
      'Transport to Banaue',
      'Lunch and extra meals',
      'Porter fees',
      'Personal expenses',
    ],
    rules: [
      'Moderate hiking fitness recommended',
      'Bring a light jacket for cool evenings',
      'Free cancellation up to 72 hours before departure',
    ],
    reviews: sharedReviews,
  },
];

const featuredPackages = [
  {
    id: 'palawan-island-boat',
    title: 'Palawan, by island boat',
    location: 'El Nido, Palawan',
    shortPlace: 'El Nido',
    duration: '4D/3N',
    durationLabel: '4 Days',
    durationWords: '4 days',
    category: 'Beaches & Islands',
    rating: '4.8',
    reviewCount: 214,
    priceLabel: '$318',
    priceValue: 318,
    currency: 'USD',
    serviceFee: 10,
    color: '#c2e5d1',
    listingSummary: 'Island boat, permits, meals',
    featuredImage: featuredPalawanImage,
    heroImage: palawanImage,
    description:
      'Four days moving between El Nido’s limestone islands by outrigger boat. Sleep in town, spend the days on the water, and let the crew handle permits, lunch, and the timing around the tides.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival in El Nido, check-in, sunset walk along Las Cabañas Beach.',
        image: palawanImage,
      },
      {
        title: 'Day 2',
        text: 'Tour A — Big Lagoon, Secret Lagoon, Shimizu Island, and Seven Commandos.',
        image: siargaoImage,
      },
      {
        title: 'Day 3',
        text: 'Tour C — Hidden Beach, Matinloc Shrine, and Helicopter Island.',
        image: boholImage,
      },
      {
        title: 'Day 4',
        text: 'Free morning, checkout, and transfer to El Nido airport.',
        image: destinationsHero,
      },
    ],
    inclusions: [
      '3 nights hotel accommodation',
      'Two island-hopping boat tours',
      'Lunch on boat days',
      'Boat permits and eco fees',
      'Local guide and boat crew',
    ],
    exclusions: [
      'Flights to El Nido',
      'Dinner and drinks',
      'Kayak and snorkel rentals',
      'Personal expenses',
    ],
    rules: [
      'Boat schedules depend on weather and coast guard clearance',
      'Bring reef-safe sunscreen',
      'Free cancellation up to 72 hours before departure',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'siargao-slow-days',
    title: 'Siargao slow days',
    location: 'General Luna, Siargao',
    shortPlace: 'General Luna',
    duration: '5D/4N',
    durationLabel: '5 Days',
    durationWords: '5 days',
    category: 'Beaches & Islands',
    rating: '4.7',
    reviewCount: 168,
    priceLabel: '$246',
    priceValue: 246,
    currency: 'USD',
    serviceFee: 10,
    color: '#b8dbf0',
    listingSummary: 'Hotel, island tour, scooter',
    featuredImage: featuredSiargaoImage,
    heroImage: siargaoImage,
    description:
      'Five unhurried days in General Luna. Surf in the morning, take the scooter to a different beach in the afternoon, and leave one day free for the islands — because the best parts of Siargao rarely run on schedule.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival and check-in, sunset at Cloud 9, free evening in General Luna.',
        image: siargaoImage,
      },
      {
        title: 'Day 2',
        text: 'Surf lesson or free surf, afternoon at Coconut Road and Secret Beach.',
        image: destinationsHero,
      },
      {
        title: 'Day 3',
        text: 'Island-hopping day — Naked Island, Daku Island, and Guyam Island.',
        image: palawanImage,
      },
      {
        title: 'Day 4',
        text: 'Free day with scooter; optional Sugba Lagoon or Magpupungko pools.',
        image: boholImage,
      },
      {
        title: 'Day 5',
        text: 'Breakfast, checkout, and transfer to Sayak airport.',
        image: cebuImage,
      },
    ],
    inclusions: [
      '4 nights hotel accommodation',
      'Daily breakfast',
      'Island-hopping tour with lunch',
      'Scooter rental for two days',
      'Airport transfers',
    ],
    exclusions: [
      'Flights to Siargao',
      'Surf lessons and board rental',
      'Dinner and drinks',
      'Personal expenses',
    ],
    rules: [
      'A valid driver’s licence is required for the scooter',
      'Island tours may shift with weather',
      'Free cancellation up to 72 hours before departure',
    ],
    reviews: sharedReviews,
  },
  {
    id: 'bohol-hills-sea',
    title: 'Bohol hills & sea',
    location: 'Panglao, Bohol',
    shortPlace: 'Panglao',
    duration: '3D/2N',
    durationLabel: '3 Days',
    durationWords: '3 days',
    category: 'Culture & Heritage',
    rating: '4.8',
    reviewCount: 132,
    priceLabel: '$189',
    priceValue: 189,
    currency: 'USD',
    serviceFee: 10,
    color: '#f0e0b8',
    listingSummary: 'Hotel, countryside tour, transfers',
    featuredImage: featuredBoholImage,
    heroImage: boholImage,
    description:
      'Three days that cover both sides of Bohol: the Chocolate Hills and tarsier sanctuary in the hills, then a slower afternoon on Panglao’s sand. A compact loop with the driving handled.',
    itinerary: [
      {
        title: 'Day 1',
        text: 'Arrival in Panglao, check-in, free afternoon at Alona Beach.',
        image: boholImage,
      },
      {
        title: 'Day 2',
        text: 'Countryside tour — Chocolate Hills, tarsier sanctuary, man-made forest, and Loboc River.',
        image: banaueImage,
      },
      {
        title: 'Day 3',
        text: 'Breakfast, checkout, and transfer to Bohol–Panglao airport.',
        image: destinationsHero,
      },
    ],
    inclusions: [
      '2 nights hotel accommodation',
      'Daily breakfast',
      'Bohol countryside tour with guide',
      'Loboc River lunch cruise',
      'Round-trip airport transfers',
    ],
    exclusions: [
      'Flights to Bohol',
      'Dinner and drinks',
      'Optional diving or island trips',
      'Personal expenses',
    ],
    rules: [
      'Tarsier sanctuary rules apply (no flash, no touching)',
      'Tour order may change with traffic and weather',
      'Free cancellation up to 48 hours before departure',
    ],
    reviews: sharedReviews,
  },
];

const cancellationHoursById = {
  'boracay-island-escape': 48,
  'enchanted-kingdom-day-pass': 24,
  'mayon-volcano-adventure': 72,
  'coron-lagoons-tour': 72,
  'cebu-whale-shark-canyoneering': 48,
  'banaue-rice-terraces-trek': 72,
  'palawan-island-boat': 72,
  'siargao-slow-days': 72,
  'bohol-hills-sea': 48,
};

// All detail pages share one gallery until per-package photography exists.
for (const pkg of [...listingPackages, ...featuredPackages]) {
  pkg.gallery = sharedGallery;
  pkg.cancellationHours = cancellationHoursById[pkg.id] ?? 48;
}

export { listingPackages, featuredPackages };

export const allPackages = [...listingPackages, ...featuredPackages];

export function getPackageById(id) {
  return allPackages.find((pkg) => pkg.id === id);
}
