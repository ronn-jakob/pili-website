import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './firestoreSchema';

export function travelerToForm(profile = {}) {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    nationality: profile.nationality ?? '',
    gender: profile.gender ?? '',
    language: profile.preferences?.language ?? 'English',
    mobile: profile.phone ?? '',
    alternatePhone: profile.alternatePhone ?? '',
    street: profile.address?.street ?? '',
    city: profile.address?.city ?? '',
    postalCode: profile.address?.postalCode ?? '',
    emergencyName: profile.emergencyContact?.name ?? '',
    emergencyRelationship: profile.emergencyContact?.relationship ?? '',
    emergencyPhone: profile.emergencyContact?.phone ?? '',
    photo: profile.photoURL ?? null,
  };
}

export function formToTravelerUpdates(form, currentProfile = {}) {
  const updates = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.mobile.trim(),
    alternatePhone: form.alternatePhone.trim(),
    dateOfBirth: form.dateOfBirth.trim(),
    nationality: form.nationality.trim(),
    gender: form.gender.trim(),
    address: {
      street: form.street.trim(),
      city: form.city.trim(),
      province: currentProfile.address?.province ?? '',
      postalCode: form.postalCode.trim(),
    },
    emergencyContact: {
      name: form.emergencyName.trim(),
      relationship: form.emergencyRelationship.trim(),
      phone: form.emergencyPhone.trim(),
    },
    preferences: {
      ...currentProfile.preferences,
      language: form.language,
      currency: currentProfile.preferences?.currency ?? 'PHP',
    },
    updatedAt: serverTimestamp(),
  };

  if (form.photo === null) {
    updates.photoURL = null;
  } else if (
    typeof form.photo === 'string' &&
    /^https?:\/\//i.test(form.photo)
  ) {
    updates.photoURL = form.photo;
  }

  return updates;
}

export async function updateTravelerProfile(uid, form, currentProfile) {
  await updateDoc(
    doc(db, COLLECTIONS.users, uid),
    formToTravelerUpdates(form, currentProfile),
  );
}
