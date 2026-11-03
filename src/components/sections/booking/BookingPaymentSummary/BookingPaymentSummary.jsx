import {
  formatMoney,
  formatShortDate,
  getCancellationDate,
  parseDate,
} from '../../../../utils/booking';
import {
  normalizeTravelers,
  travelerLabel,
  travelerLineItems,
} from '../../../../utils/travelers';
import { calculatePackageAmounts } from '../../../../utils/pricing';
import styles from './BookingPaymentSummary.module.css';

function BookingPaymentSummary({ pkg, dateValue, travelers, details }) {
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
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  return (
    <aside className={styles.sidebar} aria-label="Order summary">
      <div className={styles.card}>
        <h2 className={styles.title}>Order summary</h2>
        <div>
          <p className={styles.packageTitle}>{pkg.title}</p>
          <p className={styles.packageMeta}>
            {dateLabel} · {travelerLabel(normalizedTravelers)}
          </p>
        </div>

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
          <span>Total</span>
          <strong>{formatMoney(pricing.total, pkg.currency)}</strong>
        </div>

        <p className={styles.badge}>
          ✓ Free cancellation until {formatShortDate(cancellationDate)}
        </p>
      </div>

      <div className={styles.secure}>
        <h2 className={styles.secureTitle}>Secure checkout</h2>
        <p className={styles.secureText}>
          Your payment is processed by Stripe, a PCI-DSS Level 1 certified
          provider. Card details never touch Pili servers.
        </p>
      </div>
    </aside>
  );
}

export default BookingPaymentSummary;
