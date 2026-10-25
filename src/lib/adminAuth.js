import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const ADMIN_EMAIL = 'admin@gmail.com';

export async function isAdminUser(user) {
  if (!user || user.email !== ADMIN_EMAIL) {
    return false;
  }

  try {
    const snapshot = await getDoc(doc(db, 'admins', user.uid));
    return snapshot.exists() && snapshot.data().role === 'admin';
  } catch {
    return false;
  }
}

export function adminLoginErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return 'Could not sign you in. Please try again.';
  }
}
