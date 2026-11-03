import { useCallback, useEffect, useState } from 'react';
import { getReviewableBookings } from '../lib/reviewable';

export default function useReviewableBookings(userId) {
  const [state, setState] = useState({
    userId: null,
    bookings: [],
    loading: true,
    error: '',
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let active = true;

    getReviewableBookings(userId)
      .then((items) => {
        if (active) {
          setState({
            userId,
            bookings: items,
            loading: false,
            error: '',
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            userId,
            bookings: [],
            loading: false,
            error: 'Could not load tours that need a review.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [userId, version]);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const current = state.userId === userId ? state : null;

  return {
    bookings: current?.bookings ?? [],
    count: current?.bookings.length ?? 0,
    loading: current?.loading ?? Boolean(userId),
    error: current?.error ?? '',
    refresh,
  };
}
