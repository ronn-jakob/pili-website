import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useTravelerAuth from './useTravelerAuth';
import WishlistContext from './WishlistContext';
import {
  addWishlistTour,
  removeWishlistTour,
  subscribeToWishlist,
  wishlistErrorMessage,
} from '../lib/wishlist';

function WishlistProvider({ children }) {
  const { traveler } = useTravelerAuth();
  const [state, setState] = useState({
    userId: null,
    ids: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!traveler) {
      return undefined;
    }

    let active = true;
    const unsubscribe = subscribeToWishlist(
      traveler.uid,
      (ids) => {
        if (active) {
          setState({
            userId: traveler.uid,
            ids,
            loading: false,
            error: '',
          });
        }
      },
      (error) => {
        if (active) {
          setState({
            userId: traveler.uid,
            ids: [],
            loading: false,
            error: wishlistErrorMessage(error),
          });
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [traveler]);

  const ids = useMemo(
    () => (state.userId === traveler?.uid ? state.ids : []),
    [state.userId, state.ids, traveler?.uid],
  );
  const idSet = useMemo(() => new Set(ids), [ids]);

  const isWishlisted = useCallback(
    (tourId) => idSet.has(tourId),
    [idSet],
  );

  const toggleWishlist = useCallback(
    async (tourId) => {
      if (!traveler || !tourId) {
        throw new Error('Sign in as a traveler to save tours.');
      }

      const wasWishlisted = idSet.has(tourId);

      setState((current) => {
        const currentIds =
          current.userId === traveler.uid ? current.ids : [];
        return {
          userId: traveler.uid,
          ids: wasWishlisted
            ? currentIds.filter((id) => id !== tourId)
            : [...currentIds, tourId],
          loading: false,
          error: '',
        };
      });

      try {
        if (wasWishlisted) {
          await removeWishlistTour(traveler.uid, tourId);
        } else {
          await addWishlistTour(traveler.uid, tourId);
        }
      } catch (error) {
        setState((current) => ({
          ...current,
          ids: wasWishlisted
            ? [...new Set([...current.ids, tourId])]
            : current.ids.filter((id) => id !== tourId),
          error: wishlistErrorMessage(error),
        }));
        throw error;
      }
    },
    [traveler, idSet],
  );

  const value = useMemo(
    () => ({
      wishlistIds: ids,
      isWishlisted,
      toggleWishlist,
      loading: state.userId === traveler?.uid ? state.loading : false,
      error: state.userId === traveler?.uid ? state.error : '',
    }),
    [
      ids,
      isWishlisted,
      toggleWishlist,
      state.userId,
      state.loading,
      state.error,
      traveler?.uid,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistProvider;
