import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDHN7y9e14KBeD0iSISjBpXXW8XGC1tjQo',
  authDomain: 'pili-website.firebaseapp.com',
  projectId: 'pili-website',
  storageBucket: 'pili-website.firebasestorage.app',
  messagingSenderId: '574576031282',
  appId: '1:574576031282:web:8a91a748c34a21f7846e2b',
};

const DEFAULT_MEETING_POINT = {
  name: 'PILI Travel Hub, Manila',
  address: 'Makiling St. San Rafael, Bulacan',
  lat: 14.95,
  lng: 120.96,
  source: 'manual',
};

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildDeparture(tour, daysFromNow) {
  const start = addDays(new Date(), daysFromNow);
  start.setHours(7, 0, 0, 0);

  const end = new Date(start);
  end.setHours(18, 0, 0, 0);

  const cutoff = addDays(start, -7);
  const meetingPoint =
    tour.meetingPoint &&
    Number.isFinite(Number(tour.meetingPoint.lat)) &&
    Number.isFinite(Number(tour.meetingPoint.lng))
      ? {
          name: tour.meetingPoint.name ?? DEFAULT_MEETING_POINT.name,
          address: tour.meetingPoint.address ?? DEFAULT_MEETING_POINT.address,
          lat: Number(tour.meetingPoint.lat),
          lng: Number(tour.meetingPoint.lng),
          source: tour.meetingPoint.source ?? 'manual',
        }
      : {
          ...DEFAULT_MEETING_POINT,
          name: tour.meetingPoint?.name ?? DEFAULT_MEETING_POINT.name,
          address:
            tour.meetingPoint?.address ?? DEFAULT_MEETING_POINT.address,
        };

  return {
    tourId: tour.id,
    operatorId: tour.operatorId,
    destinationId: tour.destinationId,
    startAt: Timestamp.fromDate(start),
    endAt: Timestamp.fromDate(end),
    meetingTime: '07:00',
    meetingPoint,
    cutoffAt: Timestamp.fromDate(cutoff),
    timezone: 'Asia/Manila',
    capacity: 20,
    bookedTravelers: 0,
    lastBookingId: null,
    status: 'scheduled',
    cancellationReason: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const toursSnapshot = await getDocs(
    query(collection(db, 'tours'), where('status', '==', 'published')),
  );
  let created = 0;

  for (const tourDoc of toursSnapshot.docs) {
    const tour = { id: tourDoc.id, ...tourDoc.data() };
    const existing = await getDocs(
      query(
        collection(db, 'departures'),
        where('tourId', '==', tour.id),
      ),
    );

    if (!existing.empty) {
      console.log(`Skipping ${tour.id}: departures already exist.`);
      continue;
    }

    for (const daysFromNow of [30, 60]) {
      await addDoc(
        collection(db, 'departures'),
        buildDeparture(tour, daysFromNow),
      );
      created += 1;
    }

    console.log(`Seeded 2 departures for ${tour.id}.`);
  }

  console.log(`Created ${created} departures.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
