import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { formatMoney } from '../../../../utils/booking';
import styles from './StripePaymentElement.module.css';

const publishableKey = (
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
).trim();
const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1a66e5',
    colorBackground: '#ffffff',
    colorText: '#1f242e',
    colorDanger: '#b91c1c',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '10px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e0e5eb',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #1a66e5',
      boxShadow: '0 0 0 3px rgba(26, 102, 229, 0.12)',
    },
    '.Label': {
      fontWeight: '500',
    },
  },
};

function PaymentElementForm({
  total,
  currency,
  billingEmail,
  onSuccess,
  onCancel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || submitting) {
      return;
    }

    if (!billingEmail) {
      setError('A billing email is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: submitError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/bookings?stripe=success`,
            payment_method_data: {
              billing_details: {
                email: billingEmail,
              },
            },
          },
          redirect: 'if_required',
        });

      if (submitError) {
        setError(
          submitError.message ||
            'Stripe could not confirm this card payment.',
        );
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
        return;
      }

      if (paymentIntent?.status === 'processing') {
        setError(
          'Your payment is processing. Check My Bookings in a moment.',
        );
        return;
      }

      setError(
        'Stripe did not confirm this payment. Please try again.',
      );
    } catch (stripeError) {
      console.error('Stripe confirmPayment failed:', stripeError);
      setError(
        stripeError?.message ||
          'Stripe could not confirm this card payment.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Card details</h2>
          <span className={styles.testBadge}>Test mode</span>
        </div>

        <p className={styles.helper}>
          Card details are encrypted and handled by Stripe. No real charge will
          be made.
        </p>

        <div className={styles.elementWrap}>
          <PaymentElement
            options={{
              layout: 'tabs',
              wallets: {
                applePay: 'never',
                googlePay: 'never',
                link: 'never',
              },
              fields: {
                billingDetails: {
                  email: 'never',
                  name: 'auto',
                },
              },
            }}
          />
        </div>

        <p className={styles.testNote}>
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
        <button
          type="button"
          className={styles.cancel}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel payment
        </button>
        <button
          type="submit"
          className={styles.payButton}
          disabled={!stripe || !elements || submitting}
        >
          {submitting
            ? 'Processing payment…'
            : `Pay ${formatMoney(total, currency)}`}
        </button>
      </div>

      <p className={styles.secureNote}>
        <span aria-hidden="true">🔒</span> Secure checkout powered by Stripe
      </p>
    </form>
  );
}

function StripePaymentElement({
  clientSecret,
  total,
  currency,
  billingEmail,
  onSuccess,
  onCancel,
}) {
  const configurationError = stripePromise
    ? ''
    : 'Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env.local.';

  if (configurationError) {
    return (
      <p className={styles.error} role="alert">
        {configurationError}
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <PaymentElementForm
        total={total}
        currency={currency}
        billingEmail={billingEmail}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}

export default StripePaymentElement;
