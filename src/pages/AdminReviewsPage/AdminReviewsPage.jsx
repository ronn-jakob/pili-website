import { useEffect, useMemo, useState } from 'react';
import { REVIEW_STATUS } from '../../lib/firestoreSchema';
import {
  getAdminReviews,
  moderateReview,
  reviewErrorMessage,
  reviewStatusLabel,
} from '../../lib/reviews';
import styles from './AdminReviewsPage.module.css';

const statusFilters = [
  { value: 'all', label: 'All' },
  {
    value: REVIEW_STATUS.pending,
    label: 'Pending',
  },
  {
    value: REVIEW_STATUS.published,
    label: 'Published',
  },
  {
    value: REVIEW_STATUS.hidden,
    label: 'Hidden',
  },
];

const statusClasses = {
  [REVIEW_STATUS.pending]: styles.pending,
  [REVIEW_STATUS.published]: styles.published,
  [REVIEW_STATUS.hidden]: styles.hidden,
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
}

function reviewStars(rating) {
  const value = Math.max(1, Math.min(5, Number(rating) || 0));
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    let active = true;

    getAdminReviews()
      .then((items) => {
        if (active) {
          setReviews(items);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(reviewErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const next = {
      [REVIEW_STATUS.pending]: 0,
      [REVIEW_STATUS.published]: 0,
      [REVIEW_STATUS.hidden]: 0,
    };

    for (const review of reviews) {
      if (next[review.moderationStatus] !== undefined) {
        next[review.moderationStatus] += 1;
      }
    }

    return next;
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const search = query.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesFilter =
        activeFilter === 'all' ||
        review.moderationStatus === activeFilter;
      const matchesQuery =
        !search ||
        (review.tourTitle ?? '').toLowerCase().includes(search) ||
        (review.travelerName ?? '').toLowerCase().includes(search) ||
        (review.bookingReference ?? '')
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesQuery;
    });
  }, [reviews, query, activeFilter]);

  const handleModerate = async (reviewId, status) => {
    setActionId(reviewId);
    setError('');

    try {
      await moderateReview(reviewId, status);
      setReviews(await getAdminReviews());
    } catch (moderationError) {
      setError(reviewErrorMessage(moderationError));
    } finally {
      setActionId('');
    }
  };

  const summaryCards = [
    {
      status: REVIEW_STATUS.pending,
      label: 'Pending',
      tone: styles.summaryPending,
    },
    {
      status: REVIEW_STATUS.published,
      label: 'Published',
      tone: styles.summaryPublished,
    },
    {
      status: REVIEW_STATUS.hidden,
      label: 'Hidden',
      tone: styles.summaryHidden,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Review Moderation</span>
          </p>
          <h1 className={styles.title}>Review Moderation</h1>
          <p className={styles.subtitle}>
            Approve traveler reviews before they appear on tour pages.
          </p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <button
            key={card.status}
            type="button"
            className={`${styles.summaryCard} ${card.tone}${
              activeFilter === card.status
                ? ` ${styles.summaryActive}`
                : ''
            }`}
            onClick={() =>
              setActiveFilter((current) =>
                current === card.status ? 'all' : card.status,
              )
            }
          >
            <span className={styles.summaryValue}>
              {counts[card.status]}
            </span>
            <span className={styles.summaryLabel}>{card.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>
            Search reviews
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m16.2 16.2 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tours, travelers or references…"
          />
        </label>

        <div
          className={styles.filters}
          role="group"
          aria-label="Filter reviews"
        >
          {statusFilters.map((filter) => (
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
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.tableCard}>
        {loading ? (
          <p className={styles.empty}>Loading reviews…</p>
        ) : visibleReviews.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Review</th>
                  <th>Tour</th>
                  <th>Traveler</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleReviews.map((review) => {
                  const busy = actionId === review.id;

                  return (
                    <tr key={review.id}>
                      <td className={styles.reviewCell}>
                        <span className={styles.stars}>
                          {reviewStars(review.rating)}
                        </span>
                        <strong>{review.title}</strong>
                        <p>{review.comment}</p>
                      </td>
                      <td>
                        <strong>{review.tourTitle || 'Tour'}</strong>
                        <span className={styles.subValue}>
                          {review.bookingReference}
                        </span>
                      </td>
                      <td>{review.travelerName || 'Traveler'}</td>
                      <td>{formatDate(review.createdAtDate)}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            statusClasses[review.moderationStatus] ?? ''
                          }`}
                        >
                          {reviewStatusLabel(
                            review.moderationStatus,
                          )}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {review.moderationStatus !==
                            REVIEW_STATUS.published && (
                            <button
                              type="button"
                              className={styles.approve}
                              onClick={() =>
                                handleModerate(
                                  review.id,
                                  REVIEW_STATUS.published,
                                )
                              }
                              disabled={busy}
                            >
                              {busy ? 'Saving…' : 'Approve'}
                            </button>
                          )}
                          {review.moderationStatus !==
                            REVIEW_STATUS.hidden && (
                            <button
                              type="button"
                              className={styles.hide}
                              onClick={() =>
                                handleModerate(
                                  review.id,
                                  REVIEW_STATUS.hidden,
                                )
                              }
                              disabled={busy}
                            >
                              Hide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No reviews found.</p>
        )}
      </section>
    </div>
  );
}

export default AdminReviewsPage;
