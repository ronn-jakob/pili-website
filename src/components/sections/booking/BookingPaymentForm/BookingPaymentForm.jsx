import { Link } from 'react-router-dom';
import applePayIcon from '../../../../Images/payments/apple-pay.svg';
import googlePayIcon from '../../../../Images/payments/google-pay.svg';
import { formatMoney } from '../../../../utils/booking';
import styles from './BookingPaymentForm.module.css';

function BookingPaymentForm({ pkg, backState, total }) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      <section className={styles.card}>
        <h2 className={styles.title}>Express checkout</h2>
        <div className={styles.express}>
          <button
            type="button"
            className={`${styles.expressButton} ${styles.applePay}`}
            aria-label="Pay with Apple Pay"
          >
            <img src={applePayIcon} alt="Apple Pay" />
          </button>
          <button
            type="button"
            className={`${styles.expressButton} ${styles.googlePay}`}
            aria-label="Pay with Google Pay"
          >
            <img src={googlePayIcon} alt="Google Pay" />
          </button>
        </div>
      </section>

      <div className={styles.orRow}>
        <span>or pay with card</span>
      </div>

      <section className={styles.card}>
        <h2 className={styles.title}>Card details</h2>
        <p className={styles.helper}>
          All fields are required. Your card is processed securely by Stripe.
        </p>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Cardholder name</span>
            <input
              type="text"
              name="cardholder"
              className={styles.input}
              placeholder="Name on card"
              autoComplete="cc-name"
            />
          </label>

          <label className={styles.field}>
            <span>Card number</span>
            <span className={styles.cardNumberWrap}>
              <input
                type="text"
                name="cardNumber"
                className={styles.input}
                placeholder="ACCT-000015"
                autoComplete="cc-number"
              />
              <span className={styles.cardBrands} aria-hidden="true">
                Visa · MC · Amex
              </span>
            </span>
          </label>

          <div className={styles.twoColumns}>
            <label className={styles.field}>
              <span>Expiry date</span>
              <input
                type="text"
                name="expiry"
                className={styles.input}
                placeholder="MM / YY"
                autoComplete="cc-exp"
              />
            </label>
            <label className={styles.field}>
              <span>CVC</span>
              <input
                type="text"
                name="cvc"
                className={styles.input}
                placeholder="123"
                autoComplete="cc-csc"
              />
            </label>
            <label className={styles.field}>
              <span>Billing ZIP / Postal code</span>
              <input
                type="text"
                name="postalCode"
                className={styles.input}
                placeholder="e.g. 2600"
                autoComplete="postal-code"
              />
            </label>
            <label className={styles.field}>
              <span>Country</span>
              <select
                name="country"
                className={styles.input}
                defaultValue="Philippines"
              >
                <option>Philippines</option>
                <option>Singapore</option>
                <option>United States</option>
                <option>Australia</option>
                <option>Japan</option>
              </select>
            </label>
          </div>

          <p className={styles.secureNote}>
            🔒 Payments are encrypted and processed by Stripe. Pili never stores
            your full card number.
          </p>
        </div>
      </section>

      <div className={styles.actions}>
        <Link
          to={`/packages/${pkg.id}/book/review`}
          state={backState}
          className={styles.back}
        >
          ← Back to review
        </Link>
        <button type="submit" className={styles.payButton}>
          Pay {formatMoney(total, pkg.currency)}
        </button>
      </div>
    </form>
  );
}

export default BookingPaymentForm;
