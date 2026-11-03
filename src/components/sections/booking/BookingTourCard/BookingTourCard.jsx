import {
  normalizeTravelers,
  travelerLabel,
} from '../../../../utils/travelers';
import styles from './BookingTourCard.module.css';

function BookingTourCard({ pkg, travelers }) {
  const normalizedTravelers = normalizeTravelers(travelers);

  return (
    <article className={styles.card}>
      <img src={pkg.heroImage} alt="" className={styles.thumbnail} />

      <div className={styles.body}>
        <h2 className={styles.title}>{pkg.title}</h2>
        <p className={styles.meta}>
          {pkg.category} · {pkg.shortPlace} ·{' '}
          {travelerLabel(normalizedTravelers)}
        </p>
        <p className={styles.cancellation}>
          Free cancellation up to {pkg.cancellationHours} hours before
        </p>
      </div>
    </article>
  );
}

export default BookingTourCard;
