import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  Timestamp,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { seedDestinations } from '../src/data/destinations.js';
import {
  categoryIdFromName,
  seedCategories,
} from '../src/data/categories.js';
import {
  fallbackLocation,
  itineraryLocations,
} from '../src/data/itineraryLocations.js';
import { operatorTourPackages } from '../src/data/operatorTourPackages.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDHN7y9e14KBeD0iSISjBpXXW8XGC1tjQo',
  authDomain: 'pili-website.firebaseapp.com',
  projectId: 'pili-website',
  storageBucket: 'pili-website.firebasestorage.app',
  messagingSenderId: '574576031282',
  appId: '1:574576031282:web:8a91a748c34a21f7846e2b',
};

const SEED_OPERATOR_ID = '0whDtGFwIYYgWw6ccyCdVZl0sbq2';
const SEED_ADMIN_ID = 'RC4w2G2zOodp3m2xntJDnANRIio2';

const destinationByPackageId = {
  'boracay-island-escape': 'boracay',
  'enchanted-kingdom-day-pass': 'laguna',
  'mayon-volcano-adventure': 'albay',
  'coron-lagoons-tour': 'palawan',
  'cebu-whale-shark-canyoneering': 'cebu',
  'banaue-rice-terraces-trek': 'ifugao',
  'palawan-island-boat': 'palawan',
  'siargao-slow-days': 'siargao',
  'bohol-hills-sea': 'bohol',
};

const destinationByOperatorTourId = {
  'baguio-highlands-escape': 'baguio',
  'pagsanjan-falls-adventure': 'laguna',
  'batanes-discovery-tour': 'batanes',
  'vigan-heritage-walk': 'vigan',
  'cebu-island-hopping': 'cebu',
};

async function loadPublicPackages() {
  const sourcePath = path.resolve('src/data/packages.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transformed = source.replace(
    /^import\s+(\w+)\s+from\s+'([^']+)';$/gm,
    (_, name, assetPath) =>
      `const ${name} = ${JSON.stringify(`/src/${assetPath.replace('../', '')}`)};`,
  );
  const tempPath = path.join(
    os.tmpdir(),
    `pili-packages-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`,
  );

  fs.writeFileSync(tempPath, transformed, 'utf8');

  try {
    const module = await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);
    return module.allPackages;
  } finally {
    fs.unlinkSync(tempPath);
  }
}

function destinationRecord(destination, now) {
  return {
    name: destination.name,
    slug: destination.slug,
    region: destination.region,
    province: destination.province,
    description: destination.description,
    image: destination.image ? `/src/Images/${destination.image}` : '',
    status: destination.status,
    featured: destination.featured,
    sortOrder: destination.sortOrder,
    createdBy: SEED_ADMIN_ID,
    createdAt: now,
    updatedAt: now,
  };
}

function durationDaysFromLabel(label) {
  const match = /(\d+)\s*(?:d\b|day)/i.exec(label ?? '');
  return match ? Number(match[1]) : 1;
}

function locationForDay(tourId, index) {
  const entry = itineraryLocations[tourId]?.[index];
  return entry ? fallbackLocation(entry) : null;
}

function publicTourRecord(pkg, destination, now) {
  const adultPrice =
    pkg.currency === 'USD'
      ? Math.round(pkg.priceValue * 58)
      : pkg.priceValue;

  return {
    operatorId: SEED_OPERATOR_ID,
    destinationId: destination.id,
    destinationName: destination.name,
    title: pkg.title,
    slug: pkg.id,
    description: pkg.description,
    durationLabel: pkg.durationLabel,
    durationDays: durationDaysFromLabel(pkg.durationLabel),
    durationNights: Math.max(
      0,
      durationDaysFromLabel(pkg.durationLabel) - 1,
    ),
    categoryId: categoryIdFromName(pkg.category),
    category: pkg.category,
    meetingPoint: {
      name: 'PILI Travel Hub, Manila',
      address: 'Makiling St. San Rafael, Bulacan',
    },
    images: pkg.heroImage ? [pkg.heroImage] : [],
    inclusions: pkg.inclusions ?? [],
    exclusions: pkg.exclusions ?? [],
    rules: pkg.rules ?? [],
    itinerary: (pkg.itinerary ?? []).map((item, index) => ({
      day: index + 1,
      title: item.title,
      description: item.text,
      location: locationForDay(pkg.id, index),
    })),
    pricing: {
      adult: adultPrice,
      child: Math.round(adultPrice * 0.7),
      infant: 0,
      minGroupSize: 6,
      groupDiscountPercent: 8,
      taxesFeesMode: 'included',
    },
    discounts: {
      earlyBird: true,
      group: true,
      student: false,
      seniorPwd: true,
    },
    status: 'published',
    submittedAt: now,
    reviewedBy: SEED_ADMIN_ID,
    reviewedAt: now,
    rejectionReason: '',
    publishedAt: now,
    ratingAvg: Number(pkg.rating) || 0,
    reviewCount: pkg.reviewCount ?? 0,
    createdAt: now,
    updatedAt: now,
  };
}

