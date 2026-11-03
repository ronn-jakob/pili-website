import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTravelerAuth from '../../context/useTravelerAuth';
import { auth } from '../../lib/firebase';
import {
  markAllNotificationsRead,
  markNotificationRead,
  notificationErrorMessage,
  subscribeToNotifications,
} from '../../lib/notifications';
import styles from './NotificationsPage.module.css';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function NotificationsPage() {
  const { traveler } = useTravelerAuth();
  const userId = traveler?.uid ?? auth.currentUser?.uid ?? '';
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let active = true;

    const unsubscribe = subscribeToNotifications(
      userId,
      (items) => {
        if (active) {
          setNotifications(items);
          setLoading(false);
        }
      },
      (loadError) => {
        if (active) {
          setError(notificationErrorMessage(loadError));
          setLoading(false);
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const visibleNotifications = useMemo(
    () =>
      activeFilter === 'unread'
        ? notifications.filter((notification) => !notification.readAt)
        : notifications,
    [activeFilter, notifications],
  );

  const handleOpen = async (notification) => {
    if (!notification.readAt) {
      try {
        await markNotificationRead(notification.id);
      } catch {
        // Do not block navigation if the read marker fails.
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    setError('');

    try {
      await markAllNotificationsRead(notifications);
    } catch (markError) {
      setError(notificationErrorMessage(markError));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              Booking, payment and review updates from Pili.
            </p>
          </div>

          <button
            type="button"
            className={styles.markAll}
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? 'Marking…' : 'Mark all as read'}
          </button>
        </header>

        <div className={styles.toolbar}>
          <div
            className={styles.filters}
            role="group"
            aria-label="Filter notifications"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`${styles.filter}${
                  activeFilter === filter.value
                    ? ` ${styles.filterActive}`
                    : ''
                }`}
                aria-pressed={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                {filter.value === 'unread' && unreadCount > 0
                  ? ` (${unreadCount})`
                  : ''}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.list}>
          {loading ? (
            <p className={styles.empty}>Loading notifications…</p>
          ) : visibleNotifications.length > 0 ? (
            visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`${styles.item}${
                  notification.readAt ? '' : ` ${styles.unread}`
                }`}
                onClick={() => handleOpen(notification)}
              >
                <span
                  className={styles.dot}
                  aria-hidden="true"
                />
                <span className={styles.content}>
                  <span className={styles.itemTitle}>
                    {notification.title}
                  </span>
                  <span className={styles.message}>
                    {notification.message}
                  </span>
                  <span className={styles.date}>
                    {formatDate(notification.createdAtDate)}
                  </span>
                </span>
                {!notification.readAt && (
                  <span className={styles.unreadLabel}>New</span>
                )}
              </button>
            ))
          ) : (
            <p className={styles.empty}>
              {activeFilter === 'unread'
                ? 'You have no unread notifications.'
                : 'You have no notifications yet.'}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default NotificationsPage;
