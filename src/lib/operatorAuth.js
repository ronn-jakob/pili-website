import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const OPERATOR_EMAIL = 'operator@gmail.com';

export async function isOperatorUser(user) {
  if (!user || user.email !== OPERATOR_EMAIL) {
    return false;
  }

  try {
    const snapshot = await getDoc(doc(db, 'operators', user.uid));
    return snapshot.exists() && snapshot.data().role === 'operator';
  } catch {
    return false;
  }
}

export function operatorLoginErrorMessage(code) {
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
