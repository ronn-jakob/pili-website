import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';
import { logAdminAction } from './auditLogs';

export async function getAdminUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.users));

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
      createdAtDate: item.data().createdAt?.toDate?.() ?? null,
    }))
    .sort((first, second) =>
      `${first.firstName ?? ''} ${first.lastName ?? ''}`.localeCompare(
        `${second.firstName ?? ''} ${second.lastName ?? ''}`,
      ),
    );
}

export async function setAdminUserStatus(uid, status) {
  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    status,
    updatedAt: serverTimestamp(),
  });
  await logAdminAction({
    action: 'user.status',
    targetType: 'user',
    targetId: uid,
    summary: `Set traveler account status to ${status}.`,
  });
}
