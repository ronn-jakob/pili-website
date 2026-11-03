import { useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import BookingHeader from '../../components/sections/booking/BookingHeader/BookingHeader';
import BookingPaymentForm from '../../components/sections/booking/BookingPaymentForm/BookingPaymentForm';
import BookingPaymentSummary from '../../components/sections/booking/BookingPaymentSummary/BookingPaymentSummary';
import useTravelerAuth from '../../context/useTravelerAuth';
import usePublicPackage from '../../hooks/usePublicPackage';
import {
  bookingErrorMessage,
  createBooking,
} from '../../lib/bookings';
import {
  createPaymentIntent,
  notifyBookingCreated,
  paymentErrorMessage,
  releaseBooking,
} from '../../lib/paymentApi';
import {
  normalizeTravelers,
} from '../../utils/travelers';
import { calculatePackageAmounts } from '../../utils/pricing';
import styles from './BookingPaymentPage.module.css';

function BookingPaymentPage() {
  const { packageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { traveler } = useTravelerAuth();
  const { pkg, loading } = usePublicPackage(packageId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const state = location.state;

  if (loading && !pkg) {
    return (
      <main className="page-loading">
        <p>Loading payment…</p>
      </main>
    );
  }

  if (!pkg) {
    return <Navigate to="/packages" replace />;
  }

  if (!state?.details) {
    return <Navigate to={`/packages/${pkg.id}/book`} replace />;
  }

  const { date, details, departureId } = state;
  const travelers = normalizeTravelers(state.travelers);
  const pricing = calculatePackageAmounts(pkg, travelers, date);
  const total = pricing.total;
  const backState = {
    date,
    travelers,
    details,
    departureId,
  };

  const handlePay = async () => {
    if (submitting) {
      return;
    }

    if (!traveler) {
      setError('Sign in as a traveler before paying.');
      return;
    }

    if (!departureId) {
      setError(
        'Choose a departure from the tour page before continuing to payment.',
      );
      return;
    }

    setSubmitting(true);
    setError('');

    let booking = null;

    try {
      booking = await createBooking({
        departureId,
        traveler,
        details,
        travelers: {
          adults: travelers.adults,
          children: travelers.children,
          infants: travelers.infants,
          total: travelers.total,
        },
      });

      const intent = await createPaymentIntent(booking.id);

      try {
        await notifyBookingCreated(booking.id);
      } catch {
        // The booking and payment flow continue even if the notification fails.
      }

      if (!intent.clientSecret || !intent.paymentIntentId) {
        throw new Error(
          'Stripe did not return a payment form.',
        );
      }

      setPaymentIntent({
        clientSecret: intent.clientSecret,
        paymentIntentId: intent.paymentIntentId,
        bookingId: booking.id,
      });
      setSubmitting(false);
    } catch (paymentError) {
      if (booking?.id) {
        try {
          await releaseBooking(booking.id);
        } catch {
          // The pending booking can be cleaned up manually if release fails.
        }
      }

      setError(
        paymentError.code?.startsWith('booking/')
          ? bookingErrorMessage(paymentError)
          : paymentErrorMessage(paymentError),
      );
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    navigate(
      `/bookings?stripe=success&payment_intent=${encodeURIComponent(
        paymentIntentId,
      )}`,
    );
  };

  const handleCancelPayment = async () => {
    if (!paymentIntent) {
      return;
    }

    try {
      await releaseBooking(
        paymentIntent.bookingId,
        paymentIntent.paymentIntentId,
      );
    } catch (cancelError) {
      setError(paymentErrorMessage(cancelError));
      return;
    }

    setPaymentIntent(null);
    setError('');
    navigate(`/packages/${pkg.id}/book/review`, {
      state: backState,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <BookingHeader
          pkg={pkg}
          title="Payment"
          subtitle="Secure payment powered by Stripe"
          activeStep={3}
        />

        <div className={styles.grid}>
          <div className={styles.left}>
            <BookingPaymentForm
              pkg={pkg}
              backState={backState}
              total={total}
              billingEmail={details.email || traveler?.email || ''}
              onPay={handlePay}
              onPaymentSuccess={handlePaymentSuccess}
              onCancelPayment={handleCancelPayment}
              submitting={submitting}
              error={error}
              paymentIntent={paymentIntent}
            />
          </div>

          <BookingPaymentSummary
            pkg={pkg}
            dateValue={date}
            travelers={travelers}
            details={details}
          />
        </div>
      </div>
    </main>
  );
}

export default BookingPaymentPage;
