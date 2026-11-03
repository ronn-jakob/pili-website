import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

function createTravelerError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function travelerAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 8 characters.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-up is not enabled for this project.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'traveler/not-registered':
      return 'This account is not registered as a traveler. Use the traveler sign-up form first.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export async function registerTraveler({
  firstName,
  lastName,
  address,
  phone,
  email,
  password,
}) {
  const normalizedEmail = email.trim();
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  const profile = {
    email: normalizedEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    photoURL: null,
    address: {
      street: address.trim(),
      city: '',
      province: '',
      postalCode: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    preferences: {
      language: 'English',
      currency: 'PHP',
    },
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, COLLECTIONS.users, credential.user.uid), profile);
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch {
      await signOut(auth);
    }

    throw error;
  }

  return { uid: credential.user.uid, ...profile };
}

export async function loginTraveler({ email, password }) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  let snapshot;

  try {
    snapshot = await getDoc(
      doc(db, COLLECTIONS.users, credential.user.uid),
    );
  } catch (error) {
    await signOut(auth);
    throw error;
  }

  if (!snapshot.exists()) {
    await signOut(auth);
    throw createTravelerError(
      'traveler/not-registered',
      travelerAuthErrorMessage('traveler/not-registered'),
    );
  }

  return { uid: credential.user.uid, ...snapshot.data() };
}

export async function logoutTraveler() {
  await signOut(auth);
}
