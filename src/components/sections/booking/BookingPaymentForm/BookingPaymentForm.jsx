import { Link } from 'react-router-dom';
import { formatMoney } from '../../../../utils/booking';
import StripePaymentElement from '../StripePaymentElement/StripePaymentElement';
import styles from './BookingPaymentForm.module.css';

function BookingPaymentForm({
  pkg,
  backState,
  total,
  billingEmail,
  onPay,
  onPaymentSuccess,
  onCancelPayment,
  submitting = false,
  error = '',
  paymentIntent = null,
}) {
  if (paymentIntent) {
    return (
      <StripePaymentElement
        clientSecret={paymentIntent.clientSecret}
        total={total}
        currency={pkg.currency}
        billingEmail={billingEmail}
        onSuccess={onPaymentSuccess}
        onCancel={onCancelPayment}
      />
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        if (!submitting) {
          onPay?.();
        }
      }}
    >
      <section className={styles.card}>
        <div className={styles.stripeHeader}>
          <h2 className={styles.title}>Pay with Stripe</h2>
          <span className={styles.testBadge}>Test mode</span>
        </div>

        <p className={styles.helper}>
          Open Stripe&apos;s secure payment form without leaving this page. No
          real charge will be made.
        </p>

        <div className={styles.amountRow}>
          <span>Total due</span>
          <strong>{formatMoney(total, pkg.currency)}</strong>
        </div>

        <p className={styles.secureNote}>
          Use test card 4242 4242 4242 4242 with any future expiry date and any
          CVC.
        </p>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Link
          to={`/packages/${pkg.id}/book/review`}
          state={backState}
          className={styles.back}
        >
          ← Back to review
        </Link>
        <button
          type="submit"
          className={styles.payButton}
          disabled={submitting}
        >
          {submitting
            ? 'Preparing secure payment…'
            : 'Continue to secure payment'}
        </button>
      </div>
    </form>
  );
}

export default BookingPaymentForm;
