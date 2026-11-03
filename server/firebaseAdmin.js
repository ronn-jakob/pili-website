import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!accountPath) {
    return null;
  }

  const resolvedPath = path.isAbsolute(accountPath)
    ? accountPath
    : path.resolve(serverDirectory, accountPath);

  return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
}

export function hasFirebaseCredentials() {
  try {
    return Boolean(readServiceAccount());
  } catch {
    return false;
  }
}

export function getFirebaseServices() {
  if (getApps().length === 0) {
    const serviceAccount = readServiceAccount();

    if (!serviceAccount) {
      throw new Error(
        'Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT.',
      );
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
    FieldValue,
    Timestamp,
  };
}
