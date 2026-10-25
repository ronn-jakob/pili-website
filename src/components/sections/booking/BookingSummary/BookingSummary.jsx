import {
  formatLongDate,
  formatMoney,
  formatShortDate,
  getCancellationDate,
  parseDate,
} from '../../../../utils/booking';
import styles from './BookingSummary.module.css';

function BookingSummary({ pkg, dateValue, travelers }) {
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
        </dl>

        <div className={styles.divider} />

        <div className={styles.total}>
          <span>Total</span>
          <strong>{formatMoney(total, pkg.currency)}</strong>
        </div>

        <p className={styles.badge}>
          ✓ Free cancellation until {formatShortDate(cancellationDate)}
        </p>
      </div>

      <div className={styles.help}>
        <h2 className={styles.helpTitle}>Need help?</h2>
        <p className={styles.helpText}>
          Message us or call +63 972 839 9826. We’re happy to assist with your
          booking.
        </p>
      </div>
    </aside>
  );
}

export default BookingSummary;
