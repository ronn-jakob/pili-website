import { collection, getDocs, query, where } from 'firebase/firestore';
import fallbackImage from '../Images/destinations-hero.png';
import aklanImage from '../Images/aklan.jpg';
import banaueImage from '../Images/destinations/banaue.png';
import boholImage from '../Images/destinations/bohol.png';
import cebuImage from '../Images/destinations/cebu.png';
import palawanImage from '../Images/destinations/palawan.png';
import siargaoImage from '../Images/destinations/siargao.png';
import enchantedKingdomImage from '../Images/enchanted-kingdom.jpg';
import { seedCategories } from '../data/categories';
import { getPackageById } from '../data/packages';
import { seedDestinations } from '../data/destinations';
import { db } from './firebase';
import {
  COLLECTIONS,
  DESTINATION_STATUS,
  TOUR_STATUS,
} from './firestoreSchema';
import { formatMoney } from '../utils/booking';

const destinationImages = {
  boracay: aklanImage,
  palawan: palawanImage,
  siargao: siargaoImage,
  bohol: boholImage,
  cebu: cebuImage,
  ifugao: banaueImage,
  baguio: banaueImage,
  laguna: enchantedKingdomImage,
  albay: fallbackImage,
  batanes: fallbackImage,
  vigan: fallbackImage,
};

const categoryNameByLower = new Map(
  seedCategories.map((category) => [category.name.toLowerCase(), category.name]),
);

function canonicalCategory(name) {
  return categoryNameByLower.get((name ?? '').toLowerCase()) ?? name;
}

export function mapTourToPackage(tour) {
  const staticPkg = getPackageById(tour.id);
  const heroImage =
    tour.photos[0] || staticPkg?.heroImage || fallbackImage;
  const duration = tour.duration || staticPkg?.durationLabel || 'Flexible';
  const itinerary = (
    tour.itinerary.length ? tour.itinerary : staticPkg?.itinerary ?? []
  ).map((day, index) => ({
    title: day.title || `Day ${day.day ?? index + 1}`,
    text: day.text ?? day.description ?? '',
    image: staticPkg?.itinerary?.[index]?.image ?? null,
    location: day.location ?? null,
  }));

  return {
    ...(staticPkg ?? {}),
    id: tour.id,
    title: tour.title || staticPkg?.title || 'Untitled tour',
    destinationId: tour.destinationId || '',
    destinationName: tour.destinationName || '',
    description: tour.description || staticPkg?.description || '',
    location: staticPkg?.location || tour.destinationName || 'Philippines',
    shortPlace:
      staticPkg?.shortPlace || tour.destinationName || 'Philippines',
    duration,
    durationLabel: duration,
    durationWords: duration,
    durationDays: tour.durationDays || 1,
    category: canonicalCategory(
      tour.category || staticPkg?.category || 'Tour',
    ),
    rating: staticPkg?.rating || '0.0',
    reviewCount: staticPkg?.reviewCount || 0,
    priceLabel: formatMoney(tour.price, 'PHP'),
    priceValue: tour.price,
    currency: 'PHP',
    serviceFee: staticPkg?.serviceFee ?? 500,
    color: staticPkg?.color || '#dbeafe',
    listingSummary:
      staticPkg?.listingSummary ||
      [duration, tour.category].filter(Boolean).join(' · '),
    heroImage,
    featuredImage: heroImage,
    gallery: tour.photos.length
      ? tour.photos
      : staticPkg?.gallery ?? [heroImage],
    itinerary,
    inclusions: tour.inclusions.length
      ? tour.inclusions
      : staticPkg?.inclusions ?? [],
    exclusions: tour.exclusions.length
      ? tour.exclusions
      : staticPkg?.exclusions ?? [],
    rules: tour.rules.length ? tour.rules : staticPkg?.rules ?? [],
    reviews: staticPkg?.reviews ?? [],
    cancellationHours: staticPkg?.cancellationHours ?? 48,
    featured: Boolean(staticPkg?.featured),
    isStaticPackage: Boolean(staticPkg),
  };
}

export async function getPublicPackages() {
  const [destinationsSnapshot, toursSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, COLLECTIONS.destinations),
        where('status', '==', DESTINATION_STATUS.active),
      ),
    ),
    getDocs(
      query(
        collection(db, COLLECTIONS.tours),
        where('status', '==', TOUR_STATUS.published),
      ),
    ),
  ]);
  const activeDestinationIds = new Set(
    destinationsSnapshot.docs.map((snapshot) => snapshot.id),
  );

  return toursSnapshot.docs
    .map((snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        ...data,
        photos: Array.isArray(data.images) ? data.images : [],
        inclusions: Array.isArray(data.inclusions) ? data.inclusions : [],
        exclusions: Array.isArray(data.exclusions) ? data.exclusions : [],
        rules: Array.isArray(data.rules) ? data.rules : [],
        itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
        duration: data.durationLabel ?? '',
        durationDays: Number(data.durationDays) || 1,
        price: Number(data.pricing?.adult) || 0,
      };
    })
    .filter((tour) => activeDestinationIds.has(tour.destinationId))
    .map(mapTourToPackage)
    .sort((first, second) => first.title.localeCompare(second.title));
}

export async function getPublicDestinations() {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.destinations),
      where('status', '==', DESTINATION_STATUS.active),
    ),
  );

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      const staticDestination = seedDestinations.find(
        (destination) => destination.id === item.id,
      );
      const image =
        data.image?.startsWith('http')
          ? data.image
          : destinationImages[item.id] || fallbackImage;

      return {
        id: item.id,
        name: data.name ?? staticDestination?.name ?? '',
        slug: data.slug ?? staticDestination?.slug ?? '',
        region: data.region ?? staticDestination?.region ?? '',
        province: data.province ?? staticDestination?.province ?? '',
        description:
          data.description ?? staticDestination?.description ?? '',
        image,
        featured: Boolean(data.featured),
        sortOrder: Number(data.sortOrder) || 0,
      };
    })
    .sort(
      (first, second) =>
        first.sortOrder - second.sortOrder ||
        first.name.localeCompare(second.name),
    );
}
