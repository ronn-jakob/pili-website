import {
  formatLongDate,
  formatMoney,
  getCancellationDate,
  parseDate,
} from '../../../../utils/booking';
import styles from './BookingReviewSummary.module.css';

function BookingReviewSummary({ pkg, dateValue, travelers, details }) {
  const date = parseDate(dateValue);
  const cancellationDate = getCancellationDate(
    date,
    pkg.cancellationHours,
  );
  const subtotal = pkg.priceValue * travelers;
  const total = subtotal + pkg.serviceFee;

  return (
    <aside className={styles.sidebar} aria-label="Order summary">
      <div className={styles.card}>
        <h2 className={styles.title}>Order summary</h2>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{formatLongDate(date)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Travelers</dt>
            <dd>
              {travelers} {travelers === 1 ? 'person' : 'persons'}
            </dd>
          </div>
        </dl>

        <div className={styles.divider} />

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Ticket price</dt>
            <dd>
              {formatMoney(pkg.priceValue, pkg.currency)} × {travelers}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Service fee</dt>
            <dd>{formatMoney(pkg.serviceFee, pkg.currency)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Promo</dt>
            <dd>{details.promo || '—'}</dd>
          </div>
        </dl>

        <div className={styles.divider} />

        <div className={styles.total}>
          <span>Total due</span>
          <strong>{formatMoney(total, pkg.currency)}</strong>
        </div>
      </div>

      <div className={styles.policy}>
        <h2 className={styles.policyTitle}>Cancellation policy</h2>
        <p className={styles.policyText}>
          Free cancellation until {formatLongDate(cancellationDate)} 11:59 PM.
          After that, the booking is non-refundable.
        </p>
      </div>
    </aside>
  );
}

export default BookingReviewSummary;
