import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

const APPLICATION_FIELDS = [
  'businessName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'description',
];

function applicationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function getOperatorApplication(uid) {
  if (!uid) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, COLLECTIONS.operatorApplications, uid),
  );

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
}

export async function submitOperatorApplication(uid, values) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw applicationError(
      'operator-application/not-signed-in',
      'Sign in as a traveler to apply.',
    );
  }

  const existing = await getOperatorApplication(uid);

  if (existing?.status === 'approved') {
    throw applicationError(
      'operator-application/already-approved',
      'This account is already an approved operator.',
    );
  }

  if (existing?.status === 'pending') {
    throw applicationError(
      'operator-application/already-pending',
      'Your application is already waiting for review.',
    );
  }

  const payload = {
    businessName: values.businessName?.trim() ?? '',
    contactName: values.contactName?.trim() ?? '',
    contactEmail: values.contactEmail?.trim() ?? '',
    contactPhone: values.contactPhone?.trim() ?? '',
    description: values.description?.trim() ?? '',
    status: 'pending',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    reviewedBy: '',
    reviewedAt: null,
    rejectionReason: '',
  };

  if (!existing) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(
    doc(db, COLLECTIONS.operatorApplications, uid),
    payload,
    { merge: true },
  );

  return payload;
}

export function operatorApplicationErrorMessage(error) {
  switch (error?.code) {
    case 'operator-application/not-signed-in':
      return 'Sign in as a traveler to apply.';
    case 'operator-application/already-approved':
      return 'This account is already an approved operator.';
    case 'operator-application/already-pending':
      return 'Your application is already waiting for review.';
    case 'permission-denied':
      return 'You do not have permission to submit this application.';
    default:
      return (
        error?.message ||
        'Could not submit your application. Please try again.'
      );
  }
}

export function operatorApplicationFields(values = {}) {
  return Object.fromEntries(
    APPLICATION_FIELDS.map((field) => [field, values[field] ?? '']),
  );
}
