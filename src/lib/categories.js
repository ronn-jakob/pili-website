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
import { CATEGORY_STATUS, COLLECTIONS } from './firestoreSchema';
import { db } from './firebase';

function mapCategory(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    status: data.status ?? CATEGORY_STATUS.active,
    sortOrder: data.sortOrder ?? 0,
  };
}

export async function getCategories() {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.categories), orderBy('sortOrder', 'asc')),
  );

  return snapshot.docs.map(mapCategory);
}

export async function getActiveCategories() {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.categories),
      where('status', '==', CATEGORY_STATUS.active),
    ),
  );

  return snapshot.docs
    .map(mapCategory)
    .sort(
      (first, second) =>
        first.sortOrder - second.sortOrder ||
        first.name.localeCompare(second.name),
    );
}

export async function isCategorySlugTaken(slug, excludeId) {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.categories),
      where('slug', '==', slug),
      limit(2),
    ),
  );

  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createCategory(values) {
  const reference = await addDoc(collection(db, COLLECTIONS.categories), {
    name: values.name,
    slug: values.slug,
    status: values.status,
    sortOrder: values.sortOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateCategory(id, values) {
  await updateDoc(doc(db, COLLECTIONS.categories, id), {
    name: values.name,
    slug: values.slug,
    status: values.status,
    sortOrder: values.sortOrder,
    updatedAt: serverTimestamp(),
  });
}

export async function setCategoryStatus(id, status) {
  await updateDoc(doc(db, COLLECTIONS.categories, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