function operatorTourRecord(tour, destination, now) {
  const status = tour.status === 'Published' ? 'published' : 'draft';

  return {
    operatorId: SEED_OPERATOR_ID,
    destinationId: destination.id,
    destinationName: destination.name,
    title: tour.title,
    slug: tour.id,
    description: tour.description,
    durationLabel: tour.duration,
    durationDays: durationDaysFromLabel(tour.duration),
    durationNights: Math.max(0, durationDaysFromLabel(tour.duration) - 1),
    categoryId: categoryIdFromName(tour.category),
    category: tour.category,
    meetingPoint: {
      name: tour.meetingPoint,
      address: '',
    },
    images: [],
    inclusions: [],
    exclusions: [],
    rules: [],
    itinerary: tour.itinerary.map((item, index) => ({
      day: item.day,
      title: `Day ${item.day}`,
      description: item.text,
      location: locationForDay(tour.id, index),
    })),
    pricing: {
      adult: tour.price,
      child: tour.childPrice,
      infant: tour.infantPrice,
      minGroupSize: tour.minGroupSize,
      groupDiscountPercent: tour.groupDiscount,
      taxesFeesMode: 'included',
    },
    discounts: tour.discounts,
    status,
    submittedAt: status === 'published' ? now : null,
    reviewedBy: status === 'published' ? SEED_ADMIN_ID : null,
    reviewedAt: status === 'published' ? now : null,
    rejectionReason: '',
    publishedAt: status === 'published' ? now : null,
    ratingAvg: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const now = Timestamp.now();
  const destinationsById = new Map(
    seedDestinations.map((destination) => [destination.id, destination]),
  );
  const destinationBatch = writeBatch(db);

  for (const destination of seedDestinations) {
    destinationBatch.set(
      doc(db, 'destinations', destination.id),
      destinationRecord(destination, now),
      { merge: true },
    );
  }

  await destinationBatch.commit();
  console.log(`Seeded ${seedDestinations.length} destinations.`);

  const categoryBatch = writeBatch(db);

  for (const category of seedCategories) {
    categoryBatch.set(
      doc(db, 'categories', category.id),
      {
        name: category.name,
        slug: category.id,
        status: 'active',
        sortOrder: category.sortOrder,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  await categoryBatch.commit();
  console.log(`Seeded ${seedCategories.length} categories.`);

  const publicPackages = await loadPublicPackages();
  const uniquePublicPackages = [
    ...new Map(publicPackages.map((pkg) => [pkg.id, pkg])).values(),
  ];
  const tourBatch = writeBatch(db);
  const tourIds = new Set();

  for (const pkg of uniquePublicPackages) {
    const destinationId = destinationByPackageId[pkg.id];
    const destination = destinationsById.get(destinationId);

    if (!destination) {
      throw new Error(`Missing destination mapping for package ${pkg.id}`);
    }

    tourBatch.set(
      doc(db, 'tours', pkg.id),
      publicTourRecord(pkg, destination, now),
      { merge: true },
    );
    tourIds.add(pkg.id);
  }

  for (const tour of operatorTourPackages) {
    const destinationId = destinationByOperatorTourId[tour.id];
    const destination = destinationsById.get(destinationId);

    if (!destination) {
      throw new Error(`Missing destination mapping for operator tour ${tour.id}`);
    }

    tourBatch.set(
      doc(db, 'tours', tour.id),
      operatorTourRecord(tour, destination, now),
      { merge: true },
    );
    tourIds.add(tour.id);
  }

  tourBatch.set(
    doc(db, 'settings', 'platform'),
    {
      currency: 'PHP',
      timezone: 'Asia/Manila',
      serviceFee: 500,
      taxesFeesMode: 'included',
      bookingHoldMinutes: 30,
      updatedAt: now,
    },
    { merge: true },
  );

  await tourBatch.commit();
  console.log(`Seeded ${tourIds.size} unified tours.`);
  console.log('Seeded settings/platform.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
