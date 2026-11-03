import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

export async function logAdminAction({
  action,
  targetType,
  targetId,
  summary,
}) {
  const actorId = auth.currentUser?.uid;

  if (!actorId) {
    return false;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.auditLogs), {
      actorId,
      actorRole: 'admin',
      action,
      targetType,
      targetId,
      summary,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Could not write audit log:', error);
    return false;
  }
}

export async function getRecentAuditLogs(limitCount = 8) {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.auditLogs),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ),
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
    createdAtDate: item.data().createdAt?.toDate?.() ?? null,
  }));
}
