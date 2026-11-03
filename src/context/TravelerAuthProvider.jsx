import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/firestoreSchema';
import {
  loginTraveler,
  logoutTraveler,
  registerTraveler,
} from '../lib/travelerAuth';
import TravelerAuthContext from './TravelerAuthContext';

function TravelerAuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [traveler, setTraveler] = useState(null);
  const [operatorProfile, setOperatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let profileUnsubscribe = null;
    let operatorUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      profileUnsubscribe?.();
      operatorUnsubscribe?.();
      profileUnsubscribe = null;
      operatorUnsubscribe = null;

      if (!active) {
        return;
      }

      setFirebaseUser(user);

      if (!user) {
        setTraveler(null);
        setOperatorProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      profileUnsubscribe = onSnapshot(
        doc(db, COLLECTIONS.users, user.uid),
        (snapshot) => {
          if (!active) {
            return;
          }

          setTraveler(
            snapshot.exists()
              ? { uid: user.uid, ...snapshot.data() }
              : null,
          );
          setLoading(false);
        },
        () => {
          if (!active) {
            return;
          }

          setTraveler(null);
          setLoading(false);
        },
      );

      operatorUnsubscribe = onSnapshot(
        doc(db, COLLECTIONS.operators, user.uid),
        (snapshot) => {
          if (!active) {
            return;
          }

          setOperatorProfile(
            snapshot.exists()
              ? { uid: user.uid, ...snapshot.data() }
              : null,
          );
        },
        () => {
          if (active) {
            setOperatorProfile(null);
          }
        },
      );
    });

    return () => {
      active = false;
      profileUnsubscribe?.();
      operatorUnsubscribe?.();
      authUnsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const profile = await loginTraveler(credentials);
    setTraveler(profile);
    setLoading(false);
    return profile;
  }, []);

  const register = useCallback(async (details) => {
    const profile = await registerTraveler(details);
    setTraveler(profile);
    setLoading(false);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutTraveler();
    setTraveler(null);
    setOperatorProfile(null);
  }, []);

  const isOperator = Boolean(
    operatorProfile &&
      operatorProfile.status !== 'suspended' &&
      (operatorProfile.role === 'operator' ||
        operatorProfile.status === 'active'),
  );

  const value = useMemo(
    () => ({
      firebaseUser,
      traveler,
      operatorProfile,
      isOperator,
      loading,
      login,
      register,
      logout,
    }),
    [
      firebaseUser,
      traveler,
      operatorProfile,
      isOperator,
      loading,
      login,
      register,
      logout,
    ],
  );

  return (
    <TravelerAuthContext.Provider value={value}>
      {children}
    </TravelerAuthContext.Provider>
  );
}

export default TravelerAuthProvider;
