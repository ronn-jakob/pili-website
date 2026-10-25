import { useState } from 'react';
import styles from './PackageReviews.module.css';

const filters = ['All', '5 stars', 'Guides', 'Boats'];

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

function PackageReviews({ pkg }) {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <h2 id="reviews-title" className={styles.heading}>
          Reviews
        </h2>

        <div className={styles.scoreRow}>
          <StarIcon />
          <span className={styles.score}>{pkg.rating}</span>
          <span className={styles.outOf}>/5</span>
          <div className={styles.scoreMeta}>
            <span className={styles.verdict}>Very Good</span>
            <span className={styles.count}>{pkg.reviewCount} reviews</span>
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

        <div className={styles.cards}>
          {pkg.reviews.map((review) => (
            <article key={review.author} className={styles.card}>
              <p className={styles.stars} aria-label="5 out of 5 stars">
                ★★★★★
              </p>
              <p className={styles.quote}>{review.quote}</p>
              <p className={styles.author}>
                {review.author} · {review.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PackageReviews;
