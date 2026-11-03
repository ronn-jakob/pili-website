import {
  formatLongDate,
  formatMoney,
  getCancellationDate,
  parseDate,
} from '../../../../utils/booking';
import {
  normalizeTravelers,
  travelerLabel,
  travelerLineItems,
} from '../../../../utils/travelers';
import { calculatePackageAmounts } from '../../../../utils/pricing';
import styles from './BookingReviewSummary.module.css';

function BookingReviewSummary({ pkg, dateValue, travelers, details }) {
  const date = parseDate(dateValue);
  const cancellationDate = getCancellationDate(
    date,
    pkg.cancellationHours,
  );
  const normalizedTravelers = normalizeTravelers(travelers);
  const pricing = calculatePackageAmounts(
    pkg,
    normalizedTravelers,
    dateValue,
  );
  const lineItems = travelerLineItems(pkg, normalizedTravelers);

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
            <dd>{travelerLabel(normalizedTravelers)}</dd>
          </div>
        </dl>

        <div className={styles.divider} />

        <dl className={styles.rows}>
          {lineItems.map((item) => (
            <div key={item.key} className={styles.row}>
              <dt>
                {item.label} × {item.count}
              </dt>
              <dd>{formatMoney(item.amount, pkg.currency)}</dd>
            </div>
          ))}
          {pricing.discount > 0 && (
            <div className={styles.row}>
              <dt>Discount</dt>
              <dd>-{formatMoney(pricing.discount, pkg.currency)}</dd>
            </div>
          )}
          <div className={styles.row}>
            <dt>Service fee</dt>
            <dd>{formatMoney(pricing.fees, pkg.currency)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Promo</dt>
            <dd>{details.promo || '—'}</dd>
          </div>
        </dl>

        <div className={styles.divider} />

        <div className={styles.total}>
          <span>Total due</span>
          <strong>{formatMoney(pricing.total, pkg.currency)}</strong>
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
