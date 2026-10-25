import { Link } from 'react-router-dom';
import styles from './PackageDetailHero.module.css';

function PackageDetailHero({ pkg }) {
  return (
    <section className={styles.hero} aria-labelledby="package-detail-title">
      <img
        src={pkg.heroImage}
        alt=""
        className={styles.background}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.content}>
        <Link to="/packages" className={styles.back}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M19 12H5M5 12L11 6M5 12L11 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to packages
        </Link>

        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/packages">Packages</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{pkg.title}</span>
        </nav>

        <h1 id="package-detail-title" className={styles.title}>
          {pkg.title}
        </h1>
        <p className={styles.location}>{pkg.location}</p>

        <div className={styles.rating}>
          <span className={styles.star} aria-hidden="true">
            ★
          </span>
          <span>
            {pkg.rating} ({pkg.reviewCount} reviews)
          </span>
        </div>

        <div className={styles.tags}>
          <span className={styles.tag}>{pkg.durationLabel}</span>
          <span className={styles.tag}>{pkg.category}</span>
        </div>
      </div>
    </section>
  );
}

export default PackageDetailHero;
