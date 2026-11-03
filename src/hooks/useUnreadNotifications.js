import { useEffect, useState } from 'react';
import { subscribeToNotifications } from '../lib/notifications';

function useUnreadNotifications(userId) {
  const [snapshotState, setSnapshotState] = useState({
    userId: null,
    count: 0,
  });

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let active = true;

    const unsubscribe = subscribeToNotifications(
      userId,
      (items) => {
        if (active) {
          setSnapshotState({
            userId,
            count: items.filter((item) => !item.readAt).length,
          });
        }
      },
      () => {
        if (active) {
          setSnapshotState({ userId, count: 0 });
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  return snapshotState.userId === userId
    ? snapshotState.count
    : 0;
}

export default useUnreadNotifications;
