import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import { getOperatorReviews } from '../../lib/reviews';
import styles from './OperatorReviewsPage.module.css';

function stars(rating) {
  const value = Math.max(1, Math.min(5, Number(rating) || 0));
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

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

function OperatorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    const uid = auth.currentUser?.uid ?? '';

    getOperatorReviews(uid)
      .then((items) => {
        if (active) {
          setReviews(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load customer feedback.');
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

  const average = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    return (
      reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
      reviews.length
    );
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const search = query.trim().toLowerCase();

    return reviews.filter(
      (review) =>
        !search ||
        (review.tourTitle ?? '').toLowerCase().includes(search) ||
        (review.title ?? '').toLowerCase().includes(search) ||
        (review.travelerName ?? '').toLowerCase().includes(search),
    );
  }, [reviews, query]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Organizer</span>
            <span aria-hidden="true">/</span>
            <span>Customer Feedback</span>
          </p>
          <h1 className={styles.title}>Customer Feedback</h1>
          <p className={styles.subtitle}>
            Published reviews for your tours. Only administrators can moderate
            reviews.
          </p>
        </div>
      </header>

      <div className={styles.summary}>
        <div>
          <span className={styles.summaryValue}>{reviews.length}</span>
          <span className={styles.summaryLabel}>Published reviews</span>
        </div>
        <div>
          <span className={styles.summaryValue}>
            {average ? average.toFixed(1) : '—'}
          </span>
          <span className={styles.summaryLabel}>Average rating</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search feedback</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tour, traveler or review title…"
          />
        </label>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Loading feedback…</p>
        ) : visibleReviews.length === 0 ? (
          <p className={styles.empty}>No published reviews yet.</p>
        ) : (
          <div className={styles.list}>
            {visibleReviews.map((review) => (
              <article key={review.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <div>
                    <strong>{review.tourTitle || 'Tour'}</strong>
                    <span className={styles.muted}>
                      {review.travelerName || 'Traveler'} ·{' '}
                      {formatDate(review.createdAtDate)}
                    </span>
                  </div>
                  <span className={styles.rating} aria-label={`${review.rating} out of 5`}>
                    {stars(review.rating)}
                  </span>
                </div>
                <h2 className={styles.reviewTitle}>{review.title}</h2>
                <p className={styles.comment}>{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OperatorReviewsPage;
