import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import {
  fallbackLocation,
  itineraryLocations,
} from '../src/data/itineraryLocations.js';

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const firebaseConfig = {
  apiKey: 'AIzaSyDHN7y9e14KBeD0iSISjBpXXW8XGC1tjQo',
  authDomain: 'pili-website.firebaseapp.com',
  projectId: 'pili-website',
  storageBucket: 'pili-website.firebasestorage.app',
  messagingSenderId: '574576031282',
  appId: '1:574576031282:web:8a91a748c34a21f7846e2b',
};

const MAPTILER_KEY =
  process.env.VITE_MAPTILER_KEY || process.env.MAPTILER_KEY || '';
const DRY_RUN = process.argv.includes('--dry-run');
const FALLBACK_ONLY = process.argv.includes('--fallback-only');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function distanceKm(first, second) {
  const [lat1, lng1] = first;
  const [lat2, lng2] = second;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(entry) {
  if (!MAPTILER_KEY || FALLBACK_ONLY) {
    return fallbackLocation(entry);
  }

  const query = entry.query.toLowerCase().includes('philippines')
    ? entry.query
    : `${entry.query}, Philippines`;
  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
  );
  url.searchParams.set('key', MAPTILER_KEY);
  url.searchParams.set('limit', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('country', 'ph');
  url.searchParams.set('proximity', `${entry.fallback[1]},${entry.fallback[0]}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MapTiler returned ${response.status}`);
    }

    const data = await response.json();
    const feature = data.features?.[0];
    const [lng, lat] = feature?.geometry?.coordinates ?? [];

    if (
      !feature ||
      !Number.isFinite(Number(lat)) ||
      !Number.isFinite(Number(lng))
    ) {
      throw new Error('No geocoding result');
    }

    if (distanceKm(entry.fallback, [Number(lat), Number(lng)]) > 25) {
      throw new Error('Geocoding result was too far from the expected area');
    }

    return {
      name: entry.name || feature.text || entry.query,
      address: feature.place_name || entry.address,
      lat: Number(lat),
      lng: Number(lng),
      source: 'geocoded',
    };
  } catch (error) {
    console.warn(`Falling back for "${entry.query}": ${error.message}`);
    return fallbackLocation(entry);
  }
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const updates = [];

  for (const [tourId, entries] of Object.entries(itineraryLocations)) {
    const snapshot = await getDoc(doc(db, 'tours', tourId));

    if (!snapshot.exists()) {
      console.warn(`Skipping missing tour: ${tourId}`);
      continue;
    }

    const tour = snapshot.data();
    const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];

    if (itinerary.length !== entries.length) {
      console.warn(
        `Skipping ${tourId}: expected ${entries.length} days, found ${itinerary.length}`,
      );
      continue;
    }

    const nextItinerary = [];

    for (let index = 0; index < itinerary.length; index += 1) {
      const location = await geocode(entries[index]);

      nextItinerary.push({
        ...itinerary[index],
        location,
      });

      if (MAPTILER_KEY && !FALLBACK_ONLY) {
        await sleep(150);
      }
    }

    updates.push({ tourId, itinerary: nextItinerary });
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(updates, null, 2));
    console.log(
      `Dry run complete for ${updates.length} tours. No Firestore writes.`,
    );
    return;
  }

  for (const update of updates) {
    await updateDoc(doc(db, 'tours', update.tourId), {
      itinerary: update.itinerary,
    });
    console.log(`Updated itinerary locations: ${update.tourId}`);
  }

  console.log(`Backfilled ${updates.length} tours.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
