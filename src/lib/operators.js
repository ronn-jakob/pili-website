import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';
import { logAdminAction } from './auditLogs';
import { createNotification } from './notifications';

function toMillis(value) {
  return value?.toMillis?.() ?? 0;
}

function mapApplication(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    submittedAtMs: toMillis(data.submittedAt),
    reviewedAtMs: toMillis(data.reviewedAt),
  };
}

function mapOperator(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    joinedAtMs: toMillis(data.joinedAt),
  };
}

export async function getOperatorApplications() {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.operatorApplications),
  );

  return snapshot.docs
    .map(mapApplication)
    .sort(
      (first, second) =>
        second.submittedAtMs - first.submittedAtMs ||
        first.businessName.localeCompare(second.businessName),
    );
}

export async function getOperators() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.operators));

  return snapshot.docs
    .map(mapOperator)
    .sort((first, second) =>
      (first.businessName || first.email || '').localeCompare(
        second.businessName || second.email || '',
      ),
    );
}

export async function approveOperatorApplication(
  applicationId,
  adminUid,
) {
  const applicationRef = doc(
    db,
    COLLECTIONS.operatorApplications,
    applicationId,
  );
  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists) {
    throw new Error('That operator application no longer exists.');
  }

  const application = snapshot.data();

  if (application.status === 'approved') {
    throw new Error('That application is already approved.');
  }

  const operatorRef = doc(db, COLLECTIONS.operators, applicationId);
  const batch = writeBatch(db);

  batch.update(applicationRef, {
    status: 'approved',
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    rejectionReason: '',
    updatedAt: serverTimestamp(),
  });
  batch.set(
    operatorRef,
    {
      role: 'operator',
      status: 'active',
      businessName: application.businessName ?? '',
      contactName: application.contactName ?? '',
      email: application.contactEmail ?? '',
      phone: application.contactPhone ?? '',
      description: application.description ?? '',
      approvedBy: adminUid,
      approvedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  await logAdminAction({
    action: 'operator.approve',
    targetType: 'operatorApplication',
    targetId: applicationId,
    summary: `Approved operator application for ${
      application.businessName || applicationId
    }.`,
  });

  try {
    await createNotification({
      id: `operator-approved-${applicationId}`,
      userId: applicationId,
      role: 'traveler',
      type: 'operator_approved',
      title: 'Operator application approved',
      message:
        'Your operator account is active. You can open the operator dashboard with the same account.',
      link: '/operator',
    });
  } catch {
    // The approval is complete even if the notification fails.
  }
}

export async function rejectOperatorApplication(
  applicationId,
  reason,
  adminUid,
) {
  const applicationRef = doc(
    db,
    COLLECTIONS.operatorApplications,
    applicationId,
  );
  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists) {
    throw new Error('That operator application no longer exists.');
  }

  const application = snapshot.data();
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new Error('Enter a reason for rejecting the application.');
  }

  await updateDoc(applicationRef, {
    status: 'rejected',
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    rejectionReason: trimmedReason,
    updatedAt: serverTimestamp(),
  });

  await logAdminAction({
    action: 'operator.reject',
    targetType: 'operatorApplication',
    targetId: applicationId,
    summary: `Rejected operator application for ${
      application.businessName || applicationId
    }: ${trimmedReason}`,
  });

  try {
    await createNotification({
      id: `operator-rejected-${applicationId}-${
        application.submittedAt?.toMillis?.() ?? Date.now()
      }`,
      userId: applicationId,
      role: 'traveler',
      type: 'operator_rejected',
      title: 'Operator application rejected',
      message: trimmedReason,
      link: '/settings#operator-application',
    });
  } catch {
    // The rejection is complete even if the notification fails.
  }
}

export async function setOperatorSuspended(operatorId, suspended) {
  await updateDoc(doc(db, COLLECTIONS.operators, operatorId), {
    status: suspended ? 'suspended' : 'active',
    updatedAt: serverTimestamp(),
  });
  await logAdminAction({
    action: suspended ? 'operator.suspend' : 'operator.reactivate',
    targetType: 'operator',
    targetId: operatorId,
    summary: `${
      suspended ? 'Suspended' : 'Reactivated'
    } operator account ${operatorId}.`,
  });
}

export function operatorAdminErrorMessage(error) {
  switch (error?.code) {
    case 'permission-denied':
      return 'You do not have permission to manage operators.';
    default:
      return error?.message || 'Could not update this operator.';
  }
}
