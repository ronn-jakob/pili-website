import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

function wishlistCollection(userId) {
  return collection(db, COLLECTIONS.users, userId, 'wishlist');
}

export function subscribeToWishlist(userId, onIds, onError) {
  return onSnapshot(
    wishlistCollection(userId),
    (snapshot) => {
      onIds(snapshot.docs.map((item) => item.id));
    },
    onError,
  );
}

export async function addWishlistTour(userId, tourId) {
  await setDoc(
    doc(db, COLLECTIONS.users, userId, 'wishlist', tourId),
    {
      tourId,
      addedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function removeWishlistTour(userId, tourId) {
  await deleteDoc(
    doc(db, COLLECTIONS.users, userId, 'wishlist', tourId),
  );
}

export function wishlistErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to update your wishlist.';
    case 'unavailable':
      return 'Wishlist is unavailable. Check your connection and try again.';
    default:
      return error?.message || 'Could not update your wishlist.';
  }
}
