import { useEffect, useMemo, useState } from 'react';
import { OperatorToursContext } from './OperatorToursContext';
import {
  subscribeOperatorTours,
  tourErrorMessage,
} from '../lib/tours';

export function OperatorToursProvider({ operatorId, children }) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!operatorId) {
      return undefined;
    }

    const unsubscribe = subscribeOperatorTours(
      operatorId,
      (nextTours) => {
        setTours(nextTours);
        setLoading(false);
      },
      (snapshotError) => {
        setError(tourErrorMessage(snapshotError));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [operatorId]);

  const value = useMemo(
    () => ({
      tours,
      loading,
      error,
      getTour: (id) => tours.find((tour) => tour.id === id),
    }),
    [tours, loading, error],
  );

  return (
    <OperatorToursContext.Provider value={value}>
      {children}
    </OperatorToursContext.Provider>
  );
}
