import styles from './BookingTourCard.module.css';

function BookingTourCard({ pkg, travelers }) {
  return (
    <article className={styles.card}>
      <img src={pkg.heroImage} alt="" className={styles.thumbnail} />

      <div className={styles.body}>
        <h2 className={styles.title}>{pkg.title}</h2>
        <p className={styles.meta}>
          {pkg.category} · {pkg.shortPlace} · Group of {travelers}
        </p>
        <p className={styles.cancellation}>
          Free cancellation up to {pkg.cancellationHours} hours before
        </p>
      </div>
    </article>
  );
}

export default BookingTourCard;
