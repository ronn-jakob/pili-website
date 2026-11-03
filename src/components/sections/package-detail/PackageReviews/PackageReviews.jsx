import { useState } from 'react';
import styles from './PackageReviews.module.css';

const filters = [
  'All',
  '5 stars',
  '4 stars',
  '3 stars',
  '2 stars',
  '1 star',
];

function StarIcon() {
  return (
    <svg
      className={styles.starIcon}
      xmlns="http://www.w3.org/2000/svg"
      width="45"
      height="45"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z" />
    </svg>
  );
}

function reviewRating(review) {
  return Math.max(1, Math.min(5, Number(review.rating) || 5));
}

function reviewDate(review) {
  if (review.createdAtDate) {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(review.createdAtDate);
  }

  return review.date ?? '';
}

function verdictFor(rating) {
  if (rating >= 4.5) {
    return 'Very Good';
  }

  if (rating >= 3.5) {
    return 'Good';
  }

  return 'Fair';
}

function PackageReviews({ pkg, reviews = null }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const remoteReviews =
    Array.isArray(reviews) && reviews.length > 0;
  const displayReviews = remoteReviews
    ? reviews
    : pkg.reviews ?? [];
  const ratingValue = remoteReviews
    ? reviews.reduce(
        (total, review) => total + reviewRating(review),
        0,
      ) / reviews.length
    : Number(pkg.rating) || 0;
  const reviewCount = remoteReviews
    ? reviews.length
    : pkg.reviewCount ?? 0;
  const visibleReviews =
    activeFilter === 'All'
      ? displayReviews
      : displayReviews.filter(
          (review) =>
            Math.round(reviewRating(review)) ===
            Number(activeFilter.charAt(0)),
        );

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <h2 id="reviews-title" className={styles.heading}>
          Reviews
        </h2>

        <div className={styles.scoreRow}>
          <StarIcon />
          <span className={styles.score}>
            {ratingValue.toFixed(1)}
          </span>
          <span className={styles.outOf}>/5</span>
          <div className={styles.scoreMeta}>
            <span className={styles.verdict}>
              {verdictFor(ratingValue)}
            </span>
            <span className={styles.count}>
              {reviewCount}{' '}
              {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        <div className={styles.filters}>
          <span className={styles.filterLabel}>Filter:</span>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.filter}${
                activeFilter === filter ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {visibleReviews.length > 0 ? (
          <div className={styles.cards}>
            {visibleReviews.map((review, index) => {
              const rating = reviewRating(review);
              const stars = '★'.repeat(rating);
              const emptyStars = '☆'.repeat(5 - rating);

              return (
                <article
                  key={review.id ?? review.author ?? index}
                  className={styles.card}
                >
                  <p
                    className={styles.stars}
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {stars}
                    {emptyStars}
                  </p>
                  {review.title && (
                    <h3 className={styles.reviewTitle}>
                      {review.title}
                    </h3>
                  )}
                  <p className={styles.quote}>
                    {review.comment ?? review.quote}
                  </p>
                  <p className={styles.author}>
                    {review.travelerName ?? review.author}
                    {reviewDate(review)
                      ? ` · ${reviewDate(review)}`
                      : ''}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>
            No {activeFilter === 'All' ? '' : activeFilter} reviews
            yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default PackageReviews;
