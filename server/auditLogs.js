import { getFirebaseServices } from './firebaseAdmin.js';

export async function writeAuditLog({
  actorId,
  actorRole = 'admin',
  action,
  targetType,
  targetId,
  summary,
}) {
  try {
    const { db, FieldValue } = getFirebaseServices();
    await db.collection('auditLogs').add({
      actorId,
      actorRole,
      action,
      targetType,
      targetId,
      summary,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Could not write audit log:', error);
  }
}
