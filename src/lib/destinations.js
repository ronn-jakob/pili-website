import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

function mapDestination(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    region: data.region ?? '',
    province: data.province ?? '',
    description: data.description ?? '',
    image: data.image ?? '',
    imagePublicId: data.imagePublicId ?? '',
    imageProvider: data.imageProvider ?? '',
    status: data.status ?? 'active',
    featured: Boolean(data.featured),
    sortOrder: data.sortOrder ?? 0,
    createdBy: data.createdBy ?? '',
  };
}

export async function getDestinations() {
  const snapshot = await getDocs(
    query(collection(db, 'destinations'), orderBy('sortOrder', 'asc')),
  );

  return snapshot.docs.map(mapDestination);
}

export async function getTourCounts() {
  const snapshot = await getDocs(collection(db, 'tours'));
  const counts = {};

  for (const tour of snapshot.docs) {
    const destinationId = tour.data().destinationId;
    counts[destinationId] = (counts[destinationId] ?? 0) + 1;
  }

  return counts;
}

export async function isDestinationSlugTaken(slug, excludeId) {
  const snapshot = await getDocs(
    query(
      collection(db, 'destinations'),
      where('slug', '==', slug),
      limit(2),
    ),
  );

  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createDestination(values) {
  const payload = {
    name: values.name,
    slug: values.slug,
    region: values.region,
    province: values.province,
    description: values.description,
    image: values.image,
    imagePublicId: values.imagePublicId ?? '',
    imageProvider: values.imageProvider ?? '',
    status: values.status,
    featured: values.featured,
    sortOrder: values.sortOrder,
    createdBy: auth.currentUser?.uid ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const reference = await addDoc(collection(db, 'destinations'), payload);
  return reference.id;
}

export async function updateDestination(id, values) {
  await updateDoc(doc(db, 'destinations', id), {
    name: values.name,
    slug: values.slug,
    region: values.region,
    province: values.province,
    description: values.description,
    image: values.image,
    imagePublicId: values.imagePublicId ?? '',
    imageProvider: values.imageProvider ?? '',
    status: values.status,
    featured: values.featured,
    sortOrder: values.sortOrder,
    updatedAt: serverTimestamp(),
  });
}

export async function setDestinationStatus(id, status) {
  await updateDoc(doc(db, 'destinations', id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
